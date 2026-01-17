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

function persistSession(user: User, token: string, refreshToken: string) {
  localStorage.setItem('access_token', token);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

function getStoredRefreshToken() {
  return localStorage.getItem('refresh_token');
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
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
    persistSession(user, token, refreshToken);
    set({ user, isLoading: false });
    get().startTokenRefreshTimer();
  },

  clearSession: () => {
    clearSession();
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
    const user = getStoredUser();

    if (!token || !refreshToken || !user) {
      clearSession();
      set({ isInitialized: true });
      return;
    }

    set({ user, isInitialized: true });
    get().startTokenRefreshTimer();
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
          localStorage.setItem('access_token', data.token);
          localStorage.setItem('refresh_token', data.refreshToken);
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
