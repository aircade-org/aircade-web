import { create } from 'zustand';

import type {
  CreateGameInput,
  Game,
  GameAsset,
  GameVersion,
  PaginatedResponse,
  PublishGameInput,
  Tag,
  UpdateGameInput,
} from '@/types/game';

import * as gameService from '@/services/game';

interface GameState {
  games: Game[];
  totalGames: number;
  isLoading: boolean;
  error: string | null;

  fetchMyGames: (params?: {
    status?: 'draft' | 'published' | 'archived';
  }) => Promise<void>;

  createGame: (data: CreateGameInput) => Promise<Game>;
  updateGame: (gameId: string, data: UpdateGameInput) => Promise<Game>;
  deleteGame: (gameId: string) => Promise<void>;
  publishGame: (gameId: string, data: PublishGameInput) => Promise<void>;
  archiveGame: (gameId: string) => Promise<Game>;
  unarchiveGame: (gameId: string) => Promise<Game>;
  forkGame: (gameId: string) => Promise<Game>;

  getGameVersions: (gameId: string) => Promise<PaginatedResponse<GameVersion>>;
  getGameAssets: (gameId: string) => Promise<PaginatedResponse<GameAsset>>;
  uploadGameAsset: (gameId: string, file: File) => Promise<GameAsset>;
  deleteGameAsset: (gameId: string, assetId: string) => Promise<void>;

  getTags: () => Promise<Tag[]>;
  setGameTags: (gameId: string, tagIds: string[]) => Promise<Tag[]>;
  getGameTags: (gameId: string) => Promise<Tag[]>;
}

export const useGameStore = create<GameState>()((set) => ({
  games: [],
  totalGames: 0,
  isLoading: false,
  error: null,

  fetchMyGames: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await gameService.getMyGames(params);
      set({ games: data.data, totalGames: data.total, isLoading: false });
    } catch (_err) {
      set({ error: 'Failed to load games', isLoading: false });
    }
  },

  createGame: async (input) => {
    const { data } = await gameService.createGame(input);
    set((state) => ({
      games: [data, ...state.games],
      totalGames: state.totalGames + 1,
    }));
    return data;
  },

  updateGame: async (gameId, input) => {
    const { data } = await gameService.updateGame(gameId, input);
    set((state) => ({
      games: state.games.map((g) => (g.id === gameId ? data : g)),
    }));
    return data;
  },

  deleteGame: async (gameId) => {
    await gameService.deleteGame(gameId);
    set((state) => ({
      games: state.games.filter((g) => g.id !== gameId),
      totalGames: state.totalGames - 1,
    }));
  },

  publishGame: async (gameId, input) => {
    const { data } = await gameService.publishGame(gameId, input);
    set((state) => ({
      games: state.games.map((g) =>
        g.id === gameId
          ? {
              ...g,
              status: data.game.status,
              publishedVersionId: data.game.publishedVersionId,
            }
          : g,
      ),
    }));
  },

  archiveGame: async (gameId) => {
    const { data } = await gameService.archiveGame(gameId);
    set((state) => ({
      games: state.games.map((g) => (g.id === gameId ? data : g)),
    }));
    return data;
  },

  unarchiveGame: async (gameId) => {
    const { data } = await gameService.unarchiveGame(gameId);
    set((state) => ({
      games: state.games.map((g) => (g.id === gameId ? data : g)),
    }));
    return data;
  },

  forkGame: async (gameId) => {
    const { data } = await gameService.forkGame(gameId);
    set((state) => ({
      games: [data, ...state.games],
      totalGames: state.totalGames + 1,
    }));
    return data;
  },

  getGameVersions: async (gameId) => {
    const { data } = await gameService.getGameVersions(gameId);
    return data;
  },

  getGameAssets: async (gameId) => {
    const { data } = await gameService.getGameAssets(gameId);
    return data;
  },

  uploadGameAsset: async (gameId, file) => {
    const { data } = await gameService.uploadGameAsset(gameId, file);
    return data;
  },

  deleteGameAsset: async (gameId, assetId) => {
    await gameService.deleteGameAsset(gameId, assetId);
  },

  getTags: async () => {
    const { data } = await gameService.getTags();
    return data.data;
  },

  setGameTags: async (gameId, tagIds) => {
    const { data } = await gameService.setGameTags(gameId, tagIds);
    return data.tags;
  },

  getGameTags: async (gameId) => {
    const { data } = await gameService.getGameTags(gameId);
    return data.tags;
  },
}));
