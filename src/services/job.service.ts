import { API_ENDPOINTS } from "@/constants/constants/api";
import { apiService } from "@/services/api-service";
import type { ApiListResult } from "@/types/api";
import type { Job } from "@/types/job";

interface GetJobsParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface RejectJobPayload {
  rejectReason: string;
}

interface BackendManagedJob {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  address?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  expiredAt?: string;
  status: Job["status"];
  rejectReason?: string | null;
  closeReason?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name?: string;
    address?: string;
    logoUrl?: string;
    bannerUrl?: string;
    websiteUrl?: string;
    taxCode?: string;
  } | null;
  careerCategory?: {
    id: string;
    name?: string;
    slug?: string;
  } | null;
}

function mapManagedJob(job: BackendManagedJob): Job {
  return {
    id: job.id,
    slug: job.slug ?? "",
    title: job.title,
    shortDescription: job.shortDescription ?? null,
    description: job.description ?? "",
    location: job.address ?? "",
    salaryMin: job.salaryMin ?? 0,
    salaryMax: job.salaryMax ?? 0,
    experienceYears: job.experienceYears ?? 0,
    expiredAt: job.expiredAt ?? "",
    status: job.status,
    rejectReason: job.rejectReason ?? null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    company: job.company
      ? {
          id: job.company.id,
          companyName: job.company.name ?? "",
          taxCode: job.company.taxCode ?? null,
          logoUrl: job.company.logoUrl ?? null,
          bannerUrl: job.company.bannerUrl ?? null,
          location: job.company.address ?? null,
          description: null,
          websiteUrl: job.company.websiteUrl ?? null,
        }
      : null,
    careerCategory: job.careerCategory
      ? {
          id: job.careerCategory.id,
          name: job.careerCategory.name ?? "",
          slug: job.careerCategory.slug ?? "",
          description: null,
          status: "active" as never,
          createdAt: "",
          updatedAt: "",
          deletedAt: null,
        }
      : null,
  };
}

export async function getManagedJobs(
  params: GetJobsParams,
): Promise<ApiListResult<Job>> {
  const queryParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search) {
    queryParams.set("q", params.search);
  }

  if (params.status) {
    queryParams.set("status", params.status);
  }

  if (params.location) {
    queryParams.set("address", params.location);
  }

  if (params.sortBy) {
    queryParams.set("sortBy", params.sortBy);
  }

  if (params.sortOrder) {
    queryParams.set("sortOrder", params.sortOrder);
  }

  const response = await apiService.get<ApiListResult<BackendManagedJob>>(
    `${API_ENDPOINTS.JOBS.LIST_ADMIN}?${queryParams.toString()}`,
    {
      auth: true,
      cache: "no-store",
    },
  );

  return {
    data: response.data.map(mapManagedJob),
    pagination: response.pagination,
  };
}

export async function approveJob(jobId: string): Promise<void> {
  await apiService.patch<void, Record<string, never>>(
    API_ENDPOINTS.JOBS.APPROVE(jobId),
    {},
    { auth: true },
  );
}

export async function rejectJob(
  jobId: string,
  rejectReason: string,
): Promise<void> {
  await apiService.patch<void, RejectJobPayload>(
    API_ENDPOINTS.JOBS.REJECT(jobId),
    { rejectReason },
    { auth: true },
  );
}

export async function closeJob(jobId: string): Promise<void> {
  await apiService.patch<void, Record<string, never>>(
    API_ENDPOINTS.JOBS.CLOSE(jobId),
    {},
    { auth: true },
  );
}

export async function getManagedJobBySlug(slug: string): Promise<Job> {
  const response = await apiService.get<BackendManagedJob>(
    API_ENDPOINTS.JOBS.DETAIL(slug),
    {
      auth: true,
      cache: "no-store",
    },
  );
  return mapManagedJob(response);
}
