export interface CreateUserDTO {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  first_name?: string;
  last_name?: string;
  password?: string;
}
