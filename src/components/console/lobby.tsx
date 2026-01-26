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
    <div className="mx-auto w-full max-w-sm space-y-4 p-4 sm:max-w-md sm:space-y-6 lg:max-w-2xl xl:max-w-3xl">
      <Card>
        <CardHeader className="space-y-2 text-center sm:space-y-3">
          <CardDescription className="text-base sm:text-lg">
            Session Code
          </CardDescription>
          <CardTitle className="font-mono text-4xl tracking-widest sm:text-5xl lg:text-6xl xl:text-7xl">
            {session.sessionCode}
          </CardTitle>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge
              variant={isConnected ? 'default' : 'secondary'}
              className="text-xs sm:text-sm"
            >
              {isConnected ? 'Connected' : 'Connecting…'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-6">
          {joinUrl && (
            <div className="rounded-lg bg-white p-2.5 sm:p-3 lg:p-4">
              <QRCodeSVG
                value={joinUrl}
                size={180}
                level="M"
                className="sm:hidden"
              />
              <QRCodeSVG
                value={joinUrl}
                size={220}
                level="M"
                className="hidden sm:block lg:hidden"
              />
              <QRCodeSVG
                value={joinUrl}
                size={280}
                level="M"
                className="hidden lg:block xl:hidden"
              />
              <QRCodeSVG
                value={joinUrl}
                size={340}
                level="M"
                className="hidden xl:block"
              />
            </div>
          )}
          <p className="text-muted-foreground text-center text-xs sm:text-sm lg:text-base">
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
          <CardTitle className="text-base sm:text-lg lg:text-xl">
            Players ({players.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerList players={players} />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 lg:gap-4">
        <Button
          variant="outline"
          onClick={handleEndSession}
          className="h-11 flex-1 sm:h-10 lg:h-12 lg:text-base"
        >
          <LogOut />
          End Session
        </Button>
        <Button
          onClick={handleStartGame}
          disabled={!hasPlayers || isStarting}
          className="h-11 flex-1 sm:h-10 lg:h-12 lg:text-base"
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
        <p className="text-muted-foreground text-center text-xs sm:text-sm lg:text-base">
          Waiting for a player to connect before starting…
        </p>
      )}
    </div>
  );
}
