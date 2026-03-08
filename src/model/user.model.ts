export type UserRole = "customer" | "admin" | "seller";

export interface IUser {
  id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role?: UserRole;
  phone?: string;
  is_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface IAccount {
  id?: number;
  userId: number;
  provider: "google" | "facebook" | "github";
  provider_account_id: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: Date | null;
  created_at?: Date;
}

export interface IOAuthUserResponse {
  user: IUser;
  account: IAccount;
}
