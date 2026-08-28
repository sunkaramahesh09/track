import { clamp } from "./utils";

export const MAX_LEVEL = 100;

/**
 * XP required to *reach* a level. Growth is quadratic-ish so early levels
 * arrive fast (momentum) while level 100 remains a genuine long-haul goal
 * at roughly a year of disciplined days.
 */
export function xpForLevel(level: number): number {
  const l = clamp(Math.floor(level), 1, MAX_LEVEL);
  if (l <= 1) return 0;
  // 60 XP for L2, scaling to ~150k total at L100.
  return Math.round(20 * (l - 1) ** 2 + 40 * (l - 1));
}

export const XP_FOR_MAX_LEVEL = xpForLevel(MAX_LEVEL);

export interface LevelState {
  level: number;
  totalXp: number;
  /** XP accumulated inside the current level. */
  xpIntoLevel: number;
  /** XP span of the current level. */
  xpForNextLevel: number;
  xpRemaining: number;
  progressPercent: number;
  isMax: boolean;
  title: string;
}

const TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 90, title: "Placement Legend" },
  { minLevel: 75, title: "Offer Magnet" },
  { minLevel: 60, title: "Interview Ready" },
  { minLevel: 45, title: "Serious Contender" },
  { minLevel: 30, title: "Grinder" },
  { minLevel: 18, title: "Consistent" },
  { minLevel: 8, title: "Building Momentum" },
  { minLevel: 1, title: "Getting Started" },
];

export function titleForLevel(level: number) {
  return TITLES.find((t) => level >= t.minLevel)?.title ?? "Getting Started";
}

export function levelFromXp(totalXp: number): LevelState {
  const xp = Math.max(0, Math.round(totalXp));

  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;

  const floor = xpForLevel(level);
  const ceiling = level >= MAX_LEVEL ? floor : xpForLevel(level + 1);
  const span = Math.max(1, ceiling - floor);
  const into = xp - floor;

  return {
    level,
    totalXp: xp,
    xpIntoLevel: into,
    xpForNextLevel: span,
    xpRemaining: level >= MAX_LEVEL ? 0 : ceiling - xp,
    progressPercent: level >= MAX_LEVEL ? 100 : Math.round((into / span) * 100),
    isMax: level >= MAX_LEVEL,
    title: titleForLevel(level),
  };
}
