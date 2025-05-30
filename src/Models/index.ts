export * from "./Car.model";
export * from "./Sale.model";
export * from "./User.model";

export interface PaginatedResponse<T> {
  payload: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}