import { API_ENDPOINTS } from "@/constants/constants/api";
import {
  ACCESS_TOKEN_REFRESH_BUFFER_MS,
  AUTH_CLIENT,
} from "@/constants/constants/auth-client";
import { EUserRole } from "@/constants/enums/user.enum";
import { useAuthStore } from "@/features/auth/store/authStore";
import { env } from "@/lib/config/env";
import { refreshAccessToken } from "@/services/api-service";

export async function tryRestoreSession(): Promise<boolean> {
  const store = useAuthStore.getState();
  store.hydrateAuthStoreFromStorage();

  const initialState = useAuthStore.getState();
  if (initialState.accessToken && initialState.user?.role === EUserRole.ADMIN) {
    return true;
  }

  try {
    const shouldRefresh =
      !initialState.accessToken ||
      !initialState.expiresAt ||
      new Date(initialState.expiresAt).getTime() - Date.now() <=
        ACCESS_TOKEN_REFRESH_BUFFER_MS;

    if (shouldRefresh) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        return false;
      }
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      return false;
    }

    const userRes = await fetch(
      `${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.ACCOUNT.ME}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-auth-client": AUTH_CLIENT,
        },
        credentials: "include",
      },
    );

    if (!userRes.ok) return false;

    const userData = await userRes.json();
    if (userData?.status !== "success" || !userData?.data) return false;

    if (userData.data.role !== EUserRole.ADMIN) {
      store.clearAuth();
      return false;
    }

    const { expiresAt, expiresIn } = useAuthStore.getState();

    store.setAuth(token, userData.data, expiresAt, expiresIn);
    return true;
  } catch {
    store.clearAuth();
    return false;
  }
}
