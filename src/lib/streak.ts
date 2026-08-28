import { addDays, todayKey, type DayKey } from "./date";
import { STREAK_THRESHOLD } from "./scoring";
import type { DaySummary, StreakState } from "@/types";

/**
 * A day counts toward the streak when its score reaches STREAK_THRESHOLD.
 *
 * Today is treated as "pending" rather than "broken": an incomplete today
 * does not zero the streak, it simply doesn't extend it yet. Without that,
 * every morning would read as a failure.
 */
export function computeStreaks(
  summaries: DaySummary[],
  today: DayKey = todayKey(),
): StreakState {
  const qualifying = new Set(
    summaries.filter((s) => s.score >= STREAK_THRESHOLD).map((s) => s.date),
  );

  const runs: { start: DayKey; end: DayKey; length: number }[] = [];
  const sorted = [...qualifying].sort();

  for (const day of sorted) {
    const last = runs[runs.length - 1];
    if (last && addDays(last.end, 1) === day) {
      last.end = day;
      last.length += 1;
    } else {
      runs.push({ start: day, end: day, length: 1 });
    }
  }

  const longest = runs.reduce((max, run) => Math.max(max, run.length), 0);

  // Walk back from today (or yesterday, if today is still pending).
  const todayQualifies = qualifying.has(today);
  let cursor = todayQualifies ? today : addDays(today, -1);
  let current = 0;
  const activeRun: DayKey[] = [];

  while (qualifying.has(cursor)) {
    activeRun.unshift(cursor);
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return {
    current,
    longest: Math.max(longest, current),
    activeRun,
    todayQualifies,
    history: runs.reverse(),
  };
}
