export interface ApiPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status?: "success" | "error";
  message?: string;
  data: T;
  pagination?: ApiPagination;
}

export interface ApiListResult<T> {
  data: T[];
  pagination?: ApiPagination;
}

export interface ApiFieldErrorResponse {
  status?: "success" | "error";
  message?: string;
  code?: number | string;
  error?: {
    code?: number | string;
    fields?: Record<string, string[]>;
  };
}

export interface ApiError extends Error {
  code?: number | string;
  fields?: Record<string, string[]>;
  statusCode: number;
}
