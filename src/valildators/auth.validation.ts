import { z } from "zod";

/**
 * Common reusable fields
 */
const email = z.string().email().trim().toLowerCase();
const password = z.string().min(6).max(100);
const empty = z.object({}).strict();

/**
 * 🔐 REGISTER
 */
export const registerValidator = z.object({
  body: z
    .object({
      email,
      password,
      first_name: z.string().min(1).max(50).trim().optional(),
      last_name: z.string().min(1).max(50).trim().optional(),
    })
    .strict(),
  params: empty,
  query: empty,
});

/**
 * 🔑 LOGIN
 */
export const loginValidator = z.object({
  body: z
    .object({
      email,
      password,
    })
    .strict(),
  params: empty,
  query: empty,
});

/**
 * 📧 FORGOT PASSWORD
 */
export const forgotPasswordValidator = z.object({
  body: z
    .object({
      email,
    })
    .strict(),
  params: empty,
  query: empty,
});

/**
 * 🔁 RESET PASSWORD
 */
export const resetPasswordValidator = z.object({
  body: z
    .object({
      token: z.string().min(20),
      newPassword: password,
    })
    .strict(),
  params: empty,
  query: empty,
});

/**
 * ✅ VERIFY EMAIL (query)
 */
export const verifyEmailValidator = z.object({
  body: empty,
  params: empty,
  query: z
    .object({
      token: z.string().min(20),
    })
    .strict(),
});

/**
 * 🔄 REFRESH TOKEN (cookie → handled in controller, so empty)
 */
export const refreshTokenValidator = z.object({
  body: empty,
  params: empty,
  query: empty,
});

/**
 * 👤 ME (no input)
 */
export const meValidator = z.object({
  body: empty,
  params: empty,
  query: empty,
});

/**
 * 🔵 GOOGLE CALLBACK (query)
 */
export const googleCallbackValidator = z.object({
  body: empty,
  params: empty,
  query: z
    .object({
      code: z.string().min(10),
    })
    .strict(),
});

/**
 * 🔵 FACEBOOK CALLBACK (query)
 */
export const facebookCallbackValidator = z.object({
  body: empty,
  params: empty,
  query: z
    .object({
      code: z.string().min(10),
    })
    .strict(),
});

/**
 * 🔵 GITHUB CALLBACK (query)
 */
export const githubCallbackValidator = z.object({
  body: empty,
  params: empty,
  query: z
    .object({
      code: z.string().min(10),
    })
    .strict(),
});
