import { Request } from 'express';
import { UserRoles } from "../Utils";


export type UserPayload = {
  name: string;
  email: string;
  role: string;
  phone: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  role: UserRoles | string;
  token: string;
};

export type CreatePasswordPayload = {
  newPassword: string;
};

export type UserTokenDecrypted = {
  id: string;
  role: UserRoles | string;
};


export interface CustomRequest extends Request {
  user: UserTokenDecrypted;
  file_urls: string[];
}