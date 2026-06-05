export const API_PREFIX = "/api/v1";

export const API_ENDPOINTS = {
  ACCOUNT: {
    ME: `${API_PREFIX}/account/me`,
  },
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REFRESH_TOKEN: `${API_PREFIX}/auth/refresh-token`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    CHANGE_PASSWORD: `${API_PREFIX}/auth/change-password`,
  },
  USERS: {
    LIST: `${API_PREFIX}/users`,
    DETAIL: (id: string) => `${API_PREFIX}/users/${id}`,
    UPDATE_STATUS: (id: string) => `${API_PREFIX}/users/${id}/status`,
  },
  CATEGORIES: {
    LIST: `${API_PREFIX}/career-categories`,
    DETAIL: (id: string) => `${API_PREFIX}/career-categories/${id}`,
    CREATE: `${API_PREFIX}/career-categories`,
    UPDATE: (id: string) => `${API_PREFIX}/career-categories/${id}`,
    DELETE: (id: string) => `${API_PREFIX}/career-categories/${id}`,
  },
  JOBS: {
    LIST_ADMIN: `${API_PREFIX}/jobs/admin`,
    APPROVE: (id: string) => `${API_PREFIX}/jobs/${id}/approve`,
    REJECT: (id: string) => `${API_PREFIX}/jobs/${id}/reject`,
    CLOSE: (id: string) => `${API_PREFIX}/jobs/${id}/close`,
  }
} as const;
