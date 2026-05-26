import { env } from "@/lib/config/env";
import { useAuthStore } from "@/features/auth/store/authStore";

export async function tryRestoreSession(): Promise<boolean> {
  const store = useAuthStore.getState();

  if (store.isAuthenticated && store.accessToken && store.user) {
    return true;
  }

  try {
    const refreshRes = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!refreshRes.ok) return false;

    const refreshData = await refreshRes.json();
    if (refreshData?.status !== "success" || !refreshData?.data?.accessToken) {
      return false;
    }

    const token = refreshData.data.accessToken;

    const userRes = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/v1/account/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      },
    );

    if (!userRes.ok) return false;

    const userData = await userRes.json();
    if (userData?.status !== "success" || !userData?.data) return false;

    store.setAuth(token, userData.data);
    return true;
  } catch {
    return false;
  }
}
