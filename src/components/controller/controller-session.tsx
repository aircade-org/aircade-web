'use client';

import { CircleOff } from 'lucide-react';

import { ControllerGame } from '@/components/controller/controller-game';
import { ControllerLobby } from '@/components/controller/controller-lobby';
import { Button } from '@/components/ui/button';

import { useSessionStore } from '@/store/session';

export function ControllerSession() {
  const session = useSessionStore((s) => s.session);
  const reset = useSessionStore((s) => s.reset);

  if (!session) return null;

  if (session.status === 'ended') {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 p-4 sm:gap-4">
        <CircleOff className="text-muted-foreground size-8 sm:size-10" />
        <h2 className="text-center text-lg font-bold sm:text-xl">
          Session Ended
        </h2>
        <p className="text-muted-foreground text-center text-sm">
          The host has ended the session.
        </p>
        <Button
          variant="outline"
          onClick={reset}
          className="h-11 sm:h-10"
        >
          Join Another Session
        </Button>
      </div>
    );
  }

  if (session.status === 'playing' || session.status === 'paused') {
    return <ControllerGame />;
  }

  return <ControllerLobby />;
}
