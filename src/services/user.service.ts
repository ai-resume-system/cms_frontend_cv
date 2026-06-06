import { API_ENDPOINTS } from "@/constants/constants/api";
import { EUserRole, EUserStatus } from "@/constants/enums/user.enum";
import { apiService } from "@/services/api-service";
import type { ApiListResult } from "@/types/api";
import type { User } from "@/types/user";

interface GetUsersParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
}

interface UpdateUserStatusPayload {
  status: EUserStatus;
}

export async function getUsers(
  params: GetUsersParams,
): Promise<ApiListResult<User>> {
  const queryParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search) {
    queryParams.set("q", params.search);
  }

  if (params.role) {
    queryParams.set("role", params.role);
  }

  if (params.status) {
    queryParams.set("status", params.status);
  }

  const response = await apiService.get<ApiListResult<User> | User[]>(
    `${API_ENDPOINTS.USERS.LIST}?${queryParams.toString()}`,
    {
      auth: true,
      cache: "no-store",
    },
  );

  if (Array.isArray(response)) {
    return {
      data: response,
    };
  }

  return {
    data: Array.isArray(response.data) ? response.data : [],
    pagination: response.pagination,
  };
}

export async function updateUserStatus(
  userId: string,
  status: EUserStatus,
): Promise<void> {
  await apiService.patch<void, UpdateUserStatusPayload>(
    API_ENDPOINTS.USERS.UPDATE_STATUS(userId),
    { status },
    { auth: true },
  );
}

export function getUserRoleLabel(role: EUserRole): string {
  switch (role) {
    case EUserRole.ADMIN:
      return "Quản trị viên";
    case EUserRole.JOB_SEEKER:
      return "Người tìm việc";
    case EUserRole.RECRUITER:
      return "Nhà tuyển dụng";
    default:
      return role;
  }
}

export async function getUserById(id: string): Promise<User> {
  return apiService.get<User>(
    API_ENDPOINTS.USERS.DETAIL(id),
    {
      auth: true,
      cache: "no-store",
    },
  );
}
