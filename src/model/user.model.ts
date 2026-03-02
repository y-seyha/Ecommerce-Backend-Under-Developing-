export type UserRole = "customer" | "admin" | "seller";

export interface IUser {
  id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: UserRole;
  created_at?: Date;
  updated_at?: Date;
  googleId?: string;
  provider?: "local" | "google" | "facebook";
  is_verified?: boolean;
}
export interface IGoogleUserResponse extends IUser {
  accessToken: string;
}
