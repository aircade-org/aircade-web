'use client';

import { useCallback, useEffect, useRef } from 'react';

import type { IframeMessage, PlayerInputEventPayload } from '@/types/session';

import { PONG_GAME_SCREEN_CODE } from '@/constants/pong-game-screen';

import { buildGameScreenSrcdoc } from '@/lib/game-runtime';

import { useSessionStore } from '@/store/session';

export function GameScreen() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const session = useSessionStore((s) => s.session);
  const players = useSessionStore((s) => s.players);
  const broadcastGameState = useSessionStore((s) => s.broadcastGameState);
  const setOnPlayerInputEvent = useSessionStore((s) => s.setOnPlayerInputEvent);

  const srcdoc = buildGameScreenSrcdoc(PONG_GAME_SCREEN_CODE);

  // Forward player input from WS to iframe
  const forwardInputToIframe = useCallback(
    (payload: PlayerInputEventPayload) => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'aircade:player_input',
          payload: {
            playerId: payload.playerId,
            inputType: payload.inputType,
            data: payload.data,
          },
        },
        '*',
      );
    },
    [],
  );

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent<IframeMessage>) => {
      const msg = event.data;
      if (!msg?.type?.startsWith('aircade:')) return;

      switch (msg.type) {
        case 'aircade:broadcast_state': {
          const payload = msg.payload as { state: Record<string, unknown> };
          broadcastGameState(payload.state);
          break;
        }
        case 'aircade:ready':
          // Send init data to iframe
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'aircade:init',
              payload: {
                role: 'host',
                players: players.map((p) => ({
                  id: p.id,
                  displayName: p.displayName,
                  avatarUrl: p.avatarUrl,
                })),
                sessionInfo: {
                  sessionId: session?.id ?? '',
                  sessionCode: session?.sessionCode ?? '',
                  status: session?.status ?? 'playing',
                  maxPlayers: session?.maxPlayers ?? 8,
                },
              },
            },
            '*',
          );
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [broadcastGameState, players, session]);

  // Register the input forwarding callback
  useEffect(() => {
    setOnPlayerInputEvent(forwardInputToIframe);
    return () => setOnPlayerInputEvent(null);
  }, [forwardInputToIframe, setOnPlayerInputEvent]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <iframe
        ref={iframeRef}
        srcDoc={srcdoc}
        sandbox="allow-scripts"
        title="Game Screen"
        className="h-full w-full border-none"
      />
    </div>
  );
}
