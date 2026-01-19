/**
 * Hardcoded Pong game ID — must match the UUID seeded in the backend database.
 * Update this value after running the backend seed migration.
 */
export const PONG_GAME_ID = '00000000-0000-0000-0000-000000000001';

export const PONG_GAME = {
  id: PONG_GAME_ID,
  title: 'Pong',
  description:
    'Classic paddle game. Move your paddle up and down to hit the ball past the AI opponent.',
  technology: 'p5js' as const,
  minPlayers: 1,
  maxPlayers: 1,
};
