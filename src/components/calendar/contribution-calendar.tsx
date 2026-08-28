"use client";

import * as React from "react";
import {
  addDays,
  formatDayLong,
  monthIndexOf,
  rangeOfDays,
  startOfWeek,
  weekdayOf,
  type DayKey,
} from "@/lib/date";
import { TIER_MARKS } from "@/components/analytics/chart-chrome";
import { performanceFor } from "@/lib/scoring";
import type { DaySummary } from "@/types";
import { cn } from "@/lib/utils";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

interface Props {
  from: DayKey;
  to: DayKey;
  today: DayKey;
  summaries: DaySummary[];
  onSelect: (date: DayKey) => void;
  selected?: DayKey | null;
}

/**
 * GitHub-style contribution grid: one column per week, Monday at the top.
 *
 * Tier sets the hue; score sets the fill opacity within that tier. The second
 * channel means a day is never distinguished by colour alone, and gives the
 * grid the familiar "darker = better" reading at a glance.
 */
export function ContributionCalendar({
  from,
  to,
  today,
  summaries,
  onSelect,
  selected,
}: Props) {
  const byDate = React.useMemo(
    () => new Map(summaries.map((s) => [s.date, s] as const)),
    [summaries],
  );

  // Pad to whole weeks so every column has seven cells.
  const gridStart = startOfWeek(from);
  const gridEnd = (() => {
    const dow = weekdayOf(to);
    return addDays(to, dow === 0 ? 0 : 7 - dow);
  })();

  const days = React.useMemo(
    () => rangeOfDays(gridStart, gridEnd),
    [gridStart, gridEnd],
  );

  const weeks: DayKey[][] = React.useMemo(() => {
    const out: DayKey[][] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [days]);

  /**
   * Month labels, thinned so they cannot collide.
   *
   * A month boundary can fall on consecutive columns (a 1-day tail followed by
   * a fresh month), which would print "AugSep" as one smudge. Keeping a
   * minimum column gap drops the crowded label instead.
   */
  const monthLabels = React.useMemo(() => {
    const MIN_COLUMN_GAP = 3;
    const labels: (string | null)[] = [];
    let lastLabelled = -Infinity;

    weeks.forEach((week, i) => {
      const month = monthIndexOf(week[0]);
      const previousMonth = i === 0 ? -1 : monthIndexOf(weeks[i - 1][0]);

      if (month !== previousMonth && i - lastLabelled >= MIN_COLUMN_GAP) {
        labels.push(MONTH_LABELS[month]);
        lastLabelled = i;
      } else {
        labels.push(null);
      }
    });

    return labels;
  }, [weeks]);

  /**
   * Open scrolled to the right-hand edge — the most recent weeks are the ones
   * worth seeing first, and on a narrow screen the default left edge is a year
   * of empty squares.
   */
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const node = scrollerRef.current;
    if (node) node.scrollLeft = node.scrollWidth;
  }, [weeks.length]);

  return (
    <div>
      <div ref={scrollerRef} className="w-full overflow-x-auto pb-2">
      <div className="inline-block min-w-full">
        {/* Month ruler */}
        <div className="mb-1.5 flex pl-[34px]">
          {weeks.map((week, i) => (
            <div key={week[0]} className="w-[17px] shrink-0">
              {monthLabels[i] && (
                <span className="text-[10px] font-medium text-[var(--color-ink-faint)]">
                  {monthLabels[i]}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Weekday ruler */}
          <div className="mr-2 flex w-[26px] shrink-0 flex-col gap-[3px]">
            {WEEKDAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="flex h-3.5 items-center text-[9.5px] leading-none text-[var(--color-ink-faint)]"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week) => (
              <div key={week[0]} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <CalendarCell
                    key={day}
                    day={day}
                    today={today}
                    inRange={day >= from && day <= to}
                    summary={byDate.get(day)}
                    selected={selected === day}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

      <CalendarLegend />
    </div>
  );
}

function CalendarCell({
  day,
  today,
  inRange,
  summary,
  selected,
  onSelect,
}: {
  day: DayKey;
  today: DayKey;
  inRange: boolean;
  summary?: DaySummary;
  selected: boolean;
  onSelect: (date: DayKey) => void;
}) {
  const isFuture = day > today;
  const hasData = Boolean(summary && summary.score > 0);
  const tier = summary ? performanceFor(summary.score).tier : null;

  // Opacity is the secondary channel: 0.45 at the tier floor → 1.0 at 100.
  const intensity = summary ? 0.45 + (summary.score / 100) * 0.55 : 0;

  const label = isFuture
    ? `${formatDayLong(day)} — upcoming`
    : hasData
      ? `${formatDayLong(day)} — ${summary!.score}/100, ${performanceFor(summary!.score).label}, ${summary!.completedCount}/${summary!.totalCount} tasks`
      : `${formatDayLong(day)} — nothing logged`;

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={!inRange || isFuture}
      onClick={() => onSelect(day)}
      className={cn(
        "size-3.5 shrink-0 rounded-[3px] transition-all duration-150",
        !inRange && "invisible",
        isFuture && "opacity-25",
        !isFuture && "hover:scale-125 hover:ring-1 hover:ring-white/40",
        selected && "ring-2 ring-[var(--color-accent-soft)] ring-offset-1 ring-offset-[var(--color-canvas)]",
        day === today && !selected && "ring-1 ring-white/55",
      )}
      style={{
        background: hasData
          ? `color-mix(in oklab, ${TIER_MARKS[tier!]} ${Math.round(intensity * 100)}%, transparent)`
          : "var(--tier-empty)",
      }}
    />
  );
}

function CalendarLegend() {
  const tiers = [
    { key: "poor", label: "Needs work", range: "< 60" },
    { key: "average", label: "Average", range: "60–74" },
    { key: "good", label: "Good", range: "75–89" },
    { key: "excellent", label: "Excellent", range: "90+" },
  ];

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-faint)]">
        <span
          className="size-3.5 rounded-[3px]"
          style={{ background: "var(--tier-empty)" }}
        />
        No activity
      </span>
      {tiers.map((tier) => (
        <span
          key={tier.key}
          className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-muted)]"
        >
          <span
            className="size-3.5 rounded-[3px]"
            style={{ background: TIER_MARKS[tier.key] }}
          />
          {tier.label}
          <span className="numeric text-[var(--color-ink-faint)]">{tier.range}</span>
        </span>
      ))}
    </div>
  );
}
