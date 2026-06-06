import { API_ENDPOINTS } from "@/constants/constants/api";
import { apiService } from "@/services/api-service";
import type { AuthUser } from "@/features/auth/store/authStore";

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function fetchCurrentAdmin(): Promise<AuthUser> {
  return apiService.get<AuthUser>(API_ENDPOINTS.ACCOUNT.ME, {
    auth: true,
    cache: "no-store",
  });
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await apiService.patch<void, ChangePasswordPayload>(
    API_ENDPOINTS.ACCOUNT.CHANGE_PASSWORD,
    payload,
    { auth: true },
  );
}
