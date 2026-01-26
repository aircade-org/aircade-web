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
    <div className="mx-auto w-full max-w-sm p-4 sm:max-w-md lg:max-w-2xl xl:max-w-3xl">
      <h2 className="mb-4 text-center text-xl font-bold sm:mb-6 sm:text-2xl lg:text-3xl">
        Games
      </h2>
      <Card>
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">
            {PONG_GAME.title}
          </CardTitle>
          <CardDescription className="text-sm lg:text-base">
            {PONG_GAME.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mb-3 flex items-center gap-3 text-xs sm:mb-4 sm:gap-4 lg:text-sm">
            <span>
              Players: {PONG_GAME.minPlayers}–{PONG_GAME.maxPlayers}
            </span>
            <span>Tech: {PONG_GAME.technology}</span>
          </div>
          <Button
            onClick={handlePlay}
            disabled={isConnecting}
            className="h-11 w-full sm:h-10 lg:h-12 lg:text-base"
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
