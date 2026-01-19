import { z } from 'zod/v4';

export const joinSessionSchema = z.object({
  sessionCode: z
    .string()
    .min(4, 'Session code must be at least 4 characters')
    .max(6, 'Session code must be at most 6 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Session code must be alphanumeric')
    .transform((val) => val.toUpperCase()),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(30, 'Display name must be at most 30 characters'),
});

export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
