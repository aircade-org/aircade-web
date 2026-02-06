'use client';

import { useEffect, useState } from 'react';

import { ExternalLink, Loader2, Play, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import * as sessionService from '@/services/session';

interface TestSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  gameScreenCode: string;
  controllerScreenCode: string;
}

export function TestSessionDialog({
  open,
  onOpenChange,
  gameId,
  gameScreenCode: _gameScreenCode,
  controllerScreenCode: _controllerScreenCode,
}: TestSessionDialogProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSessionCode(null);
      setSessionId(null);
    }
  }, [open]);

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      // Create a new session
      const { data: session } = await sessionService.createSession();
      setSessionCode(session.sessionCode);
      setSessionId(session.id);

      // Load the game using draft code
      await sessionService.loadGame(session.id, gameId);

      toast.success('Test session started!');
    } catch (_err) {
      toast.error('Failed to start test session.');
      setSessionCode(null);
      setSessionId(null);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    try {
      await sessionService.endSession(sessionId);
      toast.success('Session ended.');
    } catch (_err) {
      // Session may have already ended
    }
    onOpenChange(false);
  };

  const joinUrl =
    sessionCode && typeof window !== 'undefined'
      ? `${window.location.origin}/join/${sessionCode}`
      : null;

  const consoleUrl =
    sessionId && typeof window !== 'undefined'
      ? `${window.location.origin}/console?sessionId=${sessionId}`
      : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val && sessionId) {
          handleEndSession();
        } else {
          onOpenChange(val);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Test Session</DialogTitle>
          <DialogDescription>
            Launch a private session with your current draft code to test with
            real devices.
          </DialogDescription>
        </DialogHeader>

        {!sessionCode && (
          <div className="flex flex-col gap-4 py-2">
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• A private session will be created</li>
              <li>• Your current draft code (not published) will be loaded</li>
              <li>• Share the QR code with players to test on real devices</li>
            </ul>
            <Button
              onClick={handleLaunch}
              disabled={isLaunching}
              className="w-full"
            >
              {isLaunching ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Starting session…
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Start Test Session
                </>
              )}
            </Button>
          </div>
        )}

        {sessionCode && joinUrl && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-xl border bg-white p-3">
              <QRCodeSVG
                value={joinUrl}
                size={200}
                level="M"
              />
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-1 text-xs">Session code</p>
              <p className="font-mono text-4xl font-bold tracking-widest">
                {sessionCode}
              </p>
            </div>

            <p className="text-muted-foreground text-center text-xs">
              Players can join at{' '}
              <span className="font-mono">/join/{sessionCode}</span>
            </p>

            <div className="flex w-full gap-2">
              {consoleUrl && (
                <Button
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <a
                    href={consoleUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Open Console
                  </a>
                </Button>
              )}
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleEndSession}
              >
                <X className="size-4" />
                End Session
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
