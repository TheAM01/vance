# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Vance** is a management system for freelancers — CRUD over **Projects**, each of which
embeds **Tasks** and **Changes** (revision requests). From the tasks it builds an
automatic day-by-day **Schedule**, and it surfaces **Analytics** (revenue, time, fields,
change frequency). The UI, typography, animations and stack are a deliberate sibling of
the `classman3` project.

## Commands

- `pnpm dev` — start Next.js dev server with Turbopack on port 3000.
- `pnpm build` — production build.
- `pnpm start` — run the production server (requires a prior build).
- `pnpm lint` — Next.js / ESLint.

No test suite is configured. `next.config.mjs` sets `typescript.ignoreBuildErrors`.

### Required environment variables (`.env.local`)

- `MONGODB_URI` — connection string. The DB name `vance` is hard-coded in `lib/mongodb.ts`,
  so the URI's database segment is ignored.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — single-account credentials checked by
  `app/api/login/route.ts`. There is no user table.

## Architecture

### Stack

Next.js 16 App Router, React 18, TypeScript (strict). Tailwind CSS v3 (the v4 PostCSS
package is present but `tailwind.config.ts` + `tailwindcss@3` are authoritative). Path
alias `@/*` → repo root. Icons: `lucide-react`. Data: `swr`. Animations: `framer-motion`.
Fonts via `next/font` + `geist`.

### Auth & routing

`middleware.ts` is the only auth gate: a `session` cookie set by `/api/login`. It lets
`/`, `/login`, `/api/login`, `_next` and any path with a `.` through; redirects
unauthenticated pages to `/login`; returns **401 JSON** for unauthenticated `/api/*`
(keep this contract). `app/layout-client.tsx` swaps chrome by pathname: `/` is the bare
landing, `/login` is fixed-height, everything else gets `Sidebar` + `GlobalHeader`.

### Provider stack (preserve order)

`ThemeProvider → FontProvider → TextureProvider → SettingsProvider → LayoutClient`
(`app/layout.tsx`). `useSettings()` exposes UI prefs + `hoursPerDay` + `currencySymbol`,
persisted to `localStorage` (keys prefixed `vance_` / `vance-`).

### Data model (MongoDB, single collection)

One collection: **`projects`**. Each document embeds its `tasks: Task[]` and
`changes: Change[]` arrays — a single read returns everything for the detail view. See
`lib/types.ts`. Project `_id` is normally a real `ObjectId`; route handlers use
`ObjectId.isValid(id) ? new ObjectId(id) : id`. Task/Change `_id`s are server-generated
UUIDs; sub-item updates use array filters (`tasks.$[t]`, `changes.$[c]`).

API surface:
- `GET/POST /api/projects`
- `GET/PATCH/DELETE /api/projects/[id]`
- `POST /api/projects/[id]/tasks`, `PATCH/DELETE /api/projects/[id]/tasks/[taskId]`
- `POST /api/projects/[id]/changes`, `PATCH/DELETE /api/projects/[id]/changes/[changeId]`

### Auto-scheduler

`lib/scheduler.ts#buildSchedule(projects, { hoursPerDay })` flattens every incomplete task
from non-finished projects, sorts by **deadline → priority → order**, and greedily packs
them into days from today up to the daily hour budget. Tasks slotted past their deadline
are flagged `atRisk`; already-past deadlines are `overdue`. `groupByDay()` buckets the
result. Consumed by `components/scheduler/schedule-board.tsx` (used on `/app` and
`/schedule`). Keep date handling in `lib/date-utils.ts` (avoid `new Date('YYYY-MM-DD')`,
which shifts days in non-UTC zones).

### Pages

`/` landing · `/login` · `/app` dashboard · `/projects` (+`/[id]`) · `/schedule` ·
`/analytics` · `/settings`. The landing renders self-contained mock dashboards
(`components/landing/dashboard-mock.tsx`) inside browser-window chrome rather than
screenshots, so it needs no image assets.
