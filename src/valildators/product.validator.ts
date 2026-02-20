import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).optional(),
  category_id: z.number().int().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  category_id: z.number().int().optional(),
});
