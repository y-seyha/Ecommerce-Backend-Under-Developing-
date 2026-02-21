export interface Cart {
  id?: number;
  user_id: number;
  created_at?: string;
}

export interface CreateCartDto {
  user_id: number;
}

//  in case want to change ownership
export interface UpdateCartDto {
  user_id?: number;
}
