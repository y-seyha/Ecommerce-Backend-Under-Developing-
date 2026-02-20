export interface CreateCartItemDto {
  cart_id: number;
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemDto {
  cart_id?: number;
  product_id?: number;
  quantity?: number;
}
