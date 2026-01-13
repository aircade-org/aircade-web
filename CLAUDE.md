# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

AirCade Web is the Next.js frontend for AirCade — a browser-based multiplayer
game creation and playing platform. Three core experiences drive the
architecture:

1. **Creative Studio** — Browser code editor (Monaco Editor) for building games
   with p5.js
2. **Console** (Big Screen) — Game lobby and rendering surface on
   TV/laptop/projector
3. **Controller** (Smartphone) — Dynamic touch interface as a custom game
   controller

Game sessions use WebSockets for real-time communication between Console and
Controller clients.

Related repos: **aircade-api** (Rust/Axum backend), **aircade-doc** (specs,
mounted at `docs/` as a submodule).

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with auto-fix
pnpm format           # Prettier format all files
pnpm format:check     # Check formatting
pnpm type-check       # TypeScript type checking (tsc --noEmit)
pnpm run check-all    # Type-check + lint + format check (CI equivalent)
```

No test framework is configured yet.

## Architecture

- **Next.js 16** with App Router, **React 19**, React Compiler enabled
- **Route group**: `src/app/(site)/` wraps the main site layout
- **Providers**: `src/app/providers.tsx` — client-side provider tree (currently
  `ThemeProvider` from next-themes, dark theme default)
- **State management**: Zustand (installed, no stores created yet)
- **UI components**: shadcn/ui (New York style) in `src/components/ui/` — 58+
  Radix-based components. Do not manually edit these files; use
  `npx shadcn@latest add <component>` instead
- **Styling**: Tailwind CSS 4 with OKLCH design tokens defined as CSS variables
  in `src/app/globals.css`. Class-based dark mode
- **Fonts**: Lato (sans) and Spline Sans Mono (mono), loaded via
  `next/font/google`
- **Path alias**: `@/*` maps to `./src/*`
- **API exposure**: `process.env.API` is the client-accessible API URL (mapped
  from `API_URL` in next.config.ts)
- **Icons**: Lucide React

## Code Conventions

**TypeScript rules (enforced by ESLint):**

- No `any` — use proper types
- Use `import type { ... }` with inline style for type-only imports
- Use `interface` over `type` for object shapes
- Unused variables must be prefixed with `_`
- No `console.log` — only `console.warn` and `console.error`

**React/JSX rules:**

- Self-closing components when no children
- No curly braces around string-only props/children
- Use Next.js `<Link>` and `<Image>`, not `<a>` or `<img>`

**Style rules:**

- Arrow function bodies: expression when possible (`as-needed`)
- Object shorthand, prefer-const, prefer-template, no nested ternary
- No `return await` — return the promise directly

**Import order** (auto-sorted by Prettier plugin):

1. `react`, `react-dom`
2. `next`, `next/*`
3. Third-party modules
4. `@/types`, `@/config`, `@/constants`
5. `@/components`, `@/lib`, `@/hooks`
6. `@/utils`, `@/helpers`, `@/services`, `@/store`, `@/styles`
7. Relative imports (`../`, `./`)

**Formatting**: Prettier with single quotes, semicolons, 2-space indent,
trailing commas, LF line endings, single JSX attribute per line.

## CI

GitHub Actions on push/PR to `main`: type-check → build (Node 22, pnpm 10).

## Documentation

The `docs/` submodule contains comprehensive specs. Key references:

- `docs/app/api/api-endpoints.md` — Full REST API and WebSocket protocol
- `docs/app/shared/specification.md` — Functional requirements
- `docs/app/shared/entities.md` — Database schema
- `docs/app/shared/technical-stack.md` — Full dependency list with versions
- `docs/general/milestones.md` — Development roadmap
