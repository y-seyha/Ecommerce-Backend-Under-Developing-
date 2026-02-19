import { z } from "zod";

export class UserValidator {
  static createUserSchema = z.object({
    body: z.object({
      first_name: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(50),

      last_name: z
        .string()
        .trim()
        .min(2, "Last name must be at least 2 characters")
        .max(50),

      email: z.string().trim().email("Invalid email format").toLowerCase(),

      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain 1 uppercase letter")
        .regex(/[a-z]/, "Must contain 1 lowercase letter")
        .regex(/[0-9]/, "Must contain 1 number"),
    }),
  });

  static loginSchema = z.object({
    body: z.object({
      email: z.string().trim().email().toLowerCase(),
      password: z.string().min(1, "Password is required"),
    }),
  });

  static updateUserSchema = z.object({
    params: z.object({
      id: z.coerce.number(), // auto convert "1" → 1
    }),

    body: z.object({
      first_name: z.string().trim().min(2).max(50).optional(),
      last_name: z.string().trim().min(2).max(50).optional(),
      email: z.string().trim().email().toLowerCase().optional(),
      password: z
        .string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/)
        .optional(),
    }),
  });

  static getUserByIdSchema = z.object({
    params: z.object({
      id: z.coerce.number(),
    }),
  });
}
