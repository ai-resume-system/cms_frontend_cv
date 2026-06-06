export const API_PREFIX = "/api/v1";

export const API_ENDPOINTS = {
  ACCOUNT: {
    ME: `${API_PREFIX}/account/me`,
    CHANGE_PASSWORD: `${API_PREFIX}/account/me/change-password`,
  },
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REFRESH_TOKEN: `${API_PREFIX}/auth/refresh-token`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
  },
  USERS: {
    LIST: `${API_PREFIX}/admin/users`,
    DETAIL: (id: string) => `${API_PREFIX}/admin/users/${id}`,
    UPDATE_STATUS: (id: string) => `${API_PREFIX}/admin/users/${id}/status`,
  },
  CATEGORIES: {
    LIST: `${API_PREFIX}/admin/career-categories`,
    DETAIL: (slug: string) => `${API_PREFIX}/admin/career-categories/${slug}`,
    CREATE: `${API_PREFIX}/admin/career-categories`,
    UPDATE: (id: string) => `${API_PREFIX}/admin/career-categories/${id}`,
    DELETE: (id: string) => `${API_PREFIX}/admin/career-categories/${id}`,
  },
  JOBS: {
    LIST_ADMIN: `${API_PREFIX}/admin/jobs`,
    DETAIL: (slug: string) => `${API_PREFIX}/admin/jobs/${slug}`,
    APPROVE: (id: string) => `${API_PREFIX}/admin/jobs/${id}/approve`,
    REJECT: (id: string) => `${API_PREFIX}/admin/jobs/${id}/reject`,
    CLOSE: (id: string) => `${API_PREFIX}/admin/jobs/${id}/close`,
  },
  ANALYTICS: {
    OVERVIEW: `${API_PREFIX}/admin/analytics/overview`,
    USER_GROWTH: `${API_PREFIX}/admin/analytics/user-growth`,
    JOB_GROWTH: `${API_PREFIX}/admin/analytics/job-growth`,
    APPLICATION_GROWTH: `${API_PREFIX}/admin/analytics/application-growth`,
    RECENT_ACTIVITIES: `${API_PREFIX}/admin/analytics/recent-activities`,
  },
  SKILLS: {
    LIST: `${API_PREFIX}/admin/skills`,
    CREATE: `${API_PREFIX}/admin/skills`,
    UPDATE: (id: string) => `${API_PREFIX}/admin/skills/${id}`,
    DELETE: (id: string) => `${API_PREFIX}/admin/skills/${id}`,
  },
} as const;
