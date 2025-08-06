export type SuccessResponse<T = void> = {
  success: true;
  data: T;
  message?: string;
};

export type ErrorResponse = {
  success: false;
  message: string;
  statusCode: number;
};

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
