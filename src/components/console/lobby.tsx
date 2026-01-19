'use client';

import { useMemo, useState } from 'react';

import { Loader2, LogOut, Play } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

import { PONG_GAME_ID } from '@/constants/pong';

import { PlayerList } from '@/components/console/player-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { useSessionStore } from '@/store/session';

export function Lobby() {
  const session = useSessionStore((s) => s.session);
  const players = useSessionStore((s) => s.players);
  const isConnected = useSessionStore((s) => s.isConnected);
  const loadGame = useSessionStore((s) => s.loadGame);
  const endSession = useSessionStore((s) => s.endSession);

  const [isStarting, setIsStarting] = useState(false);

  const joinUrl = useMemo(() => {
    if (typeof window === 'undefined' || !session?.sessionCode) return '';
    return `${window.location.origin}/join/${session.sessionCode}`;
  }, [session?.sessionCode]);

  if (!session) return null;

  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      await loadGame(PONG_GAME_ID);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to start game.',
      );
      setIsStarting(false);
    }
  };

  const handleEndSession = async () => {
    await endSession();
    toast.success('Session ended.');
  };

  const hasPlayers = players.length > 0;

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardDescription>Session Code</CardDescription>
          <CardTitle className="font-mono text-5xl tracking-widest">
            {session.sessionCode}
          </CardTitle>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Connecting…'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {joinUrl && (
            <div className="rounded-lg bg-white p-3">
              <QRCodeSVG
                value={joinUrl}
                size={200}
                level="M"
              />
            </div>
          )}
          <p className="text-muted-foreground text-center text-sm">
            Scan the QR code or go to{' '}
            <span className="font-mono font-medium text-white">
              /join/{session.sessionCode}
            </span>{' '}
            on your phone.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Players ({players.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerList players={players} />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleEndSession}
          className="flex-1"
        >
          <LogOut />
          End Session
        </Button>
        <Button
          onClick={handleStartGame}
          disabled={!hasPlayers || isStarting}
          className="flex-1"
        >
          {isStarting ? (
            <>
              <Loader2 className="animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Play />
              Start Game
            </>
          )}
        </Button>
      </div>

      {!hasPlayers && (
        <p className="text-muted-foreground text-center text-sm">
          Waiting for a player to connect before starting…
        </p>
      )}
    </div>
  );
}
