import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(128, { message: "Password must be less than 128 characters" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, { message: "Name must be at least 2 characters" })
  .max(100, { message: "Name must be less than 100 characters" })
  .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens and apostrophes" });

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

export const profileUpdateSchema = z.object({
  full_name: fullNameSchema.optional(),
  phone_number: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" })
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .trim()
    .max(100, { message: "Country must be less than 100 characters" })
    .optional(),
  date_of_birth: z.string().optional(),
});
