import type { AxiosError } from 'axios';
import { create } from 'zustand';

import type { ApiError } from '@/types/auth';
import type {
  GameLoadedPayload,
  GameStatePayload,
  GameVersion,
  Player,
  PlayerInputEventPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  Session,
  SessionStatus,
  SessionStatusChangePayload,
} from '@/types/session';

import { WsClient } from '@/lib/ws-client';

import * as sessionService from '@/services/session';

interface SessionState {
  // Session data
  session: Session | null;
  players: Player[];
  gameVersion: GameVersion | null;

  // Player identity (controller side)
  currentPlayer: Player | null;

  // Connection state
  isConnecting: boolean;
  isConnected: boolean;
  isLoadingGame: boolean;

  // Callbacks for iframe bridge
  onPlayerInputEvent: ((payload: PlayerInputEventPayload) => void) | null;
  onGameStateEvent: ((payload: GameStatePayload) => void) | null;

  // Actions — session lifecycle
  createSession: () => Promise<void>;
  joinSession: (sessionCode: string, displayName: string) => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  endSession: () => Promise<void>;

  // Actions — WebSocket
  connectAsHost: () => void;
  connectAsPlayer: () => void;
  disconnect: () => void;

  // Actions — game communication
  sendPlayerInput: (inputType: string, data: Record<string, unknown>) => void;
  broadcastGameState: (state: Record<string, unknown>) => void;

  // Actions — iframe bridge callbacks
  setOnPlayerInputEvent: (
    cb: ((payload: PlayerInputEventPayload) => void) | null,
  ) => void;
  setOnGameStateEvent: (
    cb: ((payload: GameStatePayload) => void) | null,
  ) => void;

  // Actions — cleanup
  reset: () => void;
}

let wsClient: WsClient | null = null;

function extractErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;
  return (
    axiosError.response?.data?.error?.message ??
    'An unexpected error occurred. Please try again.'
  );
}

const initialState = {
  session: null,
  players: [],
  gameVersion: null,
  currentPlayer: null,
  isConnecting: false,
  isConnected: false,
  isLoadingGame: false,
  onPlayerInputEvent: null,
  onGameStateEvent: null,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialState,

  createSession: async () => {
    set({ isConnecting: true });
    try {
      const { data: session } = await sessionService.createSession();
      set({ session, isConnecting: false });
      get().connectAsHost();
    } catch (error) {
      set({ isConnecting: false });
      throw new Error(extractErrorMessage(error));
    }
  },

  joinSession: async (sessionCode, displayName) => {
    set({ isConnecting: true });
    try {
      const { data } = await sessionService.joinSession(
        sessionCode,
        displayName,
      );
      set({
        session: {
          id: data.session.id,
          hostId: '',
          gameId: null,
          gameVersionId: null,
          sessionCode: data.session.sessionCode,
          status: data.session.status,
          maxPlayers: 8,
          createdAt: '',
          updatedAt: '',
          endedAt: null,
        },
        currentPlayer: data.player,
        isConnecting: false,
      });
      get().connectAsPlayer();
    } catch (error) {
      set({ isConnecting: false });
      throw new Error(extractErrorMessage(error));
    }
  },

  loadGame: async (gameId) => {
    const { session } = get();
    if (!session) return;

    set({ isLoadingGame: true });

    try {
      const { data } = await sessionService.loadGame(session.id, gameId);

      // Wait for WebSocket game_loaded event to confirm the game is ready
      // The WS handler will update session status and set isLoadingGame to false
      set({
        gameVersion: data.gameVersion,
      });

      // Wait up to 5 seconds for the WS event
      const startTime = Date.now();
      while (get().isLoadingGame && Date.now() - startTime < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (get().isLoadingGame) {
        throw new Error(
          'Game failed to load. WebSocket event not received in time.',
        );
      }
    } catch (error) {
      set({ isLoadingGame: false });
      throw new Error(extractErrorMessage(error));
    }
  },

  endSession: async () => {
    const { session } = get();
    if (!session) return;

    try {
      await sessionService.endSession(session.id);
    } catch {
      // Ignore — clean up locally regardless
    }
    get().disconnect();
    set(initialState);
  },

  connectAsHost: () => {
    const { session } = get();
    if (!session) return;

    const token = localStorage.getItem('access_token') ?? '';
    wsClient = new WsClient(session.id, { role: 'host', token });

    wsClient.onOpen(() => {
      set({ isConnected: true });
    });

    wsClient.onClose(() => {
      set({ isConnected: false });
    });

    wsClient.on('player_joined', (payload) => {
      const { player } = payload as unknown as PlayerJoinedPayload;
      set((state) => ({
        players: [
          ...state.players,
          {
            id: player.id,
            sessionId: state.session?.id ?? '',
            userId: null,
            displayName: player.displayName,
            avatarUrl: player.avatarUrl,
            connectionStatus: 'connected',
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    });

    wsClient.on('player_left', (payload) => {
      const { playerId } = payload as unknown as PlayerLeftPayload;
      set((state) => ({
        players: state.players.filter((p) => p.id !== playerId),
      }));
    });

    wsClient.on('player_input_event', (payload) => {
      const inputPayload = payload as unknown as PlayerInputEventPayload;
      get().onPlayerInputEvent?.(inputPayload);
    });

    wsClient.on('game_loaded', (payload) => {
      const gameLoaded = payload as unknown as GameLoadedPayload;
      if (gameLoaded.gameScreenCode) {
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                status: 'playing',
                gameId: gameLoaded.gameId,
                gameVersionId: gameLoaded.gameVersionId,
              }
            : null,
          isLoadingGame: false,
        }));
      }
    });

    wsClient.on('session_status_change', (payload) => {
      const { status } = payload as unknown as SessionStatusChangePayload;
      set((state) => ({
        session: state.session ? { ...state.session, status } : null,
      }));
      if (status === 'ended') {
        get().disconnect();
      }
    });

    wsClient.connect();
  },

  connectAsPlayer: () => {
    const { session, currentPlayer } = get();
    if (!session || !currentPlayer) return;

    wsClient = new WsClient(session.id, {
      role: 'player',
      playerId: currentPlayer.id,
    });

    wsClient.onOpen(() => {
      set({ isConnected: true });
    });

    wsClient.onClose(() => {
      set({ isConnected: false });
    });

    wsClient.on('game_loaded', (payload) => {
      const gameLoaded = payload as unknown as GameLoadedPayload;
      set((state) => ({
        session: state.session
          ? {
              ...state.session,
              status: 'playing',
              gameId: gameLoaded.gameId,
              gameVersionId: gameLoaded.gameVersionId,
            }
          : null,
        gameVersion: gameLoaded.controllerScreenCode
          ? {
              id: gameLoaded.gameVersionId,
              versionNumber: 1,
              gameScreenCode: '',
              controllerScreenCode: gameLoaded.controllerScreenCode,
            }
          : state.gameVersion,
        isLoadingGame: false,
      }));
    });

    wsClient.on('game_state', (payload) => {
      const gameState = payload as unknown as GameStatePayload;
      get().onGameStateEvent?.(gameState);
    });

    wsClient.on('session_status_change', (payload) => {
      const { status } = payload as unknown as SessionStatusChangePayload;
      set((state) => ({
        session: state.session ? { ...state.session, status } : null,
      }));
      if (status === 'ended') {
        get().disconnect();
      }
    });

    wsClient.connect();
  },

  disconnect: () => {
    if (wsClient) {
      wsClient.disconnect();
      wsClient = null;
    }
    set({ isConnected: false });
  },

  sendPlayerInput: (inputType, data) => {
    wsClient?.send('player_input', { inputType, data });
  },

  broadcastGameState: (state) => {
    wsClient?.send('game_state_update', { state });
  },

  setOnPlayerInputEvent: (cb) => {
    set({ onPlayerInputEvent: cb });
  },

  setOnGameStateEvent: (cb) => {
    set({ onGameStateEvent: cb });
  },

  reset: () => {
    get().disconnect();
    set(initialState);
  },
}));

// Helper to get session status for phase routing
export function useSessionStatus(): SessionStatus | null {
  return useSessionStore((s) => s.session?.status ?? null);
}
