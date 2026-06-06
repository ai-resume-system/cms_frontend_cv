import { API_ENDPOINTS } from "@/constants/constants/api";
import { apiService } from "@/services/api-service";
import type { ApiListResult } from "@/types/api";
import type { Skill } from "@/types/skill";

interface GetSkillsParams {
  page?: number;
  limit?: number;
  q?: string;
  careerCategoryId?: string;
}

interface CreateSkillPayload {
  name: string;
  careerCategoryId: string;
  parentId?: string;
}

interface UpdateSkillPayload {
  name?: string;
  careerCategoryId?: string;
  parentId?: string;
}

export async function getAdminSkills(
  params: GetSkillsParams,
): Promise<ApiListResult<Skill>> {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.set("page", String(params.page));
  if (params.limit !== undefined) queryParams.set("limit", String(params.limit));
  if (params.q) queryParams.set("q", params.q);
  if (params.careerCategoryId) {
    queryParams.set("careerCategoryId", params.careerCategoryId);
  }

  const response = await apiService.get<ApiListResult<Skill>>(
    `${API_ENDPOINTS.SKILLS.LIST}?${queryParams.toString()}`,
    {
      auth: true,
      cache: "no-store",
    },
  );

  return {
    data: response.data || [],
    pagination: response.pagination,
  };
}

export async function createSkill(payload: CreateSkillPayload): Promise<Skill> {
  return await apiService.post<Skill, CreateSkillPayload>(
    API_ENDPOINTS.SKILLS.CREATE,
    payload,
    { auth: true },
  );
}

export async function updateSkill(
  id: string,
  payload: UpdateSkillPayload,
): Promise<Skill> {
  return await apiService.patch<Skill, UpdateSkillPayload>(
    API_ENDPOINTS.SKILLS.UPDATE(id),
    payload,
    { auth: true },
  );
}

export async function deleteSkill(id: string): Promise<void> {
  await apiService.delete<void>(API_ENDPOINTS.SKILLS.DELETE(id), {
    auth: true,
  });
}
