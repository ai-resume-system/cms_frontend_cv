import { env } from "@/lib/config/env";
import { useAuthStore } from "@/features/auth/store/authStore";
import { ApiResponse, ApiError } from "@/types/api";

interface ApiServiceOptions extends RequestInit {
  auth?: boolean;
  revalidate?: number;
}

let isRefreshing = false;

async function request<T>(
  path: string,
  options: ApiServiceOptions = {},
): Promise<T> {
  const { auth = false, revalidate, headers, ...init } = options;

  const requestHeaders = new Headers(headers);

  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!requestHeaders.has("Content-Type") && init.body && !isFormData) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
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

  if (
    response.status === 401 &&
    auth &&
    typeof window !== "undefined" &&
    !isRefreshing
  ) {
    isRefreshing = true;
    try {
      const refreshResponse = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (
          refreshData?.status === "success" &&
          refreshData?.data?.accessToken
        ) {
          const newToken = refreshData.data.accessToken;
          useAuthStore.getState().setAccessToken(newToken);

          isRefreshing = false;
          requestHeaders.set("Authorization", `Bearer ${newToken}`);

          const retryResponse = await fetch(
            `${env.NEXT_PUBLIC_API_URL}${path}`,
            {
              ...init,
              headers: requestHeaders,
              credentials: "include",
              next: revalidate !== undefined ? { revalidate } : undefined,
            },
          );

          const retryPayload = await retryResponse.json().catch(() => null);
          if (!retryResponse.ok || retryPayload?.status === "error") {
            throw {
              statusCode: retryResponse.status,
              message:
                retryPayload?.message ??
                `Yêu cầu thất bại: ${retryResponse.status}`,
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
            } as any;
          }
          return (retryPayload as ApiResponse<T>).data;
        }
      }

      useAuthStore.getState().clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } catch (e) {
      isRefreshing = false;
      throw e;
    } finally {
      isRefreshing = false;
    }
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.status === "error") {
    throw {
      statusCode: response.status,
      message: payload?.message ?? `Yêu cầu thất bại: ${response.status}`,
      code: payload?.error?.code,
      fields: payload?.error?.fields,
    } satisfies ApiError;
  }

  if (payload && typeof payload === "object" && "pagination" in payload) {
    return {
      data: payload.data,
      pagination: payload.pagination,
    } as any;
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
export type { ApiServiceOptions };
