import { API_ENDPOINTS } from "@/constants/constants/api";
import {
  ACCESS_TOKEN_REFRESH_BUFFER_MS,
  AUTH_CLIENT,
} from "@/constants/constants/auth-client";
import {
  LOCAL_API_ERROR_MESSAGES,
  resolveApiErrorMessage,
} from "@/constants/constants/api-error-messages";
import { type AuthUser, useAuthStore } from "@/features/auth/store/authStore";
import { env } from "@/lib/config/env";
import { redirectToLogin } from "@/lib/utils/navigation";
import { showErrorToast } from "@/lib/ui/toast";
import type { ApiError, ApiFieldErrorResponse, ApiResponse } from "@/types/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiServiceOptions extends Omit<RequestInit, "body" | "method"> {
  auth?: boolean;
  revalidate?: number;
  body?: BodyInit | null;
}

interface JsonApiServiceOptions extends Omit<ApiServiceOptions, "body"> {
  body?: unknown;
}

interface RefreshTokenResponseData {
  accessToken: string;
  expiresAt: string;
  expiresIn: number;
}

let ongoingRefresh: Promise<boolean> | null = null;

function buildApiUrl(path: string): string {
  return `${env.NEXT_PUBLIC_API_URL}${path}`;
}

function isJsonBody(body: unknown): boolean {
  return (
    body !== undefined &&
    body !== null &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams)
  );
}

function createApiError(
  statusCode: number,
  message: string,
  fields?: Record<string, string[]>,
  code?: number | string,
): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.fields = fields;
  error.code = code;

  return error;
}

function isFetchNetworkError(error: unknown): error is Error {
  return error instanceof Error && error.message === "Failed to fetch";
}

function toApiError(error: unknown): ApiError {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as ApiError).statusCode === "number"
  ) {
    return error as ApiError;
  }

  if (isFetchNetworkError(error)) {
    return createApiError(0, LOCAL_API_ERROR_MESSAGES.NETWORK_UNAVAILABLE);
  }

  if (error instanceof Error) {
    return createApiError(0, error.message);
  }

  return createApiError(0, LOCAL_API_ERROR_MESSAGES.NETWORK_UNAVAILABLE);
}

async function safeFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error: unknown) {
    const apiError = toApiError(error);
    if (apiError.message === LOCAL_API_ERROR_MESSAGES.NETWORK_UNAVAILABLE) {
      showErrorToast(LOCAL_API_ERROR_MESSAGES.NETWORK_UNAVAILABLE, {
        toastId: "network-error",
      });
    }
    throw apiError;
  }
}

function hasPagination(
  payload: ApiResponse<unknown>,
): payload is ApiResponse<unknown> & {
  pagination: NonNullable<ApiResponse<unknown>["pagination"]>;
} {
  return payload.pagination !== undefined;
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

async function parseApiError(response: Response): Promise<ApiError> {
  const payload = await readJson<ApiFieldErrorResponse>(response).catch(
    () => undefined,
  );

  return createApiError(
    response.status,
    resolveApiErrorMessage(payload?.message, response.status),
    payload?.error?.fields,
    payload?.error?.code ?? payload?.code,
  );
}

function shouldRefreshAccessToken(): boolean {
  const { accessToken, expiresAt } = useAuthStore.getState();

  if (!accessToken || !expiresAt) {
    return true;
  }

  return (
    new Date(expiresAt).getTime() - Date.now() <= ACCESS_TOKEN_REFRESH_BUFFER_MS
  );
}

function buildAuthHeaders(headers?: HeadersInit): Headers {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("x-auth-client", AUTH_CLIENT);
  return nextHeaders;
}

async function fetchCurrentUserAfterRefresh(
  accessToken: string,
): Promise<AuthUser> {
  const response = await safeFetch(buildApiUrl(API_ENDPOINTS.ACCOUNT.ME), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-auth-client": AUTH_CLIENT,
    },
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const payload = await readJson<ApiResponse<AuthUser>>(response);
  return payload.data;
}

async function doRefresh(): Promise<boolean> {
  let response: Response;

  try {
    response = await safeFetch(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN), {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: buildAuthHeaders(),
    });
  } catch {
    return false;
  }

  if (!response.ok) {
    useAuthStore.getState().clearAuth();
    redirectToLogin();
    return false;
  }

  const payload = await readJson<ApiResponse<RefreshTokenResponseData>>(response);

  useAuthStore.getState().setAccessToken(
    payload.data.accessToken,
    payload.data.expiresAt,
    payload.data.expiresIn,
  );

  try {
    const user = await fetchCurrentUserAfterRefresh(payload.data.accessToken);
    useAuthStore.getState().setAuth(
      payload.data.accessToken,
      user,
      payload.data.expiresAt,
      payload.data.expiresIn,
    );
  } catch {
    useAuthStore.getState().clearAuth();
    redirectToLogin();
    return false;
  }

  return true;
}

async function refreshAccessToken(force = false): Promise<boolean> {
  const state = useAuthStore.getState();

  if (
    !force &&
    state.accessToken &&
    state.expiresAt &&
    !shouldRefreshAccessToken()
  ) {
    return true;
  }

  if (ongoingRefresh) {
    return ongoingRefresh;
  }

  ongoingRefresh = doRefresh().finally(() => {
    ongoingRefresh = null;
  });

  return ongoingRefresh;
}

class ApiService {
  async get<TResponse>(
    path: string,
    config?: ApiServiceOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, "GET", config);
  }

  async post<TResponse, TPayload = unknown>(
    path: string,
    payload?: TPayload,
    config?: JsonApiServiceOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, "POST", {
      ...config,
      body: payload,
    });
  }

  async put<TResponse, TPayload = unknown>(
    path: string,
    payload?: TPayload,
    config?: JsonApiServiceOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, "PUT", {
      ...config,
      body: payload,
    });
  }

  async patch<TResponse, TPayload = unknown>(
    path: string,
    payload?: TPayload,
    config?: JsonApiServiceOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, "PATCH", {
      ...config,
      body: payload,
    });
  }

  async delete<TResponse>(
    path: string,
    config?: ApiServiceOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, "DELETE", config);
  }

  private async request<TResponse>(
    path: string,
    method: HttpMethod,
    config: JsonApiServiceOptions = {},
    retried = false,
  ): Promise<TResponse> {
    const { auth, body, headers, revalidate, ...requestConfig } = config;
    const requestHeaders = buildAuthHeaders(headers);

    if (auth) {
      const currentAccessToken = useAuthStore.getState().accessToken;

      if (!currentAccessToken || shouldRefreshAccessToken()) {
        if (!retried) {
          const refreshed = await refreshAccessToken();

          if (refreshed) {
            return this.request<TResponse>(path, method, config, true);
          }
        }

        if (!useAuthStore.getState().accessToken) {
          throw createApiError(401, LOCAL_API_ERROR_MESSAGES.SESSION_EXPIRED);
        }
      }

      const latestAccessToken = useAuthStore.getState().accessToken;

      if (!latestAccessToken) {
        throw createApiError(401, LOCAL_API_ERROR_MESSAGES.SESSION_EXPIRED);
      }

      requestHeaders.set("Authorization", `Bearer ${latestAccessToken}`);
    }

    const requestBody = isJsonBody(body) ? JSON.stringify(body) : body;

    if (isJsonBody(body) && !requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }

    const response = await safeFetch(buildApiUrl(path), {
      ...requestConfig,
      method,
      headers: requestHeaders,
      body: requestBody as BodyInit | null | undefined,
      credentials: "include",
      next: revalidate !== undefined ? { revalidate } : undefined,
    });

    if (!response.ok) {
      const error = await parseApiError(response);

      if (auth && !retried && error.statusCode === 401) {
        const refreshed = await refreshAccessToken(true);

        if (refreshed) {
          return this.request<TResponse>(path, method, config, true);
        }

        useAuthStore.getState().clearAuth();
        redirectToLogin();
      }

      throw error;
    }

    const payload = await readJson<ApiResponse<TResponse>>(response);

    if (hasPagination(payload)) {
      return {
        data: payload.data,
        pagination: payload.pagination,
      } as TResponse;
    }

    return payload.data;
  }
}

export const apiService = new ApiService();
export { refreshAccessToken };
export type { ApiServiceOptions };
