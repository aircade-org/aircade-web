'use client';

import { useEffect, useRef, useState } from 'react';

import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  buildControllerScreenSrcdoc,
  buildGameScreenSrcdoc,
} from '@/lib/game-runtime';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  code: string;
  role: 'gameScreen' | 'controllerScreen';
  className?: string;
}

export function PreviewPanel({ code, role, className }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);

  const srcdoc =
    role === 'gameScreen'
      ? buildGameScreenSrcdoc(code)
      : buildControllerScreenSrcdoc(code);

  // Initialize iframe once mounted
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      // Send init message with mock data so games can use the AirCade API
      const mockPlayers = [
        { id: 'preview-player-1', displayName: 'Player 1', color: '#3b82f6' },
        { id: 'preview-player-2', displayName: 'Player 2', color: '#ef4444' },
      ];
      const mockSessionInfo = { sessionCode: 'PREVIEW', gameName: 'Preview' };

      if (role === 'gameScreen') {
        iframe.contentWindow?.postMessage(
          {
            type: 'aircade:init',
            payload: { players: mockPlayers, sessionInfo: mockSessionInfo },
          },
          '*',
        );
      } else {
        iframe.contentWindow?.postMessage(
          {
            type: 'aircade:init',
            payload: {
              player: mockPlayers[0],
              sessionInfo: mockSessionInfo,
            },
          },
          '*',
        );
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [role, key]);

  const handleRefresh = () => setKey((k) => k + 1);

  const content = (
    <div className={cn('relative flex h-full w-full flex-col', className)}>
      <div className="bg-muted/50 flex items-center justify-between border-b px-3 py-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          {role === 'gameScreen' ? 'Game Screen' : 'Controller Screen'}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleRefresh}
          title="Refresh preview"
        >
          <RefreshCw className="size-3.5" />
        </Button>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#141414]">
        {role === 'controllerScreen' ? (
          // Simulated phone frame
          <div className="relative flex h-[560px] w-[280px] flex-shrink-0 flex-col overflow-hidden rounded-[2.5rem] border-[6px] border-neutral-700 bg-black shadow-2xl">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-black" />
            <iframe
              key={key}
              ref={iframeRef}
              srcDoc={srcdoc}
              sandbox="allow-scripts"
              className="h-full w-full border-0"
              title="Controller Screen Preview"
            />
          </div>
        ) : (
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={srcdoc}
            sandbox="allow-scripts"
            className="h-full w-full border-0"
            title="Game Screen Preview"
          />
        )}
      </div>
    </div>
  );

  return content;
}
