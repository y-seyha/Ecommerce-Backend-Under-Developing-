export interface Payment {
  id?: number;
  order_id: number;
  amount: number;
  method: string; // 'card', 'paypal', etc.
  status?: "pending" | "completed" | "failed";
  paid_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}
