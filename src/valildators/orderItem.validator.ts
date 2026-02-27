import { z, ZodObject, ZodRawShape } from "zod";

export class OrderItemValidator {
  // Create order item
  static createOrderItemSchema: ZodObject<ZodRawShape> = z.object({
    body: z.object({
      order_id: z.coerce.number(),
      product_id: z.coerce.number(),
      quantity: z.number().int().min(1),
      price: z.number().min(0),
    }),
    params: z.object({}),
    query: z.object({}),
  });

  // Update order item
  static updateOrderItemSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({
      quantity: z.number().int().min(1).optional(),
      price: z.number().min(0).optional(),
    }),
    query: z.object({}),
  });

  // Get / Delete by ID
  static getOrderItemByIdSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),

  });

  // Get items by order_id
  static getByOrderIdSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ order_id: z.coerce.number() }),
  });
}
