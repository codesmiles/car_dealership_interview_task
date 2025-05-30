import { UserTokenDecrypted } from '../Types';
import { Request } from 'express';
export interface PaginatedResponse<T> {
  payload: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CustomRequest extends Request {
  user: UserTokenDecrypted;
}