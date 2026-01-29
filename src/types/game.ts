export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  technology: 'p5js' | '3d' | 'visual';
  minPlayers: number;
  maxPlayers: number;
  visibility: 'public' | 'private' | 'unlisted';
  status: 'draft' | 'published' | 'archived';
  playCount: number;
  avgRating: number;
  reviewCount: number;
  creatorId: string;
  creatorUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameListItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  minPlayers: number;
  maxPlayers: number;
  playCount: number;
  avgRating: number;
  reviewCount: number;
  creatorUsername: string;
  createdAt: string;
}
