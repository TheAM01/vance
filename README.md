# Vance

**Vance** is a freelance command center — a management system for freelancers built around
one idea: organize your **projects**, break them into **tasks**, and let the app build your
**schedule** for you. Track every revision, every client, and every dollar.

> A freelancer-management sibling of *Classman*: same precision-engineered UI, typography,
> animations and stack — pointed at projects, tasks and revenue instead of classes.

## ✨ Features

- **Projects (full CRUD)** — name, type, fields/skill areas, client + client type, lead
  source, start date & deadline, production URL, GitHub URL, money, notes, theme color and
  status (active / on-hold / completed / cancelled).
- **Tasks** — per project, with priority, hour estimates and deadlines. Full CRUD, with a
  one-click complete toggle.
- **Changes** — log revision requests ("Change 1", "Change 2"…) with their own status and
  optional extra charge. Full CRUD.
- **Auto Schedule** — every incomplete task is sorted by deadline + priority and packed into
  a day-by-day plan against a configurable daily-hours budget, flagging anything overdue or
  at risk of slipping.
- **Analytics** — total / earned / pending revenue, task completion, hours, the fields you
  work in most, revenue by source, client-type and status breakdowns, change-request
  frequency, and a top-projects-by-value leaderboard.
- **Themeable** — light/dark/system, seven fonts, 30+ background textures.

## 🧱 Stack

Next.js 16 (App Router) · React 18 · TypeScript · Tailwind CSS v3 · MongoDB · SWR ·
Framer Motion · lucide-react · next-themes.

## 🚀 Running locally

Prerequisites: Node 20+, pnpm, a MongoDB instance.

```bash
pnpm install
# create .env.local (see below)
pnpm dev
```

`.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=Cluster0
ADMIN_USERNAME=vance
ADMIN_PASSWORD=freeman
```

Open http://localhost:3000. The landing page is public; everything else lives behind the
single-account login. The MongoDB database name (`vance`) is hard-coded in `lib/mongodb.ts`.

## 🗺️ Map

```
app/
  page.tsx            landing
  login/              auth
  app/                dashboard (metrics + today + upcoming schedule)
  projects/           list + create; [id]/ detail (props, money, tasks, changes)
  schedule/           full auto-arranged day-by-day plan
  analytics/          revenue / time / fields / changes
  settings/           scheduling + appearance prefs
  api/projects/...    REST CRUD for projects, tasks, changes
components/           layout chrome, theme providers, project & scheduler UI
lib/                  mongodb, types, scheduler, date-utils, swr-fetcher
```
