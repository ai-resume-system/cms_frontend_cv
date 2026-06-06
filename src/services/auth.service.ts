import { API_ENDPOINTS } from "@/constants/constants/api";
import { apiService } from "@/services/api-service";

interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  expiresIn: number;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiService.post<LoginResponse, LoginPayload>(
    API_ENDPOINTS.AUTH.LOGIN,
    payload,
  );
}

export async function logout(): Promise<void> {
  await apiService.post<void>(API_ENDPOINTS.AUTH.LOGOUT, undefined, {
    auth: true,
  });
}
