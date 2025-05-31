
export type LoginResponse = {
  token: string;
  role: string;
};

export type UserTokenDecrypted = {
  id: string;
  role: string;
};

