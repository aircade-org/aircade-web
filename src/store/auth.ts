import type { AxiosError } from 'axios';
import { create } from 'zustand';

import type { ApiError, User } from '@/types/auth';

import * as authService from '@/services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;

  setSession: (user: User, token: string, refreshToken: string) => void;
  clearSession: () => void;
  initialize: () => void;

  signUpWithEmail: (data: {
    email: string;
    username: string;
    password: string;
  }) => Promise<void>;

  signInWithEmail: (data: { email: string; password: string }) => Promise<void>;

  handleOAuthCallback: (
    provider: 'google' | 'github',
    code: string,
    state: string,
  ) => Promise<void>;

  signOut: () => Promise<void>;

  startTokenRefreshTimer: () => void;
  stopTokenRefreshTimer: () => void;
}

let refreshTimerId: ReturnType<typeof setInterval> | null = null;

function persistTokens(token: string, refreshToken: string) {
  localStorage.setItem('access_token', token);
  localStorage.setItem('refresh_token', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

function getStoredRefreshToken() {
  return localStorage.getItem('refresh_token');
}

function extractErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;
  return (
    axiosError.response?.data?.error?.message ??
    'An unexpected error occurred. Please try again.'
  );
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  setSession: (user, token, refreshToken) => {
    persistTokens(token, refreshToken);
    set({ user, isLoading: false });
    get().startTokenRefreshTimer();
  },

  clearSession: () => {
    clearTokens();
    get().stopTokenRefreshTimer();
    set({ user: null, isLoading: false });
  },

  initialize: () => {
    if (typeof window === 'undefined') {
      set({ isInitialized: true });
      return;
    }

    const token = localStorage.getItem('access_token');
    const refreshToken = getStoredRefreshToken();

    if (!token || !refreshToken) {
      set({ isInitialized: true });
      return;
    }

    // Decode the JWT payload to restore the user without an API call
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
        displayName: payload.displayName ?? null,
        avatarUrl: payload.avatarUrl ?? null,
        bio: payload.bio ?? null,
        emailVerified: payload.emailVerified ?? false,
        role: payload.role ?? 'user',
        subscriptionPlan: payload.subscriptionPlan ?? 'free',
        createdAt: payload.createdAt ?? '',
      };

      set({ user, isInitialized: true });
      get().startTokenRefreshTimer();
    } catch {
      // Token is malformed — attempt a refresh
      authService
        .refreshToken(refreshToken)
        .then(({ data }) => {
          persistTokens(data.token, data.refreshToken);
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          const user: User = {
            id: payload.sub,
            email: payload.email,
            username: payload.username,
            displayName: payload.displayName ?? null,
            avatarUrl: payload.avatarUrl ?? null,
            bio: payload.bio ?? null,
            emailVerified: payload.emailVerified ?? false,
            role: payload.role ?? 'user',
            subscriptionPlan: payload.subscriptionPlan ?? 'free',
            createdAt: payload.createdAt ?? '',
          };
          set({ user, isInitialized: true });
          get().startTokenRefreshTimer();
        })
        .catch(() => {
          clearTokens();
          set({ isInitialized: true });
        });
    }
  },

  signUpWithEmail: async (data) => {
    set({ isLoading: true });
    try {
      const { data: response } = await authService.signUpWithEmail(data);
      get().setSession(response.user, response.token, response.refreshToken);
    } catch (error) {
      set({ isLoading: false });
      throw new Error(extractErrorMessage(error));
    }
  },

  signInWithEmail: async (data) => {
    set({ isLoading: true });
    try {
      const { data: response } = await authService.signInWithEmail(data);
      get().setSession(response.user, response.token, response.refreshToken);
    } catch (error) {
      set({ isLoading: false });
      throw new Error(extractErrorMessage(error));
    }
  },

  handleOAuthCallback: async (provider, code, state) => {
    set({ isLoading: true });
    try {
      const { data: response } = await authService.handleOAuthCallback(
        provider,
        code,
        state,
      );
      get().setSession(response.user, response.token, response.refreshToken);
    } catch (error) {
      set({ isLoading: false });
      throw new Error(extractErrorMessage(error));
    }
  },

  signOut: async () => {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        await authService.signOut(refreshToken);
      } catch {
        // Ignore sign-out API errors — clear locally regardless
      }
    }
    get().clearSession();
  },

  startTokenRefreshTimer: () => {
    get().stopTokenRefreshTimer();

    // Refresh 1 minute before the 15-minute access token expires
    refreshTimerId = setInterval(
      async () => {
        const refreshToken = getStoredRefreshToken();
        if (!refreshToken) return;

        try {
          const { data } = await authService.refreshToken(refreshToken);
          persistTokens(data.token, data.refreshToken);
        } catch {
          get().clearSession();
          if (typeof window !== 'undefined') {
            window.location.href = '/signin';
          }
        }
      },
      14 * 60 * 1000,
    );
  },

  stopTokenRefreshTimer: () => {
    if (refreshTimerId) {
      clearInterval(refreshTimerId);
      refreshTimerId = null;
    }
  },
}));
