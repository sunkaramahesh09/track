"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { TIER_MARKS } from "@/components/analytics/chart-chrome";
import { performanceFor } from "@/lib/scoring";
import {
  addDays,
  dayOfMonth,
  endOfMonth,
  formatDayLong,
  formatMonth,
  rangeOfDays,
  startOfMonth,
  weekdayOf,
  type DayKey,
} from "@/lib/date";
import type { DaySummary } from "@/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A conventional month grid, for reading a single month closely. */
export function MonthGrid({
  month,
  today,
  summaries,
  selected,
  onSelect,
  onMonthChange,
}: {
  month: DayKey;
  today: DayKey;
  summaries: DaySummary[];
  selected: DayKey | null;
  onSelect: (date: DayKey) => void;
  onMonthChange: (month: DayKey) => void;
}) {
  const byDate = React.useMemo(
    () => new Map(summaries.map((s) => [s.date, s] as const)),
    [summaries],
  );

  const lastDay = endOfMonth(month);
  const days = rangeOfDays(month, lastDay);

  // Monday-first leading blanks.
  const leadDow = weekdayOf(month);
  const lead = leadDow === 0 ? 6 : leadDow - 1;

  const prevMonth = startOfMonth(addDays(month, -1));
  const nextMonth = startOfMonth(addDays(lastDay, 1));
  const canGoNext = nextMonth <= startOfMonth(today);

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(prevMonth)}
          className="rounded-lg border border-[var(--color-hairline)] p-1.5 text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)]"
          aria-label={`Go to ${formatMonth(prevMonth)}`}
        >
          <Icon name="ChevronLeft" className="size-4" />
        </button>

        <p className="text-sm font-semibold tracking-tight">{formatMonth(month)}</p>

        <button
          type="button"
          onClick={() => onMonthChange(nextMonth)}
          disabled={!canGoNext}
          className="rounded-lg border border-[var(--color-hairline)] p-1.5 text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)] disabled:pointer-events-none disabled:opacity-35"
          aria-label={`Go to ${formatMonth(nextMonth)}`}
        >
          <Icon name="ChevronRight" className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-faint)]"
          >
            {label}
          </div>
        ))}

        {Array.from({ length: lead }, (_, i) => (
          <div key={`lead-${i}`} />
        ))}

        {days.map((day) => {
          const summary = byDate.get(day);
          const hasData = Boolean(summary && summary.score > 0);
          const tier = summary ? performanceFor(summary.score).tier : null;
          const intensity = summary ? 0.45 + (summary.score / 100) * 0.55 : 0;
          const isFuture = day > today;
          const dayNumber = dayOfMonth(day);

          return (
            <button
              key={day}
              type="button"
              disabled={isFuture}
              onClick={() => onSelect(day)}
              aria-label={
                hasData
                  ? `${formatDayLong(day)} — ${summary!.score} out of 100`
                  : `${formatDayLong(day)} — nothing logged`
              }
              className={cn(
                "group relative aspect-square rounded-xl border p-1.5 text-left transition-all duration-200",
                isFuture
                  ? "border-transparent opacity-25"
                  : "border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)] hover:scale-[1.04]",
                selected === day &&
                  "ring-2 ring-[var(--color-accent-soft)] ring-offset-1 ring-offset-[var(--color-canvas)]",
                day === today && "border-white/45",
              )}
              style={{
                background: hasData
                  ? `color-mix(in oklab, ${TIER_MARKS[tier!]} ${Math.round(intensity * 55)}%, transparent)`
                  : undefined,
              }}
            >
              <span
                className={cn(
                  "numeric text-[11px] font-semibold",
                  hasData ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]",
                )}
              >
                {dayNumber}
              </span>

              {hasData && (
                <span className="absolute inset-x-1.5 bottom-1.5">
                  <span
                    className="numeric block text-[13px] font-semibold leading-none"
                    style={{ color: TIER_MARKS[tier!] }}
                  >
                    {summary!.score}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
