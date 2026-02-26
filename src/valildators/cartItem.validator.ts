import z, { ZodObject, ZodRawShape } from "zod";

export class CartItemValidator {
  static createCartItemSchema: ZodObject<ZodRawShape> = z.object({
    body: z.object({
      cart_id: z.coerce.number(),
      product_id: z.coerce.number(),
      quantity: z.number().int().min(1),
    }),
    params: z.object({}),
    query: z.object({}),
  });

  static updateCartItemSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({
      quantity: z.number().int().min(1).optional(),
    }),
    query: z.object({}),
  });

  static getCartItemByIdSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),
  });
}
