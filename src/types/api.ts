export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  fields?: Record<string, string[]>;
}
