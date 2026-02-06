'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import {
  ArrowLeft,
  Code2,
  FileBox,
  History,
  Send,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

import type { Game } from '@/types/game';

import { AuthGuard } from '@/components/auth-guard';
import { PublishGameDialog } from '@/components/games/publish-game-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import * as gameService from '@/services/game';

const statusVariant: Record<
  Game['status'],
  'default' | 'secondary' | 'outline'
> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
};

function GameOverviewContent({ gameId }: { gameId: string }) {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publishOpen, setPublishOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await gameService.getGame(gameId);
        setGame(data);
      } catch (_err) {
        setError('Game not found or you do not have access.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [gameId]);

  const handlePublishSuccess = async () => {
    try {
      const { data } = await gameService.getGame(gameId);
      setGame(data);
    } catch (_err) {
      toast.error('Failed to refresh game.');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-24 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error ?? 'Game not found.'}</p>
        <Button
          variant="outline"
          asChild
        >
          <Link href="/studio/games">Back to My Games</Link>
        </Button>
      </div>
    );
  }

  const actions = [
    {
      title: 'Settings',
      description: 'Edit metadata, visibility, and tags',
      href: `/studio/games/${game.id}/settings`,
      icon: Settings,
    },
    {
      title: 'Assets',
      description: 'Upload and manage game files',
      href: `/studio/games/${game.id}/assets`,
      icon: FileBox,
    },
    {
      title: 'Version History',
      description: 'View all published versions',
      href: `/studio/games/${game.id}/versions`,
      icon: History,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
          >
            <Link href="/studio/games">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{game.title}</h1>
              <Badge variant={statusVariant[game.status]}>
                {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
              </Badge>
            </div>
            {game.description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {game.description}
              </p>
            )}
          </div>
        </div>

        {game.status !== 'archived' && (
          <Button
            size="sm"
            onClick={() => setPublishOpen(true)}
          >
            <Send className="size-4" />
            {game.publishedVersionId ? 'Publish Update' : 'Publish'}
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="hover:bg-accent/50 transition-colors">
          <Link href={`/studio/games/${game.id}/editor`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code2 className="text-muted-foreground size-4" />
                <CardTitle className="text-base">Code Editor</CardTitle>
              </div>
              <CardDescription>
                Write and edit your game and controller code
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        {actions.map(({ title, description, href, icon: Icon }) => (
          <Card
            key={href}
            className="hover:bg-accent/50 transition-colors"
          >
            <Link href={href}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="text-muted-foreground size-4" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>

      {game && publishOpen && (
        <PublishGameDialog
          game={game}
          open={publishOpen}
          onOpenChange={(open) => {
            setPublishOpen(open);
            if (!open) handlePublishSuccess();
          }}
        />
      )}
    </div>
  );
}

export default function GameOverviewPage() {
  const params = useParams<{ gameId: string }>();

  return (
    <AuthGuard>
      <GameOverviewContent gameId={params.gameId} />
    </AuthGuard>
  );
}
