import { z } from 'zod/v4';

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional(),
});

export const changeUsernameSchema = z.object({
  newUsername: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_-]*$/,
      'Username must start with a letter and contain only letters, numbers, hyphens, and underscores',
    ),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email('Must be a valid email'),
  password: z.string().optional(),
});

export const deactivateAccountSchema = z.object({
  password: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangeUsernameInput = z.infer<typeof changeUsernameSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type DeactivateAccountInput = z.infer<typeof deactivateAccountSchema>;
