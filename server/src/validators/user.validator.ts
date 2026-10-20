/**
 * validators/user.validator.ts
 * Zod schemas for user management request bodies.
 */

import { z } from 'zod';

export const createUserSchema = z.object({
  full_name: z.string().min(2).max(150).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
  role_id: z.string().uuid('Invalid role ID'),
});

export const updateUserSchema = z.object({
  full_name: z.string().min(2).max(150).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  role_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
});

export type CreateUserInput  = z.infer<typeof createUserSchema>;
export type UpdateUserInput  = z.infer<typeof updateUserSchema>;

