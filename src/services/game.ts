import type {
  CreateGameInput,
  Game,
  GameAsset,
  GameVersion,
  PaginatedResponse,
  PublishGameInput,
  PublishGameResponse,
  Tag,
  UpdateGameInput,
} from '@/types/game';

import { apiClient } from '@/lib/api-client';

export function createGame(data: CreateGameInput) {
  return apiClient.post<Game>('/games', data);
}

export function getGame(gameId: string) {
  return apiClient.get<Game>(`/games/${gameId}`);
}

export function updateGame(gameId: string, data: UpdateGameInput) {
  return apiClient.patch<Game>(`/games/${gameId}`, data);
}

export function deleteGame(gameId: string) {
  return apiClient.delete(`/games/${gameId}`);
}

export function publishGame(gameId: string, data: PublishGameInput) {
  return apiClient.post<PublishGameResponse>(`/games/${gameId}/publish`, data);
}

export function archiveGame(gameId: string) {
  return apiClient.post<Game>(`/games/${gameId}/archive`);
}

export function unarchiveGame(gameId: string) {
  return apiClient.post<Game>(`/games/${gameId}/unarchive`);
}

export function forkGame(gameId: string) {
  return apiClient.post<Game>(`/games/${gameId}/fork`);
}

export function getGameVersions(
  gameId: string,
  params?: { offset?: number; limit?: number },
) {
  return apiClient.get<PaginatedResponse<GameVersion>>(
    `/games/${gameId}/versions`,
    { params },
  );
}

export function getGameVersion(gameId: string, versionNumber: number) {
  return apiClient.get<GameVersion>(
    `/games/${gameId}/versions/${versionNumber}`,
  );
}

export function uploadGameAsset(gameId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<GameAsset>(`/games/${gameId}/assets`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function getGameAssets(gameId: string) {
  return apiClient.get<PaginatedResponse<GameAsset>>(`/games/${gameId}/assets`);
}

export function getGameAsset(gameId: string, assetId: string) {
  return apiClient.get<GameAsset>(`/games/${gameId}/assets/${assetId}`);
}

export function deleteGameAsset(gameId: string, assetId: string) {
  return apiClient.delete(`/games/${gameId}/assets/${assetId}`);
}

export function getTags(category?: 'genre' | 'mood' | 'playerStyle') {
  return apiClient.get<{ data: Tag[] }>('/tags', {
    params: category ? { category } : undefined,
  });
}

export function setGameTags(gameId: string, tagIds: string[]) {
  return apiClient.put<{ tags: Tag[] }>(`/games/${gameId}/tags`, { tagIds });
}

export function getGameTags(gameId: string) {
  return apiClient.get<{ tags: Tag[] }>(`/games/${gameId}/tags`);
}

export function getMyGames(params?: {
  status?: 'draft' | 'published' | 'archived';
  offset?: number;
  limit?: number;
}) {
  return apiClient.get<PaginatedResponse<Game>>('/users/me/games', { params });
}

export function getUserGames(
  username: string,
  params?: { offset?: number; limit?: number },
) {
  return apiClient.get<PaginatedResponse<Game>>(`/users/${username}/games`, {
    params,
  });
}
