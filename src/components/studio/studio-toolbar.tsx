'use client';

import Link from 'next/link';

import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  FolderOpen,
  Loader2,
  Monitor,
  Play,
  Save,
  Smartphone,
  SplitSquareHorizontal,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import type { ActiveFile, PreviewMode, SidebarPanel } from '@/store/editor';

interface StudioToolbarProps {
  gameId: string;
  gameTitle: string;
  activeFile: ActiveFile;
  previewMode: PreviewMode;
  sidebarPanel: SidebarPanel;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSetActiveFile: (file: ActiveFile) => void;
  onSetPreviewMode: (mode: PreviewMode) => void;
  onToggleSidebar: (panel: SidebarPanel) => void;
  onSave: () => void;
  onTestSession: () => void;
}

export function StudioToolbar({
  gameId,
  gameTitle,
  activeFile,
  previewMode,
  sidebarPanel,
  hasUnsavedChanges,
  isSaving,
  onSetActiveFile,
  onSetPreviewMode,
  onToggleSidebar,
  onSave,
  onTestSession,
}: StudioToolbarProps) {
  return (
    <div className="bg-background flex h-12 shrink-0 items-center gap-2 border-b px-3">
      {/* Back link */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
          >
            <Link href={`/studio/games/${gameId}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Back to game overview</TooltipContent>
      </Tooltip>

      {/* Game title */}
      <span className="mr-2 max-w-[120px] truncate text-sm font-medium sm:max-w-[200px]">
        {gameTitle}
      </span>

      {/* File tab switcher */}
      <div className="flex items-center rounded-md border p-0.5">
        <Button
          variant={activeFile === 'gameScreen' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onSetActiveFile('gameScreen')}
        >
          Game
        </Button>
        <Button
          variant={activeFile === 'controllerScreen' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onSetActiveFile('controllerScreen')}
        >
          Controller
        </Button>
      </div>

      <div className="flex-1" />

      {/* Save indicator */}
      {hasUnsavedChanges && !isSaving && (
        <Badge
          variant="outline"
          className="hidden text-xs sm:flex"
        >
          Unsaved
        </Badge>
      )}

      {/* Save button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="h-8"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span className="hidden sm:inline">
              {isSaving ? 'Saving…' : 'Save'}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save (auto-saves after 1.5s)</TooltipContent>
      </Tooltip>

      {/* Preview mode dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
          >
            {previewMode === 'gameScreen' && <Monitor className="size-3.5" />}
            {previewMode === 'controllerScreen' && (
              <Smartphone className="size-3.5" />
            )}
            {previewMode === 'split' && (
              <SplitSquareHorizontal className="size-3.5" />
            )}
            <span className="hidden sm:inline">Preview</span>
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSetPreviewMode('gameScreen')}>
            <Monitor className="size-4" />
            Game Screen
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSetPreviewMode('controllerScreen')}
          >
            <Smartphone className="size-4" />
            Controller Screen
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSetPreviewMode('split')}>
            <SplitSquareHorizontal className="size-4" />
            Split View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assets sidebar toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={sidebarPanel === 'assets' ? 'secondary' : 'outline'}
            size="icon-sm"
            className="h-8 w-8"
            onClick={() =>
              onToggleSidebar(sidebarPanel === 'assets' ? null : 'assets')
            }
          >
            <FolderOpen className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Assets</TooltipContent>
      </Tooltip>

      {/* p5.js reference */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="h-8 w-8"
            asChild
          >
            <a
              href="https://p5js.org/reference/"
              target="_blank"
              rel="noreferrer"
            >
              <BookOpen className="size-3.5" />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>p5.js reference</TooltipContent>
      </Tooltip>

      {/* Test session button */}
      <Button
        size="sm"
        className="h-8"
        onClick={onTestSession}
      >
        <Play className="size-3.5" />
        <span className="hidden sm:inline">Test</span>
      </Button>
    </div>
  );
}
