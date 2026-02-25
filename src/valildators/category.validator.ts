import { ZodObject, ZodRawShape, z } from "zod";

export class CategoryValidator {

  static createCategorySchema: ZodObject<ZodRawShape> = z.object({
    body: z.object({
      name: z.string().trim().min(1).max(100),
      description: z.string().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
  });


  static updateCategorySchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({
      name: z.string().trim().min(1).max(100).optional(),
      description: z.string().optional(),
    }),
    query: z.object({}),
  });


  static getCategoryByIdSchema: ZodObject<ZodRawShape> = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({}),
    query: z.object({}),
  });
}