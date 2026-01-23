'use client';

import { Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import { useSessionStore } from '@/store/session';

export function ControllerLobby() {
  const session = useSessionStore((s) => s.session);
  const currentPlayer = useSessionStore((s) => s.currentPlayer);
  const isConnected = useSessionStore((s) => s.isConnected);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Loader2 className="text-muted-foreground size-10 animate-spin" />
      <h2 className="text-xl font-bold">Waiting for host to start…</h2>
      {currentPlayer && (
        <p className="text-muted-foreground text-sm">
          Playing as{' '}
          <span className="font-medium text-white">
            {currentPlayer.displayName}
          </span>
        </p>
      )}
      {session && (
        <p className="text-muted-foreground text-sm">
          Session:{' '}
          <span className="font-mono font-medium">{session.sessionCode}</span>
        </p>
      )}
      <Badge variant={isConnected ? 'default' : 'secondary'}>
        {isConnected ? 'Connected' : 'Reconnecting…'}
      </Badge>
    </div>
  );
}
