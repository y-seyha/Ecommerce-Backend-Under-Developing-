export interface OrderItem {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateOrderItemDTO {
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface UpdateOrderItemDTO {
  quantity?: number;
  price?: number;
}