'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  Archive,
  ArchiveRestore,
  Copy,
  MoreHorizontal,
  Pencil,
  Send,
  Settings,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import type { Game } from '@/types/game';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useGameStore } from '@/store/game';

import { DeleteGameDialog } from './delete-game-dialog';
import { PublishGameDialog } from './publish-game-dialog';

interface GameCardProps {
  game: Game;
}

const statusVariant: Record<
  Game['status'],
  'default' | 'secondary' | 'outline'
> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
};

const visibilityLabel: Record<Game['visibility'], string> = {
  public: 'Public',
  private: 'Private',
  unlisted: 'Unlisted',
};

export function GameCard({ game }: GameCardProps) {
  const archiveGame = useGameStore((s) => s.archiveGame);
  const unarchiveGame = useGameStore((s) => s.unarchiveGame);
  const [publishOpen, setPublishOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleArchive = async () => {
    try {
      await archiveGame(game.id);
      toast.success('Game archived.');
    } catch (_err) {
      toast.error('Failed to archive game.');
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveGame(game.id);
      toast.success('Game unarchived.');
    } catch (_err) {
      toast.error('Failed to unarchive game.');
    }
  };

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base">{game.title}</CardTitle>
              {game.description && (
                <CardDescription className="mt-1 line-clamp-2 text-sm">
                  {game.description}
                </CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Game options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/studio/games/${game.id}`}>
                    <Pencil className="size-4" />
                    Edit in Studio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/studio/games/${game.id}/settings`}>
                    <Settings className="size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/studio/games/${game.id}/versions`}>
                    <Copy className="size-4" />
                    Version History
                  </Link>
                </DropdownMenuItem>
                {game.status !== 'archived' && (
                  <DropdownMenuItem onClick={() => setPublishOpen(true)}>
                    <Send className="size-4" />
                    {game.publishedVersionId
                      ? 'Publish New Version'
                      : 'Publish'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {game.status === 'archived' ? (
                  <DropdownMenuItem onClick={handleUnarchive}>
                    <ArchiveRestore className="size-4" />
                    Unarchive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="size-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-end gap-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={statusVariant[game.status]}>
              {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
            </Badge>
            <Badge variant="outline">{visibilityLabel[game.visibility]}</Badge>
            <Badge
              variant="outline"
              className="uppercase"
            >
              {game.technology}
            </Badge>
          </div>

          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {game.minPlayers}–{game.maxPlayers}
            </span>
            {game.reviewCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-3" />
                {game.avgRating.toFixed(1)} ({game.reviewCount})
              </span>
            )}
            <span>{game.playCount} plays</span>
          </div>
        </CardContent>
      </Card>

      <PublishGameDialog
        game={game}
        open={publishOpen}
        onOpenChange={setPublishOpen}
      />
      <DeleteGameDialog
        game={game}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
