import { API_ENDPOINTS } from "@/constants/constants/api";
import { EAnalyticsRange } from "@/constants/enums/analytics.enum";
import { apiService } from "@/services/api-service";

export interface AdminOverview {
  totalUsers: number;
  totalRecruiters: number;
  totalJobSeekers: number;
  totalJobs: number;
  totalOpenJobs: number;
  totalPendingJobs: number;
  totalApplications: number;
}

export interface GrowthItem {
  date: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface AdminGrowthApiItem {
  bucket: string;
  total: number;
}

interface RecentActivityApiItem {
  id: string;
  type: string;
  description: string;
  occurredAt: string;
  metadata?: Record<string, any>;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  return await apiService.get<AdminOverview>(API_ENDPOINTS.ANALYTICS.OVERVIEW, {
    auth: true,
    cache: "no-store",
  });
}

export async function getUserGrowth(
  range: EAnalyticsRange = EAnalyticsRange.SEVEN_DAYS,
): Promise<GrowthItem[]> {
  const queryParams = new URLSearchParams({ range });
  const data = await apiService.get<AdminGrowthApiItem[]>(
    `${API_ENDPOINTS.ANALYTICS.USER_GROWTH}?${queryParams.toString()}`,
    {
      auth: true,
      cache: "no-store",
    },
  );

  return data.map((item) => ({ date: item.bucket, count: item.total }));
}

export async function getJobGrowth(
  range: EAnalyticsRange = EAnalyticsRange.SEVEN_DAYS,
): Promise<GrowthItem[]> {
  const queryParams = new URLSearchParams({ range });
  const data = await apiService.get<AdminGrowthApiItem[]>(
    `${API_ENDPOINTS.ANALYTICS.JOB_GROWTH}?${queryParams.toString()}`,
    {
      auth: true,
      cache: "no-store",
    },
  );

  return data.map((item) => ({ date: item.bucket, count: item.total }));
}

export async function getApplicationGrowth(
  range: EAnalyticsRange = EAnalyticsRange.SEVEN_DAYS,
): Promise<GrowthItem[]> {
  const queryParams = new URLSearchParams({ range });
  const data = await apiService.get<AdminGrowthApiItem[]>(
    `${API_ENDPOINTS.ANALYTICS.APPLICATION_GROWTH}?${queryParams.toString()}`,
    {
      auth: true,
      cache: "no-store",
    },
  );

  return data.map((item) => ({ date: item.bucket, count: item.total }));
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
  const data = await apiService.get<RecentActivityApiItem[]>(
    API_ENDPOINTS.ANALYTICS.RECENT_ACTIVITIES,
    {
      auth: true,
      cache: "no-store",
    },
  );

  return data.map((item) => ({
    id: item.id,
    type: item.type,
    description: item.description,
    createdAt: item.occurredAt,
    metadata: item.metadata,
  }));
}
