'use client';

import { create } from 'zustand';

export type ActiveFile = 'gameScreen' | 'controllerScreen';
export type PreviewMode = 'gameScreen' | 'controllerScreen' | 'split';
export type SidebarPanel = 'assets' | null;

interface EditorState {
  // Active tab in code editor
  activeFile: ActiveFile;
  // Which preview to show
  previewMode: PreviewMode;
  // Open sidebar panel
  sidebarPanel: SidebarPanel;
  // Whether there are unsaved changes
  hasUnsavedChanges: boolean;
  // Whether auto-save is currently in progress
  isSaving: boolean;
  // Last save error
  saveError: string | null;
  // Current in-memory code (may differ from persisted)
  gameScreenCode: string;
  controllerScreenCode: string;

  // Actions
  setActiveFile: (file: ActiveFile) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setSidebarPanel: (panel: SidebarPanel) => void;
  setGameScreenCode: (code: string) => void;
  setControllerScreenCode: (code: string) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  setSaveError: (error: string | null) => void;
  initCode: (gameScreenCode: string, controllerScreenCode: string) => void;
  reset: () => void;
}

const initialState = {
  activeFile: 'gameScreen' as ActiveFile,
  previewMode: 'split' as PreviewMode,
  sidebarPanel: null as SidebarPanel,
  hasUnsavedChanges: false,
  isSaving: false,
  saveError: null,
  gameScreenCode: '',
  controllerScreenCode: '',
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setActiveFile: (activeFile) => set({ activeFile }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setSidebarPanel: (sidebarPanel) => set({ sidebarPanel }),

  setGameScreenCode: (gameScreenCode) =>
    set({ gameScreenCode, hasUnsavedChanges: true }),

  setControllerScreenCode: (controllerScreenCode) =>
    set({ controllerScreenCode, hasUnsavedChanges: true }),

  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setSaveError: (saveError) => set({ saveError }),

  initCode: (gameScreenCode, controllerScreenCode) =>
    set({ gameScreenCode, controllerScreenCode, hasUnsavedChanges: false }),

  reset: () => set(initialState),
}));
