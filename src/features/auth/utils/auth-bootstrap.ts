import { ACCESS_TOKEN_REFRESH_BUFFER_MS } from "@/constants/constants/auth-client";
import { CMS_ROUTES } from "@/constants/constants/routes";
import { EUserRole } from "@/constants/enums/user.enum";
import { useAuthStore } from "@/features/auth/store/authStore";
import { redirectToLogin } from "@/lib/utils/navigation";
import { fetchCurrentAdmin } from "@/services/account.service";
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

    const user = await fetchCurrentAdmin();

    if (user.role !== EUserRole.ADMIN) {
      store.clearAuth();
      redirectToLogin();
      return false;
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      return false;
    }

    const { expiresAt, expiresIn } = useAuthStore.getState();
    store.setAuth(token, user, expiresAt, expiresIn);

    return true;
  } catch {
    store.clearAuth();

    if (
      typeof window !== "undefined" &&
      window.location.pathname !== CMS_ROUTES.LOGIN
    ) {
      redirectToLogin();
    }

    return false;
  }
}
