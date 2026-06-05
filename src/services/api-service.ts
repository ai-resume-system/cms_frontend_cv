import { API_ENDPOINTS } from "@/constants/constants/api";
import {
  ACCESS_TOKEN_REFRESH_BUFFER_MS,
  AUTH_CLIENT,
} from "@/constants/constants/auth-client";
import { useAuthStore } from "@/features/auth/store/authStore";
import { env } from "@/lib/config/env";
import { ApiError, ApiResponse } from "@/types/api";

interface ApiServiceOptions extends RequestInit {
  auth?: boolean;
  revalidate?: number;
}

let ongoingRefresh: Promise<boolean> | null = null;

function shouldRefreshAccessToken(): boolean {
  const { accessToken, expiresAt } = useAuthStore.getState();
  if (!accessToken || !expiresAt) {
    return true;
  }

  return (
    new Date(expiresAt).getTime() - Date.now() <= ACCESS_TOKEN_REFRESH_BUFFER_MS
  );
}

async function doRefresh(): Promise<boolean> {
  try {
    const refreshResponse = await fetch(
      `${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-auth-client": AUTH_CLIENT,
        },
      },
    );

    if (!refreshResponse.ok) {
      throw new Error("Refresh token request failed.");
    }

    const refreshData = await refreshResponse.json();
    if (refreshData?.status === "success" && refreshData?.data?.accessToken) {
      useAuthStore
        .getState()
        .setAccessToken(
          refreshData.data.accessToken,
          refreshData.data.expiresAt,
          refreshData.data.expiresIn,
        );
      return true;
    }

    throw new Error("Refresh token payload invalid.");
  } catch {
    useAuthStore.getState().clearAuth();
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
    return false;
  }
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

async function request<T>(
  path: string,
  options: ApiServiceOptions = {},
): Promise<T> {
  const { auth = false, revalidate, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("x-auth-client", AUTH_CLIENT);

  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!requestHeaders.has("Content-Type") && init.body && !isFormData) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken || shouldRefreshAccessToken()) {
      const refreshed = await refreshAccessToken();
      if (!refreshed && !useAuthStore.getState().accessToken) {
        throw {
          statusCode: 401,
          message: "Phien dang nhap da het han.",
        } satisfies ApiError;
      }
    }

    const token = useAuthStore.getState().accessToken;
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: requestHeaders,
    credentials: "include",
    next: revalidate !== undefined ? { revalidate } : undefined,
  });

  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken(true);

    if (refreshed) {
      const retryHeaders = new Headers(requestHeaders);
      const newToken = useAuthStore.getState().accessToken;

      if (newToken) {
        retryHeaders.set("Authorization", `Bearer ${newToken}`);
      }

      const retryResponse = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
        ...init,
        headers: retryHeaders,
        credentials: "include",
        next: revalidate !== undefined ? { revalidate } : undefined,
      });

      const retryPayload = await retryResponse.json().catch(() => null);
      if (!retryResponse.ok || retryPayload?.status === "error") {
        throw {
          statusCode: retryResponse.status,
          message:
            retryPayload?.message ??
            `Yeu cau that bai: ${retryResponse.status}`,
        } satisfies ApiError;
      }

      if (
        retryPayload &&
        typeof retryPayload === "object" &&
        "pagination" in retryPayload
      ) {
        return {
          data: retryPayload.data,
          pagination: retryPayload.pagination,
        } as T;
      }

      return (retryPayload as ApiResponse<T>).data;
    }

    useAuthStore.getState().clearAuth();
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.status === "error") {
    throw {
      statusCode: response.status,
      message: payload?.message ?? `Yeu cau that bai: ${response.status}`,
      code: payload?.error?.code,
      fields: payload?.error?.fields,
    } satisfies ApiError;
  }

  if (payload && typeof payload === "object" && "pagination" in payload) {
    return {
      data: payload.data,
      pagination: payload.pagination,
    } as T;
  }

  return (payload as ApiResponse<T>).data;
}

export const apiService = {
  get: <T>(path: string, options?: ApiServiceOptions) =>
    request<T>(path, {
      ...options,
      method: "GET",
    }),

  post: <T>(path: string, body?: unknown, options?: ApiServiceOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: ApiServiceOptions) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: ApiServiceOptions) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),

  delete: <T>(path: string, options?: ApiServiceOptions) =>
    request<T>(path, {
      ...options,
      method: "DELETE",
    }),
};

export { refreshAccessToken };
export type { ApiServiceOptions };
