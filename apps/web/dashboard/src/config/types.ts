export type SuccessResponse<T = void> = {
  success: true;
  data: T;
  message?: string;
};

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  path: string;
  requestId?: string;
  code?: string;
  details?: Record<string, unknown>;
  errors?: Array<{ property: string; constraints: Record<string, string> }>;
  success: false;
}

export type PaginatedResponse<T> = SuccessResponse<{
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
  };
}>;

export type PaginatedResponseObject<T> = SuccessResponse<{
  items: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
  };
}>;

export type IUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined;
};
