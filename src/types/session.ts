// === Session & Player entities ===

export type SessionStatus = 'lobby' | 'playing' | 'paused' | 'ended';

export type ConnectionStatus = 'connected' | 'disconnected';

export interface Session {
  id: string;
  hostId: string;
  gameId: string | null;
  gameVersionId: string | null;
  sessionCode: string;
  status: SessionStatus;
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
}

export interface Player {
  id: string;
  sessionId: string;
  userId: string | null;
  displayName: string;
  avatarUrl: string | null;
  connectionStatus: ConnectionStatus;
  createdAt: string;
}

export interface SessionInfo {
  id: string;
  sessionCode: string;
  status: SessionStatus;
}

export interface JoinResponse {
  player: Player;
  session: SessionInfo;
}

export interface GameVersion {
  id: string;
  versionNumber: number;
  gameScreenCode: string;
  controllerScreenCode: string;
}

export interface LoadGameResponse {
  session: {
    id: string;
    status: SessionStatus;
    gameId: string;
    gameVersionId: string;
  };
  gameVersion: GameVersion;
}

// === WebSocket message types ===

export interface WsMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  messageId: string;
}

// Server -> Client payloads

export interface ConnectedPayload {
  sessionId: string;
  role: 'host' | 'player';
  playerId?: string;
}

export interface PlayerJoinedPayload {
  player: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface PlayerLeftPayload {
  playerId: string;
  reason: 'left' | 'removed' | 'disconnected';
}

export interface PlayerInputEventPayload {
  playerId: string;
  inputType: string;
  data: Record<string, unknown>;
}

export interface GameStatePayload {
  state: Record<string, unknown>;
}

export interface SessionStatusChangePayload {
  status: SessionStatus;
  previousStatus: SessionStatus;
}

export interface GameLoadedPayload {
  gameId: string;
  gameVersionId: string;
  gameScreenCode?: string;
  controllerScreenCode?: string;
}

export interface WsErrorPayload {
  code: string;
  message: string;
}

// === PostMessage types (parent <-> iframe) ===

export type IframeMessageType =
  | 'aircade:init'
  | 'aircade:player_input'
  | 'aircade:state_update'
  | 'aircade:player_joined'
  | 'aircade:player_left'
  | 'aircade:send_input'
  | 'aircade:broadcast_state'
  | 'aircade:ready';

export interface IframeMessage<T = unknown> {
  type: IframeMessageType;
  payload: T;
}

export interface IframeInitPayload {
  role: 'host' | 'player';
  players: Array<{
    id: string;
    displayName: string;
    avatarUrl: string | null;
  }>;
  sessionInfo: {
    sessionId: string;
    sessionCode: string;
    status: SessionStatus;
    maxPlayers: number;
  };
  player?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}
