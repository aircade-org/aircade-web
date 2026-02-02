'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ArrowLeft, Tag } from 'lucide-react';

import type { Game, GameVersion } from '@/types/game';

import { AuthGuard } from '@/components/auth-guard';
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

function VersionHistoryContent({ gameId }: { gameId: string }) {
  const [game, setGame] = useState<Game | null>(null);
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [gameRes, versionsRes] = await Promise.all([
          gameService.getGame(gameId),
          gameService.getGameVersions(gameId),
        ]);
        setGame(gameRes.data);
        setVersions(versionsRes.data.data);
      } catch (_err) {
        setError('Failed to load version history.');
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
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-20 w-full rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
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
          <h1 className="text-2xl font-bold">Version History</h1>
          {game && (
            <p className="text-muted-foreground text-sm">{game.title}</p>
          )}
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Tag className="text-muted-foreground mb-3 size-10" />
          <p className="text-muted-foreground text-sm">
            No published versions yet.
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Publish your game to create the first version.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <Card key={version.id}>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">v{version.versionNumber}</Badge>
                    {game?.publishedVersionId === version.id && (
                      <Badge>Current</Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {new Date(version.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {version.changelog && (
                  <CardDescription className="mt-2">
                    {version.changelog}
                  </CardDescription>
                )}
                {!version.changelog && (
                  <CardTitle className="text-muted-foreground text-sm font-normal">
                    No changelog provided
                  </CardTitle>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VersionHistoryPage() {
  const params = useParams<{ gameId: string }>();

  return (
    <AuthGuard>
      <VersionHistoryContent gameId={params.gameId} />
    </AuthGuard>
  );
}
