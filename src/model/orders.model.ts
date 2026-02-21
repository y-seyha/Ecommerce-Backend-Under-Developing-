export interface Order {
  id?: number;
  user_id: number;
  total_price: number;
  status?: "pending" | "completed" | "cancelled";
  created_at?: Date;
  updated_at?: Date;
}
