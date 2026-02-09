import type {
  AuthResponse,
  MessageResponse,
  TokenRefreshResponse,
} from '@/types/auth';

import { apiClient } from '@/lib/api-client';

export function signUpWithEmail(data: {
  email: string;
  username: string;
  password: string;
}) {
  return apiClient.post<AuthResponse>('/auth/signup/email', data);
}

export function signInWithEmail(data: { email: string; password: string }) {
  return apiClient.post<AuthResponse>('/auth/signin/email', data);
}

export function getGoogleOAuthUrl(redirectUri?: string) {
  const params = redirectUri
    ? `?redirectUri=${encodeURIComponent(redirectUri)}`
    : '';
  return `${process.env.API}/api/v1/auth/oauth/google${params}`;
}

export function getGitHubOAuthUrl(redirectUri?: string) {
  const params = redirectUri
    ? `?redirectUri=${encodeURIComponent(redirectUri)}`
    : '';
  return `${process.env.API}/api/v1/auth/oauth/github${params}`;
}

export function handleOAuthCallback(
  provider: 'google' | 'github',
  code: string,
  state: string,
) {
  return apiClient.get<AuthResponse>(
    `/auth/oauth/${provider}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
  );
}

export function verifyEmail(token: string) {
  return apiClient.post<MessageResponse>('/auth/verify-email', { token });
}

export function resendVerificationEmail() {
  return apiClient.post<MessageResponse>('/auth/resend-verification');
}

export function requestPasswordReset(email: string) {
  return apiClient.post<MessageResponse>('/auth/password-reset/request', {
    email,
  });
}

export function confirmPasswordReset(token: string, newPassword: string) {
  return apiClient.post<MessageResponse>('/auth/password-reset/confirm', {
    token,
    newPassword,
  });
}

export function refreshToken(refreshToken: string) {
  return apiClient.post<TokenRefreshResponse>('/auth/refresh', {
    refreshToken,
  });
}

export function signOut(refreshToken: string) {
  return apiClient.post('/auth/signout', { refreshToken });
}
