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
}
