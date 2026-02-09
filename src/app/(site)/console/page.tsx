'use client';

import { useEffect } from 'react';

import { AuthGuard } from '@/components/auth-guard';
import { GameList } from '@/components/console/game-list';
import { GameScreen } from '@/components/console/game-screen';
import { Lobby } from '@/components/console/lobby';

import { useSessionStore } from '@/store/session';

function ConsoleContent() {
  const session = useSessionStore((s) => s.session);
  const reset = useSessionStore((s) => s.reset);

  // Clean up session on unmount (navigating away)
  useEffect(() => () => reset(), [reset]);

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <GameList />
      </div>
    );
  }

  if (session.status === 'playing' || session.status === 'paused') {
    return <GameScreen />;
  }

  return (
    <div className="flex h-full items-center justify-center px-4 py-8">
      <Lobby />
    </div>
  );
}

export default function ConsolePage() {
  return (
    <AuthGuard>
      <ConsoleContent />
    </AuthGuard>
  );
}
