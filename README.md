# Placement OS

A daily operating system for placement preparation — eight fixed tasks, a
rotating core subject, a weighted score out of 100, streaks, XP, levels and a
year-long consistency calendar.

The product decision that shapes everything else: **unfinished tasks never roll
over**. Every day starts clean. The app is built to measure consistency, not to
accumulate a backlog that eventually reads as failure.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 with CSS-variable design tokens |
| Database | MongoDB Atlas + Mongoose |
| Charts | Recharts |
| Icons | Lucide |
| Hosting | Vercel (Node runtime, `bom1`) |

A document store suits this domain unusually well: a day is a bounded aggregate
that is always read and written whole, and — because of the no-rollover rule —
days never reference one another.

---

## Getting started

### 1. A database

The app talks to MongoDB over a connection string, so hosted and local are the
same code path.

**MongoDB Atlas (what the deployment uses).** Create a free M0 cluster, then:

- **Database Access** → add a user with *Read and write to any database*. Keep
  the password simple, or URL-encode it (`@` → `%40`, `#` → `%23`).
- **Network Access** → add `0.0.0.0/0`. Vercel functions do not have fixed
  outbound IPs, so an allowlist of specific addresses will not work.
- **Connect → Drivers** → copy the `mongodb+srv://…` string.

**Local MongoDB**, if you would rather not go through Atlas:

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
mongosh --quiet --eval 'db.runCommand({ping:1})'   # → { ok: 1 }
```

### 2. Environment

Copy `.env.example` to `.env.local` and fill it in:

```
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB="placement-os"
NEXT_PUBLIC_APP_TIMEZONE="Asia/Kolkata"
```

`MONGODB_DB` is set explicitly because Atlas strings usually omit the database
name, and the driver would otherwise fall back to `test`.

`NEXT_PUBLIC_APP_TIMEZONE` matters more than it looks — see
[Timezones](#timezones).

### 3. Run

```bash
npm install
npm run dev            # http://localhost:3000
```

### 4. Sample data (optional)

```bash
npm run seed           # ~10 weeks of realistic history
npm run seed 120       # a specific number of days
npm run db:reset       # wipe everything and start genuinely fresh
```

The seed is deterministic, so re-running it reproduces the same history.
**Run `npm run db:reset` before you start logging real days.**

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (includes the React Compiler rules) |
| `npm run seed` | Seed demo history |
| `npm run db:reset` | Delete all days and the profile |

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx                 # Shell, fonts, metadata, dark theme
│   ├── page.tsx                   # Dashboard (server-rendered)
│   ├── analytics/page.tsx
│   ├── calendar/page.tsx
│   ├── achievements/page.tsx
│   └── api/
│       ├── day/[date]/route.ts    # GET a day · PATCH one mutation
│       ├── overview/route.ts      # Full dashboard payload
│       ├── analytics/route.ts     # Trends, buckets, task stats
│       └── calendar/route.ts      # Contribution window
├── components/
│   ├── ui/                        # Card, Button, Badge, ProgressRing, Dialog…
│   ├── layout/                    # Sidebar, MobileNav, TopBar, PageHeader
│   ├── dashboard/                 # Today's board widgets + state provider
│   ├── analytics/                 # Charts and shared chart chrome
│   ├── calendar/                  # Contribution grid, month grid, day dialog
│   └── achievements/              # Badge wall, XP reference
├── lib/
│   ├── tasks.ts                   # ← the single source of truth
│   ├── core-subjects.ts           # Weekday rotation
│   ├── scoring.ts                 # Weighted score + performance tiers
│   ├── level.ts                   # XP curve, levels 1–100
│   ├── achievements.ts            # Badge definitions, derived from history
│   ├── streak.ts                  # Streak runs and records
│   ├── analytics.ts               # Trend/bucket aggregation
│   ├── overview.ts                # One-pass dashboard payload
│   ├── date.ts                    # Day-key ("YYYY-MM-DD") helpers
│   └── db/                        # Mongoose connection, models, day service
├── hooks/
└── types/
```

### Where to change things

Almost every tuning knob lives in **`src/lib/tasks.ts`**. Adding a task, or
retuning a weight or XP award, is a one-line change that ripples correctly
through the score, the XP curve, analytics and the reference table — nothing
else needs editing.

The weekday rotation lives in `src/lib/core-subjects.ts`, and badges in
`src/lib/achievements.ts`.

---

## How the numbers work

### Daily score (out of 100)

| Item | Weight | XP |
|---|---:|---:|
| DSA · 3 hours | 25 | 30 |
| Internship Work · 2 hours | 15 | 20 |
| English Speaking · 1 hour | 10 | 15 |
| SQL Practice · 2 questions | 10 | 12 |
| Workout · 45 minutes | 10 | 10 |
| Resume Preparation · 1 hour | 10 | 12 |
| Interview Questions · 30 minutes | 5 | 8 |
| Book Reading · 30 minutes | 5 | 8 |
| Core Subject (rotating) · 1 hour | 10 | 15 |
| **Perfect day** | **100** | **130** |

Weights are deliberately uneven. Completion percentage counts items; the score
weights them — so a day can be 78% complete by count and still score poorly if
DSA and the internship were the things skipped. That asymmetry is the point.

| Score | Label |
|---|---|
| 90–100 | Excellent |
| 75–89 | Good |
| 60–74 | Average |
| below 60 | Needs Improvement |

### Core subject rotation

| Day | Subject |
|---|---|
| Monday | Computer Networks |
| Tuesday | OOPS |
| Wednesday | Operating Systems |
| Thursday | DBMS |
| Friday | CN + OOPS Revision |
| Saturday | OS + DBMS Revision |
| Sunday | Weekly Review |

### Streaks

A day counts toward the streak at **score ≥ 70**. Today is treated as *pending*
rather than *broken* — an unfinished morning does not zero yesterday's streak,
it simply hasn't extended it yet.

### Levels

XP required to reach level *L* is `20(L-1)² + 40(L-1)`, so early levels arrive
quickly while level 100 stays a genuine long-haul goal. Badges are **derived**
from history on every read, never stored as truth; only the first unlock date is
persisted, so a badge keeps the day it was earned even after a streak breaks.

---

## Data model

One document per calendar day in `day_logs`, keyed by a local `"YYYY-MM-DD"`
string — timezone-stable and trivially indexable:

```js
{
  date: "2026-08-28",
  tasks: [{ taskId, completed, completedAt, value }],
  coreSubject: { key, label, topics, completed, completedAt, value },
  notes: { wentWell, needsImprovement, tomorrowFocus, updatedAt },
  score: 100, xpEarned: 130, completedCount: 9   // denormalised
}
```

A day you never touch is **never written**. Untouched days stay absent from
history rather than being recorded as zeroes, and the UI renders a blank slate
for them. `score`, `xpEarned` and `completedCount` are recomputed from task
state on every mutation, so the stored aggregates cannot drift from the source.

`profiles` holds the single-user record (`key: "solo"`) and the achievement
unlock dates. Moving to multi-user means indexing on an owner id — the rest of
the model is already per-user shaped.

---

## API

| Route | Method | Purpose |
|---|---|---|
| `/api/day/[date]` | `GET` | One day's full record |
| `/api/day/[date]` | `PATCH` | Apply one mutation, return the refreshed overview |
| `/api/overview` | `GET` | Dashboard payload (day, score, streaks, level, badges) |
| `/api/analytics` | `GET` | `?days=7…365` — trends, buckets, task stats |
| `/api/calendar` | `GET` | `?days=30…365` — contribution window |

`PATCH` accepts exactly one of `task`, `coreSubject` or `notes` and returns the
*entire* refreshed overview — so a single round-trip updates the checkbox, the
score ring, the streak, XP, level and the badge wall together.

```bash
curl -X PATCH http://localhost:3000/api/day/2026-08-28 \
  -H 'Content-Type: application/json' \
  -d '{"task":{"taskId":"dsa","completed":true}}'
```

---

## Theming

Light and dark are both first-class, with a three-way control (Light / Dark /
System) in the sidebar and a cycling button in the mobile header. The choice
persists in `localStorage`.

- **Light is not an inversion of dark.** Ink colours are re-picked for contrast
  against a light ground, and the chart and calendar marks are a separately
  validated palette — checked for lightness band, chroma floor, colourblind
  separation and surface contrast against *each* surface, not lightened from
  the dark set.
- **"System" removes the attribute** rather than stamping the resolved value,
  so the CSS media query stays in charge and the page follows the OS if that
  changes while the tab is open.
- **No flash.** A tiny inline script in `<head>` applies the stored choice
  before first paint; the React provider reads that state back through
  `useSyncExternalStore` rather than deciding it in an effect.
- Every colour is a role token defined once per theme in `globals.css`.
  Components reference roles only — there are no hardcoded `white/[0.05]`
  overlays left, so adding a third theme would touch one file.

---

## Design notes

- **Themed via role tokens**, with the explicit choice stamped on `<html>`.
- **Two colour systems, deliberately separate.** `--accent-*` and `--tier-*` are
  *ink* colours tuned for text contrast; `--viz-*` and `--mark-*` are *mark*
  colours for chart fills and calendar cells, validated as a categorical set
  against each canvas (lightness band, chroma floor, colourblind separation,
  contrast).
- **Glass is for in-flow surfaces only.** Overlays that land on top of dense
  content — modals, tooltips, the celebration toast — get an opaque ground.
- **The calendar encodes twice**: hue for the tier, fill intensity for the
  score, so a day is never distinguished by colour alone.
- **Every chart has a table view** and a legend whenever it carries two series.
- Motion respects `prefers-reduced-motion`.

---

## Deploying to Vercel

```bash
npx vercel login
npx vercel link                     # create or connect the project

# Environment variables, for every environment
npx vercel env add MONGODB_URI production
npx vercel env add MONGODB_DB production
npx vercel env add NEXT_PUBLIC_APP_TIMEZONE production

npx vercel deploy --prod
```

Or connect the GitHub repository in the Vercel dashboard and set the same three
variables under **Settings → Environment Variables**; every push to `main` then
deploys on its own.

Things worth knowing:

- **Atlas Network Access must allow `0.0.0.0/0`.** Vercel functions have no
  fixed outbound IP; a narrower allowlist will time out in production while
  working perfectly on your laptop.
- **`vercel.json` pins the region to `bom1` (Mumbai).** Put the Atlas cluster in
  the same region — a function in Washington talking to a cluster in Mumbai pays
  the round trip on every query.
- **The build does not need a database.** `MONGODB_URI` is checked when a
  connection is opened, not at module load, so a missing variable shows the
  app's database-error screen rather than failing the build.
- **Free-tier Atlas caps connections.** Each warm function instance keeps its
  own pool, so the pool is capped at 5 with idle sockets dropped after 30s.

To seed or reset the hosted database from your machine, point the script at it:

```bash
MONGODB_URI="mongodb+srv://…" npm run db:reset
```

---

## Timezones

Vercel functions run in **UTC**. If the app derived "today" from server-local
time, an IST user would see yesterday's board between midnight and 05:30, and
completion timestamps would render five and a half hours off.

So the calendar zone is pinned by `NEXT_PUBLIC_APP_TIMEZONE` (default
`Asia/Kolkata`) and only two functions ever consult the real clock —
`todayKey()` and `formatTime()`, both of which format in that zone. Everything
else is pure calendar arithmetic anchored to UTC midnight, which makes it
identical on any machine. Verified byte-for-byte with the process running in
`UTC`, `America/New_York`, `Asia/Kolkata` and `Pacific/Auckland`.

Change the variable if you are not on IST. Nothing else needs editing.

---

## Single-user mode

Ships with authentication off: one profile, no login. To add auth later, gate
the routes and swap the fixed `SINGLE_USER_KEY` in
`src/lib/db/models/Profile.ts` for the session's user id, then add that id to the
`day_logs` index alongside `date`.
