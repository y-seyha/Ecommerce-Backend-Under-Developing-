export interface CreatePaymentDTO {
  order_id: number;
  amount: number;
  method: string;
  status?: "pending" | "completed" | "failed";
  paid_at?: Date;
}

export interface UpdatePaymentDTO {
  amount?: number;
  method?: string;
  status?: "pending" | "completed" | "failed";
  paid_at?: Date;
}
