# Track — working notes

Personal placement-preparation tracker. Next.js 16 (App Router) + TypeScript +
Tailwind v4 + MongoDB Atlas/Mongoose + Recharts. Single-user, no auth.
Deployed on Vercel (Node runtime, region `bom1`).

## Commands

```bash
npm run dev          # localhost:3000 (needs MongoDB running)
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint incl. React Compiler rules
npm run seed         # deterministic demo history
npm run db:reset     # wipe all data
npx vercel deploy --prod

# Point any script at the hosted database:
MONGODB_URI="mongodb+srv://…" npm run db:reset
```

Always run `npm run typecheck` **and** `npm run lint` before calling a change
done — the React Compiler rules (`react-hooks/set-state-in-effect`) fail the
build and are not covered by tsc.

## Invariants — do not break these

- **No rollover.** An unfinished task never appears on a later day. Days are
  independent documents; nothing carries forward. Yesterday is read-only.
- **A day you never touch is never written.** `getDay` returns an unsaved blank
  slate; only a mutation upserts. Analytics treats absent days as zero.
- **`src/lib/tasks.ts` is the single source of truth.** Weights, XP, targets,
  ordering and presentation all derive from it. Never hardcode a weight or an
  XP value anywhere else.
- **Denormalised fields are recomputed, never patched.** `score`, `xpEarned` and
  `completedCount` are always rederived by `computeDayScore` on write.
- **Badges are derived from history on every read.** Only the first unlock date
  is persisted. Never store "unlocked" as truth.
- **Streak threshold is 70**, and today is *pending*, not *broken* — an
  unfinished today must not zero the streak.

## Conventions

- Dates are day-keys, `"YYYY-MM-DD"` (`src/lib/date.ts`). Never pass raw `Date`
  objects across the API boundary.
- **Timezone discipline (`src/lib/date.ts`).** Vercel runs in UTC. Only
  `todayKey()` and `formatTime()` may read the real clock, and both format in
  `APP_TIMEZONE`. Everything else is calendar arithmetic anchored to UTC
  midnight — so **never call `.getDate()`, `.getMonth()`, `.getDay()` or
  `.getFullYear()` on a `fromDayKey()` result**; use `dayOfMonth`,
  `monthIndexOf`, `weekdayOf`, `endOfMonth`. Local getters are off by one in any
  zone behind UTC.
- **No `toLocaleTimeString` / `toLocaleString()` in rendered output** — Intl
  resolves differently on server and client and breaks hydration. Use
  `formatTime` (`lib/date.ts`) and `formatNumber` (`lib/utils.ts`).
- Mongoose cannot run on the edge: every page and route that touches the DB
  pins `export const runtime = "nodejs"`.
- `MONGODB_URI` is validated inside `connectToDatabase()`, never at module load
  — a top-level throw would fail `next build` on Vercel.
- Server components read through `src/lib/db/day-service.ts` directly; client
  mutations go through `/api/day/[date]` and replace the whole overview payload.
- Colour: `--accent-*` / `--tier-*` are ink (text) colours; `--viz-*` /
  `--mark-*` are mark (fill) colours, validated as a categorical set. Do not use
  ink colours for chart fills or calendar cells.
- Overlays (dialog, tooltip, toast) use an opaque ground (`--elevated-bg`),
  not `.glass`.
- **Never hardcode a colour in a component.** No `bg-white/[0.05]`,
  `text-black/85` or raw `rgba(255,255,255,…)` — they break light mode. Use the
  role tokens: `--tint-1..4` for surface tints, `--on-accent` for text on a
  filled accent, `--elevated-bg` for overlays, `--scrim` for modal backdrops.
- Themes live in `globals.css` as three token blocks: `:root` (light),
  `:root[data-theme="dark"]`, and the `prefers-color-scheme` media query
  guarded by `:not([data-theme="light"])`. The dark values are duplicated
  across the last two on purpose — CSS cannot share a block with a media query.
- Theme state is read with `useSyncExternalStore` from localStorage + the media
  query, never mirrored into state by an effect. The inline `THEME_BOOT_SCRIPT`
  in `<head>` must keep running before first paint or light mode flashes.
- **The timer keeps no records.** `src/components/timer/` is client-only and
  never touches the database — it is a module-level external store read with
  `useSyncExternalStore`, persisted to localStorage, and its elapsed time is
  derived from timestamps rather than counted frames, so a backgrounded tab or
  a refresh costs nothing. Countdown presets come from `tasks.ts`.
- Prefer deriving state over syncing it in an effect; where state must follow a
  prop, adjust during render (see `quick-notes.tsx`) rather than in `useEffect`.

## Layout

`src/lib/` is the domain layer and imports no React. `src/components/ui/`
resolves domain icon names to Lucide components via `<Icon name=… />`, which is
what keeps that separation clean.
