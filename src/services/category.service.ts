import { API_ENDPOINTS } from "@/constants/constants/api";
import { ECareerCategoriesStatus } from "@/constants/enums/category.enum";
import { apiService } from "@/services/api-service";
import type { ApiListResult } from "@/types/api";
import type { CareerCategory } from "@/types/category";

interface GetCategoriesParams {
  page: number;
  limit: number;
  search?: string;
}

interface CategoryPayload {
  name: string;
  description: string;
  status: ECareerCategoriesStatus;
}

interface BackendCareerCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ECareerCategoriesStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  jobCount?: number;
}

function mapCategory(category: BackendCareerCategory): CareerCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    status: category.status,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    deletedAt: category.deletedAt ?? null,
    _count: {
      jobs: category.jobCount ?? 0,
    },
  };
}

export async function getCategories(
  params: GetCategoriesParams,
): Promise<ApiListResult<CareerCategory>> {
  const queryParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search) {
    queryParams.set("search", params.search);
  }

  const response = await apiService.get<ApiListResult<BackendCareerCategory>>(
    `${API_ENDPOINTS.CATEGORIES.LIST}?${queryParams.toString()}`,
    {
      auth: true,
      cache: "no-store",
    },
  );

  return {
    data: response.data.map(mapCategory),
    pagination: response.pagination,
  };
}

export async function createCategory(
  payload: CategoryPayload,
): Promise<CareerCategory> {
  const response = await apiService.post<BackendCareerCategory, CategoryPayload>(
    API_ENDPOINTS.CATEGORIES.CREATE,
    payload,
    { auth: true },
  );

  return mapCategory(response);
}

export async function updateCategory(
  categoryId: string,
  payload: CategoryPayload,
): Promise<CareerCategory> {
  const response = await apiService.patch<
    BackendCareerCategory,
    CategoryPayload
  >(API_ENDPOINTS.CATEGORIES.UPDATE(categoryId), payload, { auth: true });

  return mapCategory(response);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiService.delete<void>(API_ENDPOINTS.CATEGORIES.DELETE(categoryId), {
    auth: true,
  });
}
