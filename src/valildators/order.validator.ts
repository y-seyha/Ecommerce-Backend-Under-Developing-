import { z, ZodObject, ZodRawShape } from "zod";

export class OrderValidator {
  // Create order
  static createOrderSchema: ZodObject<ZodRawShape> = z.object({
    body: z.object({
      user_id: z.coerce.number(),
      total_price: z.number().min(0),
      status: z.enum(["pending", "completed", "cancelled"]).optional(),
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
    body: z.object({}),
    query: z.object({}),
  });
}
