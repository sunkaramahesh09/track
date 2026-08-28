"use client";

import { Icon } from "@/components/ui/icon";
import { ChartEmpty, SERIES } from "./chart-chrome";
import { formatDayShort } from "@/lib/date";
import type { StreakState } from "@/types";

/**
 * Streak runs as horizontal bars, longest-normalised. One series, one colour;
 * every run carries its dates and length as text beside the bar.
 */
export function StreakHistory({ streaks }: { streaks: StreakState }) {
  if (streaks.history.length === 0) {
    return (
      <ChartEmpty message="No streaks yet. A day counts once its score reaches 70." />
    );
  }

  const longest = Math.max(...streaks.history.map((r) => r.length));
  const activeEnd = streaks.activeRun.at(-1);

  return (
    <ul className="max-h-[300px] space-y-2.5 overflow-y-auto pr-1">
      {streaks.history.slice(0, 12).map((run) => {
        const isActive = run.end === activeEnd && streaks.current > 0;
        return (
          <li key={`${run.start}-${run.end}`}>
            <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
              <span className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                {isActive && (
                  <Icon
                    name="Flame"
                    className="size-3.5 text-[var(--accent-orange)]"
                  />
                )}
                {run.start === run.end
                  ? formatDayShort(run.start)
                  : `${formatDayShort(run.start)} – ${formatDayShort(run.end)}`}
                {isActive && (
                  <span className="rounded-md bg-[var(--accent-orange)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent-orange)]">
                    active
                  </span>
                )}
              </span>
              <span className="numeric shrink-0 font-semibold text-[var(--color-ink)]">
                {run.length}d
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--tint-2)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(run.length / longest) * 100}%`,
                  background: isActive ? "var(--accent-orange)" : SERIES[0],
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
