'use client';

import { useCallback, useRef } from 'react';

import MonacoEditor, { type OnMount } from '@monaco-editor/react';

import { cn } from '@/lib/utils';

// p5.js global function stubs so Monaco doesn't flag them as unknown
const P5_TYPES = `
declare function setup(): void;
declare function draw(): void;
declare function preload(): void;
declare function windowResized(): void;
declare function mousePressed(): void;
declare function mouseReleased(): void;
declare function mouseMoved(): void;
declare function mouseDragged(): void;
declare function mouseClicked(): void;
declare function mouseWheel(event: WheelEvent): void;
declare function keyPressed(): void;
declare function keyReleased(): void;
declare function touchStarted(): boolean | void;
declare function touchMoved(): boolean | void;
declare function touchEnded(): boolean | void;

declare function createCanvas(w: number, h: number, renderer?: string): unknown;
declare function resizeCanvas(w: number, h: number): void;
declare function background(v1: unknown, v2?: unknown, v3?: unknown, a?: number): void;
declare function fill(v1: unknown, v2?: unknown, v3?: unknown, a?: number): void;
declare function noFill(): void;
declare function stroke(v1: unknown, v2?: unknown, v3?: unknown, a?: number): void;
declare function noStroke(): void;
declare function strokeWeight(w: number): void;
declare function rect(x: number, y: number, w: number, h: number, r?: number): void;
declare function ellipse(x: number, y: number, w: number, h?: number): void;
declare function circle(x: number, y: number, d: number): void;
declare function line(x1: number, y1: number, x2: number, y2: number): void;
declare function point(x: number, y: number): void;
declare function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
declare function quad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;
declare function arc(x: number, y: number, w: number, h: number, start: number, stop: number, mode?: string): void;
declare function text(str: unknown, x: number, y: number, x2?: number, y2?: number): void;
declare function textSize(s: number): void;
declare function textAlign(h: unknown, v?: unknown): void;
declare function textFont(f: unknown): void;
declare function textWidth(s: string): number;
declare function textAscent(): number;
declare function textDescent(): number;
declare function loadImage(path: string, callback?: (img: unknown) => void): unknown;
declare function image(img: unknown, x: number, y: number, w?: number, h?: number): void;
declare function imageMode(mode: unknown): void;
declare function tint(v1: unknown, v2?: unknown, v3?: unknown, a?: number): void;
declare function noTint(): void;
declare function loadSound(path: string, callback?: (sound: unknown) => void): unknown;
declare function color(v1: unknown, v2?: unknown, v3?: unknown, a?: number): unknown;
declare function lerpColor(c1: unknown, c2: unknown, amt: number): unknown;
declare function red(c: unknown): number;
declare function green(c: unknown): number;
declare function blue(c: unknown): number;
declare function alpha(c: unknown): number;
declare function colorMode(mode: unknown, max1?: number, max2?: number, max3?: number, maxA?: number): void;
declare function push(): void;
declare function pop(): void;
declare function translate(x: number, y: number, z?: number): void;
declare function rotate(angle: number): void;
declare function scale(x: number, y?: number): void;
declare function resetMatrix(): void;
declare function map(value: number, start1: number, stop1: number, start2: number, stop2: number, withinBounds?: boolean): number;
declare function constrain(n: number, low: number, high: number): number;
declare function lerp(start: number, stop: number, amt: number): number;
declare function dist(x1: number, y1: number, x2: number, y2: number): number;
declare function abs(n: number): number;
declare function ceil(n: number): number;
declare function floor(n: number): number;
declare function round(n: number): number;
declare function sqrt(n: number): number;
declare function pow(n: number, e: number): number;
declare function min(...args: number[]): number;
declare function max(...args: number[]): number;
declare function random(low?: number, high?: number): number;
declare function randomSeed(seed: number): void;
declare function noise(x: number, y?: number, z?: number): number;
declare function noiseSeed(seed: number): void;
declare function sin(angle: number): number;
declare function cos(angle: number): number;
declare function tan(angle: number): number;
declare function atan2(y: number, x: number): number;
declare function degrees(radians: number): number;
declare function radians(degrees: number): number;
declare function millis(): number;
declare function frameRate(fps?: number): number;
declare var frameCount: number;
declare var width: number;
declare var height: number;
declare var windowWidth: number;
declare var windowHeight: number;
declare var mouseX: number;
declare var mouseY: number;
declare var pmouseX: number;
declare var pmouseY: number;
declare var mouseIsPressed: boolean;
declare var keyIsPressed: boolean;
declare var key: string;
declare var keyCode: number;
declare const LEFT: unknown;
declare const RIGHT: unknown;
declare const UP_ARROW: number;
declare const DOWN_ARROW: number;
declare const LEFT_ARROW: number;
declare const RIGHT_ARROW: number;
declare const ENTER: number;
declare const RETURN: number;
declare const BACKSPACE: number;
declare const TAB: number;
declare const ESCAPE: number;
declare const CENTER: unknown;
declare const LEFT: unknown;
declare const RIGHT: unknown;
declare const TOP: unknown;
declare const BOTTOM: unknown;
declare const BASELINE: unknown;
declare const RADIUS: unknown;
declare const CORNER: unknown;
declare const CORNERS: unknown;
declare const PI: number;
declare const TWO_PI: number;
declare const HALF_PI: number;
declare const QUARTER_PI: number;
declare const TAU: number;
declare const WEBGL: string;
declare const P2D: string;
declare function rectMode(mode: unknown): void;
declare function ellipseMode(mode: unknown): void;
declare function smooth(): void;
declare function noSmooth(): void;
declare function clear(): void;
declare function getItem(key: string): unknown;
declare function storeItem(key: string, value: unknown): void;
declare function removeItem(key: string): void;
declare function createVector(x?: number, y?: number, z?: number): unknown;
declare function beginShape(kind?: unknown): void;
declare function endShape(mode?: unknown): void;
declare function vertex(x: number, y: number, z?: number): void;
declare function curveVertex(x: number, y: number): void;
declare var CLOSE: unknown;
`;

const AIRCADE_TYPES = `
declare const AirCade: {
  /** Get all connected players */
  getPlayers(): Array<{ id: string; displayName: string; color: string }>;
  /** Get current session info */
  getSessionInfo(): { sessionCode: string; gameName: string };
  /** Register a callback for player input events */
  onPlayerInput(callback: (event: { playerId: string; inputType: string; data: unknown }) => void): void;
  /** Register a callback when a player joins */
  onPlayerJoin(callback: (player: { id: string; displayName: string; color: string }) => void): void;
  /** Register a callback when a player leaves */
  onPlayerLeave(callback: (playerId: string) => void): void;
  /** Broadcast game state to all controllers */
  broadcastState(state: unknown): void;
};
`;

const AIRCADE_CONTROLLER_TYPES = `
declare const AirCade: {
  /** Get the current player info */
  getPlayer(): { id: string; displayName: string; color: string } | null;
  /** Get current session info */
  getSessionInfo(): { sessionCode: string; gameName: string };
  /** Send input to the game */
  sendInput(inputType: string, data: unknown): void;
  /** Register a callback for game state updates */
  onStateUpdate(callback: (state: unknown) => void): void;
};
`;

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  role: 'gameScreen' | 'controllerScreen';
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  onSave,
  role,
  className,
}: CodeEditorProps) {
  // Keep a ref so the keybinding always calls the latest onSave without re-registering
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      // Register p5.js global stubs so functions like background(), fill(), etc. are known
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        P5_TYPES,
        'p5.d.ts',
      );

      // Register AirCade type declarations
      const types =
        role === 'gameScreen' ? AIRCADE_TYPES : AIRCADE_CONTROLLER_TYPES;
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        types,
        'aircade.d.ts',
      );

      // Configure JS defaults for better DX
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        checkJs: true,
        lib: ['es2020', 'dom'],
      });

      // Bind Ctrl+S / Cmd+S to save (prevents browser download dialog)
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        () => onSaveRef.current(),
      );
    },
    [role],
  );

  return (
    <MonacoEditor
      className={cn('h-full w-full', className)}
      language="javascript"
      theme="vs-dark"
      value={value}
      onChange={(val) => onChange(val ?? '')}
      onMount={handleMount}
      options={{
        fontSize: 13,
        fontFamily: '"Spline Sans Mono", "Cascadia Code", monospace',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        tabSize: 2,
        wordWrap: 'on',
        automaticLayout: true,
        padding: { top: 12, bottom: 12 },
        suggest: { showWords: false },
        quickSuggestions: { other: true, comments: false, strings: false },
        scrollbar: { useShadows: false },
        overviewRulerBorder: false,
        renderLineHighlight: 'line',
      }}
    />
  );
}
