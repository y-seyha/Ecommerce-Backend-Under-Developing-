import { z, ZodObject, ZodRawShape } from "zod";

export class CartValidator {
  static createCartSchema: ZodObject<ZodRawShape> = z.object({
    body: z.object({
      user_id: z.coerce.number(),
    }),
    params: z.object({}),
    query: z.object({}),
  });

  static updateCartSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({
      user_id: z.coerce.number().optional(),
    }),
    query: z.object({}),
  });

  static getCartByIdSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({}),
    query: z.object({}),
  });

  static getPaginatedSchema: ZodObject<ZodRawShape> = z.object({
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).default(10),
    }),
  });
}
