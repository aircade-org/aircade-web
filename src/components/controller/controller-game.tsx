'use client';

import { useCallback, useEffect, useRef } from 'react';

import type { GameStatePayload, IframeMessage } from '@/types/session';

import { PONG_CONTROLLER_SCREEN_CODE } from '@/constants/pong-controller-screen';

import { buildControllerScreenSrcdoc } from '@/lib/game-runtime';

import { useSessionStore } from '@/store/session';

export function ControllerGame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const session = useSessionStore((s) => s.session);
  const currentPlayer = useSessionStore((s) => s.currentPlayer);
  const sendPlayerInput = useSessionStore((s) => s.sendPlayerInput);
  const setOnGameStateEvent = useSessionStore((s) => s.setOnGameStateEvent);

  const srcdoc = buildControllerScreenSrcdoc(PONG_CONTROLLER_SCREEN_CODE);

  // Forward game state from WS to iframe
  const forwardStateToIframe = useCallback((payload: GameStatePayload) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'aircade:state_update',
        payload: { state: payload.state },
      },
      '*',
    );
  }, []);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent<IframeMessage>) => {
      const msg = event.data;
      if (!msg?.type?.startsWith('aircade:')) return;

      switch (msg.type) {
        case 'aircade:send_input': {
          const payload = msg.payload as {
            inputType: string;
            data: Record<string, unknown>;
          };
          sendPlayerInput(payload.inputType, payload.data);
          break;
        }
        case 'aircade:ready':
          // Send init data to iframe
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'aircade:init',
              payload: {
                role: 'player',
                player: currentPlayer
                  ? {
                      id: currentPlayer.id,
                      displayName: currentPlayer.displayName,
                      avatarUrl: currentPlayer.avatarUrl,
                    }
                  : null,
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
  }, [sendPlayerInput, currentPlayer, session]);

  // Register the state forwarding callback
  useEffect(() => {
    setOnGameStateEvent(forwardStateToIframe);
    return () => setOnGameStateEvent(null);
  }, [forwardStateToIframe, setOnGameStateEvent]);

  // Prevent default touch behaviors on the controller page
  useEffect(() => {
    const prevent = (e: TouchEvent) => {
      e.preventDefault();
    };
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.addEventListener('touchmove', prevent, { passive: false });

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.removeEventListener('touchmove', prevent);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <iframe
        ref={iframeRef}
        srcDoc={srcdoc}
        sandbox="allow-scripts"
        title="Controller Screen"
        className="h-full w-full border-none"
      />
    </div>
  );
}
