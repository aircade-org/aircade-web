import type {
  AvatarUploadResponse,
  ChangeEmailData,
  ChangeUsernameData,
  DeactivateAccountData,
  EmailChangeResponse,
  FullUserProfile,
  PublicUserProfile,
  UpdateProfileData,
  UsernameChangeResponse,
  UserStats,
} from '@/types/user';

import { apiClient } from '@/lib/api-client';

export function getCurrentUser() {
  return apiClient.get<FullUserProfile>('/users/me');
}

export function updateProfile(data: UpdateProfileData) {
  return apiClient.patch<FullUserProfile>('/users/me', data);
}

export function getPublicUserProfile(username: string) {
  return apiClient.get<PublicUserProfile>(`/users/${username}`);
}

export function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post<AvatarUploadResponse>('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function deleteAvatar() {
  return apiClient.delete<void>('/users/me/avatar');
}

export function changeUsername(data: ChangeUsernameData) {
  return apiClient.patch<UsernameChangeResponse>('/users/me/username', data);
}

export function changeEmail(data: ChangeEmailData) {
  return apiClient.patch<EmailChangeResponse>('/users/me/email', data);
}

export function deactivateAccount(data: DeactivateAccountData) {
  return apiClient.delete<void>('/users/me', { data });
}

export function getUserStats() {
  return apiClient.get<UserStats>('/users/me/stats');
}

export function getUserGames(
  username: string,
  params?: { page?: number; limit?: number },
) {
  return apiClient.get<{
    items: Array<{
      id: string;
      title: string;
      description: string;
      thumbnailUrl: string | null;
      minPlayers: number;
      maxPlayers: number;
      playCount: number;
      avgRating: number;
      reviewCount: number;
      createdAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }>(`/users/${username}/games`, { params });
}
