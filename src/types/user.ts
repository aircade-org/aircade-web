import type { User } from './auth';

export interface AuthProvider {
  provider: 'email' | 'google' | 'github';
  providerEmail: string;
  linkedAt: string;
}

export interface FullUserProfile extends User {
  updatedAt: string;
  subscriptionExpiresAt: string | null;
  accountStatus: 'active' | 'suspended' | 'deactivated';
  lastLoginAt: string | null;
  authProviders: AuthProvider[];
}

export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  stats: {
    gamesPublished: number;
    totalPlayCount: number;
  };
}

export interface UserStats {
  gamesPublished: number;
  totalPlayCount: number;
  totalPlayTime: number;
  averageRating: number;
  totalReviews: number;
  games: Array<{
    gameId: string;
    title: string;
    playCount: number;
    totalPlayTime: number;
    avgRating: number;
    reviewCount: number;
  }>;
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ChangeUsernameData {
  newUsername: string;
}

export interface ChangeEmailData {
  newEmail: string;
  password?: string;
}

export interface DeactivateAccountData {
  password?: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
}

export interface UsernameChangeResponse {
  username: string;
}

export interface EmailChangeResponse {
  message: string;
  email: string;
  emailVerified: boolean;
}
