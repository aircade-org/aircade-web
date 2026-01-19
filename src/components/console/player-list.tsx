'use client';

import type { Player } from '@/types/session';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PlayerListProps {
  players: Player[];
}

export function PlayerList({ players }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No players connected yet.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {players.map((player) => (
        <li
          key={player.id}
          className="flex items-center gap-3"
        >
          <Avatar size="sm">
            {player.avatarUrl && (
              <AvatarImage
                src={player.avatarUrl}
                alt={player.displayName}
              />
            )}
            <AvatarFallback>
              {player.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{player.displayName}</span>
          <Badge
            variant={
              player.connectionStatus === 'connected' ? 'default' : 'secondary'
            }
            className="ml-auto text-xs"
          >
            {player.connectionStatus}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
