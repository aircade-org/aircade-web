'use client';

import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

import { PONG_GAME } from '@/constants/pong';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useSessionStore } from '@/store/session';

export function GameList() {
  const createSession = useSessionStore((s) => s.createSession);
  const isConnecting = useSessionStore((s) => s.isConnecting);

  const handlePlay = async () => {
    try {
      await createSession();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create session.',
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <h2 className="mb-6 text-center text-2xl font-bold">Games</h2>
      <Card>
        <CardHeader>
          <CardTitle>{PONG_GAME.title}</CardTitle>
          <CardDescription>{PONG_GAME.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mb-4 flex items-center gap-4 text-xs">
            <span>
              Players: {PONG_GAME.minPlayers}–{PONG_GAME.maxPlayers}
            </span>
            <span>Tech: {PONG_GAME.technology}</span>
          </div>
          <Button
            onClick={handlePlay}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="animate-spin" />
                Creating session…
              </>
            ) : (
              <>
                <Play />
                Play
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
