export interface GameCreator {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: 'genre' | 'mood' | 'playerStyle';
}

export interface Game {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  creatorId: string;
  creator?: GameCreator;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  technology: 'p5js';
  minPlayers: number;
  maxPlayers: number;
  status: 'draft' | 'published' | 'archived';
  moderationReason: string | null;
  visibility: 'public' | 'private' | 'unlisted';
  remixable: boolean;
  forkedFromId: string | null;
  gameScreenCode: string | null;
  controllerScreenCode: string | null;
  publishedVersionId: string | null;
  playCount: number;
  totalPlayTime: number;
  avgRating: number;
  reviewCount: number;
  tags?: Tag[];
}

export interface GameVersion {
  id: string;
  createdAt: string;
  gameId: string;
  versionNumber: number;
  gameScreenCode?: string;
  controllerScreenCode?: string;
  changelog: string | null;
  publishedById: string;
}

export interface GameAsset {
  id: string;
  createdAt: string;
  gameId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface CreateGameInput {
  title: string;
  description?: string;
  technology?: 'p5js';
  minPlayers?: number;
  maxPlayers?: number;
  visibility?: 'public' | 'private' | 'unlisted';
  remixable?: boolean;
}

export interface UpdateGameInput {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  minPlayers?: number;
  maxPlayers?: number;
  visibility?: 'public' | 'private' | 'unlisted';
  remixable?: boolean;
  gameScreenCode?: string;
  controllerScreenCode?: string;
}

export interface PublishGameInput {
  changelog?: string;
}

export interface PublishGameResponse {
  version: GameVersion;
  game: Pick<Game, 'id' | 'status' | 'publishedVersionId'>;
}
