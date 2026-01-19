import type {
  JoinResponse,
  LoadGameResponse,
  Player,
  Session,
} from '@/types/session';

import { apiClient } from '@/lib/api-client';

export function createSession(maxPlayers?: number) {
  return apiClient.post<Session>('/sessions', maxPlayers ? { maxPlayers } : {});
}

export function getSession(sessionCode: string) {
  return apiClient.get<Session>(`/sessions/${encodeURIComponent(sessionCode)}`);
}

export function joinSession(sessionCode: string, displayName: string) {
  return apiClient.post<JoinResponse>(
    `/sessions/${encodeURIComponent(sessionCode)}/join`,
    { displayName },
  );
}

export function loadGame(sessionId: string, gameId: string) {
  return apiClient.post<LoadGameResponse>(`/sessions/${sessionId}/game`, {
    gameId,
  });
}

export function endSession(sessionId: string) {
  return apiClient.delete(`/sessions/${sessionId}`);
}

export function getPlayers(sessionId: string) {
  return apiClient.get<Player[]>(`/sessions/${sessionId}/players`);
}
