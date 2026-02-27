import { z, ZodObject, ZodRawShape } from "zod";

export class ProductValidator {
  static createProductSchema: ZodObject<ZodRawShape> = z.object({
    body: z.object({
      name: z.string().trim().min(1).max(150),
      description: z.string().optional(),
      price: z.number().min(0),
      stock: z.number().int().min(0).optional(),
      category_id: z.coerce.number().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
  });

  static updateProductSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({
      name: z.string().trim().min(1).max(150).optional(),
      description: z.string().optional(),
      price: z.number().min(0).optional(),
      stock: z.number().int().min(0).optional(),
      category_id: z.coerce.number().optional(),
    }),
    query: z.object({}),
  });

  static getProductByIdSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),

  });
}
