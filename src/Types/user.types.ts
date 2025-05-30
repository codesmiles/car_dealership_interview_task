import { Request } from 'express';

export type LoginResponse = {
  token: string;
};

export type UserTokenDecrypted = {
  id: string;
};

