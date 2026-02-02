'use client';

import { useEffect, useState } from 'react';

import { Plus } from 'lucide-react';

import { AuthGuard } from '@/components/auth-guard';
import { CreateGameDialog } from '@/components/games/create-game-dialog';
import { GameCard } from '@/components/games/game-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useGameStore } from '@/store/game';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

function MyGamesContent() {
  const { games, isLoading, fetchMyGames } = useGameStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchMyGames(statusFilter !== 'all' ? { status: statusFilter } : undefined);
  }, [fetchMyGames, statusFilter]);

  const isEmpty = !isLoading && games.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Games</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your game projects
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New Game
        </Button>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-44 rounded-xl"
            />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-sm">
            {statusFilter === 'all'
              ? 'No games yet. Create your first game!'
              : `No ${statusFilter} games.`}
          </p>
          {statusFilter === 'all' && (
            <Button
              className="mt-4"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Create Game
            </Button>
          )}
        </div>
      )}

      {!isLoading && games.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
            />
          ))}
        </div>
      )}

      <CreateGameDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}

export default function MyGamesPage() {
  return (
    <AuthGuard>
      <MyGamesContent />
    </AuthGuard>
  );
}
