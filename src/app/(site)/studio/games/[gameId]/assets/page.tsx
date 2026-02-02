'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import type { Game } from '@/types/game';

import { AuthGuard } from '@/components/auth-guard';
import { AssetManager } from '@/components/games/asset-manager';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import * as gameService from '@/services/game';

function AssetManagerContent({ gameId }: { gameId: string }) {
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
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
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
          <h1 className="text-2xl font-bold">Assets</h1>
          <p className="text-muted-foreground text-sm">{game.title}</p>
        </div>
      </div>

      <AssetManager gameId={gameId} />
    </div>
  );
}

export default function AssetsPage() {
  const params = useParams<{ gameId: string }>();

  return (
    <AuthGuard>
      <AssetManagerContent gameId={params.gameId} />
    </AuthGuard>
  );
}
