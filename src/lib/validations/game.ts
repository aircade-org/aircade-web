import { z } from 'zod/v4';

export const createGameSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(100, 'Title must be at most 100 characters'),
    description: z
      .string()
      .max(1000, 'Description must be at most 1000 characters')
      .optional(),
    technology: z.enum(['p5js']),
    minPlayers: z.number().int().min(1),
    maxPlayers: z.number().int().min(1).max(50),
    visibility: z.enum(['public', 'private', 'unlisted']),
    remixable: z.boolean(),
  })
  .refine((data) => data.maxPlayers >= data.minPlayers, {
    message: 'Max players must be at least min players',
    path: ['maxPlayers'],
  });

export const updateGameSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(100, 'Title must be at most 100 characters')
      .optional(),
    description: z
      .string()
      .max(1000, 'Description must be at most 1000 characters')
      .optional(),
    minPlayers: z.number().int().min(1).optional(),
    maxPlayers: z.number().int().min(1).max(50).optional(),
    visibility: z.enum(['public', 'private', 'unlisted']).optional(),
    remixable: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.minPlayers !== undefined && data.maxPlayers !== undefined) {
        return data.maxPlayers >= data.minPlayers;
      }
      return true;
    },
    {
      message: 'Max players must be at least min players',
      path: ['maxPlayers'],
    },
  );

export const publishGameSchema = z.object({
  changelog: z
    .string()
    .max(500, 'Changelog must be at most 500 characters')
    .optional(),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type PublishGameInput = z.infer<typeof publishGameSchema>;
