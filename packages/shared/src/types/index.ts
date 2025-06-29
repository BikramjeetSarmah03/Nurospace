export type SuccessResponse<T = void> = {
  success: true;
  message: string;
} & (T extends void ? Record<string, unknown> : { data: T });

export type ErrorResponse = {
  success: false;
  error: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    nextPage?: number;
    prevPage?: number;
  };
  data: T;
} & Omit<SuccessResponse, "data">;
