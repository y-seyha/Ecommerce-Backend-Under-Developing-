// export interface Order {
//   id?: number;
//   user_id: number;
//   total_price: number;
//   status?: "pending" | "completed" | "cancelled";
//   shipping_name: string;
//   shipping_phone: string;
//   shipping_address: string;
//   shipping_city: string;
//   created_at?: Date;
//   updated_at?: Date;
// }
// src/model/order.model.ts
export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  created_at?: Date;
  updated_at?: Date;
}

// src/model/orderItem.model.ts
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at?: Date;
  updated_at?: Date;
}
