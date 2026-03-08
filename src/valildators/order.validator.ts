import { z, ZodObject, ZodRawShape } from "zod";

export class OrderValidator {
  // Create order
  static createOrderSchema: ZodObject<ZodRawShape> = z.object({
    body: z.object({
      user_id: z.coerce.number(),
      total_price: z.number().min(0),
      status: z.enum(["pending", "completed", "cancelled"]).optional(),
      shipping_name: z.string().optional().default(""),
      shipping_phone: z.string().optional().default(""),
      shipping_address: z.string().optional().default(""),
      shipping_city: z.string().optional().default(""),
      payment_method: z.enum(["cod", "card"]).optional(),
      items: z
        .array(
          z.object({
            product_id: z.coerce.number(),
            quantity: z.coerce.number().min(1),
            price: z.coerce.number().min(0),
          }),
        )
        .min(1, "Order must include at least one item"),
    }),
    params: z.object({}),
    query: z.object({}),
  });
  // Update order
  static updateOrderSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({
      status: z.enum(["pending", "completed", "cancelled"]).optional(),
      total_price: z.number().min(0).optional(),
    }),
    query: z.object({}),
  });

  // Get / Delete by ID
  static getOrderByIdSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),
  });
}
