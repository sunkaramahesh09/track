"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { ContributionCalendar } from "./contribution-calendar";
import { DayDetailDialog } from "./day-detail-dialog";
import { MonthGrid } from "./month-grid";
import { formatMonth, startOfMonth, type DayKey } from "@/lib/date";
import type { DaySummary, StreakState } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  from: DayKey;
  to: DayKey;
  today: DayKey;
  summaries: DaySummary[];
  streaks: StreakState;
}

export function CalendarView({ from, to, today, summaries, streaks }: Props) {
  const [selected, setSelected] = React.useState<DayKey | null>(null);
  const [view, setView] = React.useState<"year" | "month">("year");
  const [month, setMonth] = React.useState<DayKey>(startOfMonth(today));

  const logged = summaries.filter((s) => s.hasLog);
  const excellent = summaries.filter((s) => s.tier === "excellent" && s.score > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Active days"
          value={logged.length}
          icon="CalendarCheck"
          color="var(--viz-1)"
          caption="Days with at least one item completed"
        />
        <StatTile
          label="Current streak"
          value={streaks.current}
          suffix={streaks.current === 1 ? "day" : "days"}
          icon="Flame"
          color="var(--accent-orange)"
          caption={
            streaks.todayQualifies ? "Today is locked in" : "Finish today to extend it"
          }
        />
        <StatTile
          label="Longest streak"
          value={streaks.longest}
          suffix={streaks.longest === 1 ? "day" : "days"}
          icon="Trophy"
          color="var(--accent-amber)"
          caption={`${streaks.history.length} separate runs so far`}
        />
        <StatTile
          label="Excellent days"
          value={excellent.length}
          icon="Sparkles"
          color="var(--mark-excellent)"
          caption="Days scoring 90 or above"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              {view === "year" ? "Last 12 months" : formatMonth(month)}
            </CardTitle>
            <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
              {view === "year"
                ? "One square per day, Monday at the top."
                : "Click a day for the full task record."}
            </p>
          </div>

          <div
            role="group"
            aria-label="Calendar view"
            className="flex shrink-0 gap-1 rounded-xl border border-[var(--color-hairline)] p-0.5"
          >
            {(["year", "month"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                aria-pressed={view === option}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors",
                  view === option
                    ? "bg-[var(--tint-4)] text-[var(--color-ink)]"
                    : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {view === "year" ? (
            <ContributionCalendar
              from={from}
              to={to}
              today={today}
              summaries={summaries}
              selected={selected}
              onSelect={setSelected}
            />
          ) : (
            <MonthGrid
              month={month}
              today={today}
              summaries={summaries}
              selected={selected}
              onSelect={setSelected}
              onMonthChange={setMonth}
            />
          )}
        </CardContent>
      </Card>

      <DayDetailDialog
        date={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
