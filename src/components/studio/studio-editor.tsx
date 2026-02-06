'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

const MIN_PREVIEW_WIDTH = 280;
const MAX_PREVIEW_WIDTH = 900;
const DEFAULT_PREVIEW_WIDTH = 480;

import { toast } from 'sonner';

import type { Game } from '@/types/game';

import { AuthGuard } from '@/components/auth-guard';

import * as gameService from '@/services/game';

import { useEditorStore } from '@/store/editor';

import { AssetBrowser } from './asset-browser';
import { CodeEditor } from './code-editor';
import { PreviewPanel } from './preview-panel';
import { StudioToolbar } from './studio-toolbar';
import { TestSessionDialog } from './test-session-dialog';

const AUTOSAVE_DELAY_MS = 1500;

const DEFAULT_GAME_CODE = `// AirCade Game Screen
// Available API:
//   AirCade.getPlayers()        — array of connected players
//   AirCade.onPlayerInput(fn)   — fn({ playerId, inputType, data })
//   AirCade.broadcastState(obj) — send state to all controllers

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20);
}

function draw() {
  background(20, 20, 30);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text('Your game goes here!', width / 2, height / 2);

  const players = AirCade.getPlayers();
  textSize(16);
  text(\`Players: \${players.length}\`, width / 2, height / 2 + 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
`;

const DEFAULT_CONTROLLER_CODE = `// AirCade Controller Screen
// Available API:
//   AirCade.getPlayer()         — current player object
//   AirCade.sendInput(type, data) — send input to game
//   AirCade.onStateUpdate(fn)   — fn(gameState)

let gameState = null;

AirCade.onStateUpdate((state) => {
  gameState = state;
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20);
}

function draw() {
  background(20, 20, 30);

  const player = AirCade.getPlayer();
  if (!player) return;

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(\`Hello, \${player.displayName}!\`, width / 2, 60);

  // Example: big tap button
  const btnSize = min(width, height) * 0.4;
  const cx = width / 2;
  const cy = height / 2;

  fill(player.color || '#3b82f6');
  noStroke();
  ellipse(cx, cy, btnSize);

  fill(255);
  textSize(20);
  text('TAP', cx, cy);
}

function touchStarted() {
  AirCade.sendInput('tap', { x: mouseX / width, y: mouseY / height });
  return false;
}
`;

interface StudioEditorProps {
  gameId: string;
}

function StudioEditorContent({ gameId }: StudioEditorProps) {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testSessionOpen, setTestSessionOpen] = useState(false);

  const {
    activeFile,
    previewMode,
    sidebarPanel,
    hasUnsavedChanges,
    isSaving,
    gameScreenCode,
    controllerScreenCode,
    setActiveFile,
    setPreviewMode,
    setSidebarPanel,
    setGameScreenCode,
    setControllerScreenCode,
    setHasUnsavedChanges,
    setIsSaving,
    setSaveError,
    initCode,
    reset,
  } = useEditorStore();

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCodeRef = useRef<{
    gameScreenCode?: string;
    controllerScreenCode?: string;
  }>({});

  // Resizable preview panel
  const [previewWidth, setPreviewWidth] = useState(DEFAULT_PREVIEW_WIDTH);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartWidthRef.current = previewWidth;

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDraggingRef.current) return;
        // Dragging left increases width (handle is on the left of preview)
        const delta = dragStartXRef.current - ev.clientX;
        const newWidth = Math.min(
          MAX_PREVIEW_WIDTH,
          Math.max(MIN_PREVIEW_WIDTH, dragStartWidthRef.current + delta),
        );
        setPreviewWidth(newWidth);
      };

      const onMouseUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [previewWidth],
  );

  // Load game on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await gameService.getGame(gameId);
        setGame(data);
        initCode(
          data.gameScreenCode ?? DEFAULT_GAME_CODE,
          data.controllerScreenCode ?? DEFAULT_CONTROLLER_CODE,
        );
      } catch (_err) {
        toast.error('Failed to load game.');
        router.push('/studio/games');
      } finally {
        setIsLoading(false);
      }
    };
    load();

    return () => {
      reset();
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const saveNow = useCallback(
    async (overrides?: {
      gameScreenCode?: string;
      controllerScreenCode?: string;
    }) => {
      const payload = {
        gameScreenCode: overrides?.gameScreenCode ?? gameScreenCode,
        controllerScreenCode:
          overrides?.controllerScreenCode ?? controllerScreenCode,
      };
      setIsSaving(true);
      setSaveError(null);
      try {
        await gameService.updateGame(gameId, payload);
        setHasUnsavedChanges(false);
        pendingCodeRef.current = {};
      } catch (_err) {
        setSaveError('Auto-save failed.');
        toast.error('Failed to save. Check your connection.');
      } finally {
        setIsSaving(false);
      }
    },
    [
      gameId,
      gameScreenCode,
      controllerScreenCode,
      setIsSaving,
      setSaveError,
      setHasUnsavedChanges,
    ],
  );

  const scheduleAutoSave = useCallback(
    (newCode: { gameScreenCode?: string; controllerScreenCode?: string }) => {
      pendingCodeRef.current = { ...pendingCodeRef.current, ...newCode };
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        saveNow(pendingCodeRef.current);
      }, AUTOSAVE_DELAY_MS);
    },
    [saveNow],
  );

  const handleGameScreenChange = useCallback(
    (code: string) => {
      setGameScreenCode(code);
      scheduleAutoSave({ gameScreenCode: code });
    },
    [setGameScreenCode, scheduleAutoSave],
  );

  const handleControllerScreenChange = useCallback(
    (code: string) => {
      setControllerScreenCode(code);
      scheduleAutoSave({ controllerScreenCode: code });
    },
    [setControllerScreenCode, scheduleAutoSave],
  );

  const handleManualSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    saveNow();
  }, [saveNow]);

  // Insert asset URL at cursor in editor
  const handleInsertAssetUrl = useCallback(
    (url: string) => {
      const snippet = `'${url}'`;
      if (activeFile === 'gameScreen') {
        handleGameScreenChange(gameScreenCode + snippet);
      } else {
        handleControllerScreenChange(controllerScreenCode + snippet);
      }
      toast.success('Asset URL inserted into editor.');
    },
    [
      activeFile,
      gameScreenCode,
      controllerScreenCode,
      handleGameScreenChange,
      handleControllerScreenChange,
    ],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading editor…</div>
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <StudioToolbar
        gameId={gameId}
        gameTitle={game.title}
        activeFile={activeFile}
        previewMode={previewMode}
        sidebarPanel={sidebarPanel}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSetActiveFile={setActiveFile}
        onSetPreviewMode={setPreviewMode}
        onToggleSidebar={setSidebarPanel}
        onSave={handleManualSave}
        onTestSession={() => setTestSessionOpen(true)}
      />

      {/* Main area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Code editor */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden border-r">
          <div className="h-full">
            {activeFile === 'gameScreen' ? (
              <CodeEditor
                key="gameScreen"
                value={gameScreenCode}
                onChange={handleGameScreenChange}
                onSave={handleManualSave}
                role="gameScreen"
              />
            ) : (
              <CodeEditor
                key="controllerScreen"
                value={controllerScreenCode}
                onChange={handleControllerScreenChange}
                onSave={handleManualSave}
                role="controllerScreen"
              />
            )}
          </div>
        </div>

        {/* Preview panels */}
        <div
          className="relative flex min-w-0 shrink-0 flex-col overflow-hidden"
          style={{ width: previewWidth }}
        >
          {/* Drag handle */}
          <div
            className="bg-border hover:bg-primary/50 absolute top-0 left-0 z-10 h-full w-1 cursor-col-resize transition-colors"
            onMouseDown={handleResizeMouseDown}
          />
          {previewMode === 'split' && (
            <>
              <div className="flex-1 overflow-hidden border-b">
                <PreviewPanel
                  code={gameScreenCode}
                  role="gameScreen"
                  className="h-full"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <PreviewPanel
                  code={controllerScreenCode}
                  role="controllerScreen"
                  className="h-full"
                />
              </div>
            </>
          )}
          {previewMode === 'gameScreen' && (
            <PreviewPanel
              code={gameScreenCode}
              role="gameScreen"
              className="h-full"
            />
          )}
          {previewMode === 'controllerScreen' && (
            <PreviewPanel
              code={controllerScreenCode}
              role="controllerScreen"
              className="h-full"
            />
          )}
        </div>

        {/* Asset sidebar */}
        {sidebarPanel === 'assets' && (
          <div className="w-64 shrink-0 overflow-hidden border-l">
            <AssetBrowser
              gameId={gameId}
              onInsert={handleInsertAssetUrl}
            />
          </div>
        )}
      </div>

      {/* Test Session dialog */}
      <TestSessionDialog
        open={testSessionOpen}
        onOpenChange={setTestSessionOpen}
        gameId={gameId}
        gameScreenCode={gameScreenCode}
        controllerScreenCode={controllerScreenCode}
      />
    </div>
  );
}

export function StudioEditor({ gameId }: StudioEditorProps) {
  return (
    <AuthGuard>
      <StudioEditorContent gameId={gameId} />
    </AuthGuard>
  );
}
