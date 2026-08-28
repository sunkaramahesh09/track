"use client";

import * as React from "react";
import { Icon, accentVar } from "@/components/ui/icon";
import { ChartEmpty } from "./chart-chrome";
import type { TaskStat } from "@/lib/analytics";
import { SERIES } from "./chart-chrome";

/**
 * Completion rate per task. Built from plain HTML bars rather than a chart
 * library: each row carries an icon, a name and its own value, so the bar is
 * a magnitude cue beside a label rather than a mark that needs a legend.
 */
export function TaskStatsChart({ stats }: { stats: TaskStat[] }) {
  if (stats.length === 0 || stats.every((s) => s.opportunities === 0)) {
    return (
      <ChartEmpty message="Task statistics appear once you have logged at least one day." />
    );
  }

  return (
    <ul className="space-y-2.5">
      {stats.map((stat) => (
        <li key={stat.id} className="group">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <Icon
                name={stat.icon}
                className="size-3.5 shrink-0"
                style={{ color: accentVar(stat.accent) }}
              />
              <span className="truncate text-[13px] font-medium text-[var(--color-ink)]">
                {stat.name}
              </span>
              {stat.currentRun > 1 && (
                <span className="numeric shrink-0 rounded-md bg-[var(--tint-3)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent-orange)]">
                  {stat.currentRun}d run
                </span>
              )}
            </span>
            <span className="numeric shrink-0 text-[12px] font-semibold tabular-nums text-[var(--color-ink-muted)]">
              {stat.rate}%
              <span className="ml-1.5 font-normal text-[var(--color-ink-faint)]">
                {stat.completions}/{stat.opportunities}
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--tint-2)]">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${stat.rate}%`,
                background: SERIES[0],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
