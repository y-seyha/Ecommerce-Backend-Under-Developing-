export interface CreateOrderDTO {
  user_id: number;
  total_price: number;
  status?: "pending" | "completed" | "cancelled";
}

export interface UpdateOrderDTO {
  total_price?: number;
  status?: "pending" | "completed" | "cancelled";
  user_id: number;
}
