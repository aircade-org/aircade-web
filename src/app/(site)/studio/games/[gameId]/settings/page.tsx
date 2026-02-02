'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import type { Game } from '@/types/game';

import { AuthGuard } from '@/components/auth-guard';
import { GameSettingsForm } from '@/components/games/game-settings-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import * as gameService from '@/services/game';

function GameSettingsContent({ gameId }: { gameId: string }) {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
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
          <h1 className="text-2xl font-bold">Game Settings</h1>
          <p className="text-muted-foreground text-sm">{game.title}</p>
        </div>
      </div>

      <GameSettingsForm game={game} />
    </div>
  );
}

export default function GameSettingsPage() {
  const params = useParams<{ gameId: string }>();

  return (
    <AuthGuard>
      <GameSettingsContent gameId={params.gameId} />
    </AuthGuard>
  );
}
