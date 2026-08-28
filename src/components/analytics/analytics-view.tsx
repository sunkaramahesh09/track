"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { Icon } from "@/components/ui/icon";
import { ScoreTrendChart } from "./score-trend-chart";
import { BucketChart } from "./bucket-chart";
import { TaskStatsChart } from "./task-stats-chart";
import { WeekdayChart } from "./weekday-chart";
import { TierDistribution } from "./tier-distribution";
import { StreakHistory } from "./streak-history";
import { CoreSubjectStats } from "./core-subject-stats";
import type { AnalyticsPayload, TrendPoint } from "@/lib/analytics";
import type { StreakState } from "@/types";
import { cn, formatNumber } from "@/lib/utils";

type Payload = AnalyticsPayload & { streaks: StreakState };

const RANGES = [
  { days: 14, label: "14d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
] as const;

/** Matches the server-rendered `dailyDays`, so this range needs no fetch. */
const DEFAULT_RANGE = 30;

export function AnalyticsView({ payload }: { payload: Payload }) {
  const [range, setRange] = React.useState<number>(DEFAULT_RANGE);

  /**
   * Only the daily series depends on the range; the weekly and monthly buckets
   * always cover 12 periods so the long view stays stable while filtering.
   *
   * The fetched series is stored keyed by its range, which lets `daily` and
   * `loading` both be derived — no effect ever has to sync them back.
   */
  const [fetched, setFetched] = React.useState<{
    days: number;
    data: TrendPoint[];
  } | null>(null);

  React.useEffect(() => {
    if (range === DEFAULT_RANGE) return;
    let cancelled = false;
    fetch(`/api/analytics?days=${range}`)
      .then((r) => r.json())
      .then((data: Payload) => {
        if (!cancelled) setFetched({ days: range, data: data.daily });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [range]);

  const isDefaultRange = range === DEFAULT_RANGE;
  const daily = isDefaultRange
    ? payload.daily
    : (fetched?.days === range ? fetched.data : payload.daily);
  const loading = !isDefaultRange && fetched?.days !== range;

  const { totals, streaks } = payload;

  return (
    <div className="space-y-4">
      {/* Headline numbers — one value each, so a tile beats a chart. */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Days logged"
          value={totals.daysLogged}
          icon="CalendarCheck"
          color="var(--viz-1)"
          caption={`${totals.tasksCompleted} individual items completed`}
        />
        <StatTile
          label="Average score"
          value={totals.averageScore}
          suffix="/ 100"
          icon="Gauge"
          color="var(--viz-2)"
          caption={`Best day: ${totals.bestScore}`}
        />
        <StatTile
          label="Consistency"
          value={totals.consistencyRate}
          suffix="%"
          icon="Repeat"
          color="var(--viz-3)"
          caption={`${totals.qualifyingDays} of ${totals.daysLogged} days scored 70+`}
        />
        <StatTile
          label="Total XP"
          value={formatNumber(totals.totalXp)}
          icon="Zap"
          color="var(--viz-4)"
          caption={`Longest streak: ${streaks.longest} days`}
        />
      </div>

      {/* Filters sit in one row above the charts. */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Completion Trend</CardTitle>
            <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
              Weighted score against raw task completion, on one shared 0–100 axis.
            </p>
          </div>
          <div
            role="group"
            aria-label="Time range"
            className="flex shrink-0 gap-1 rounded-xl border border-[var(--color-hairline)] p-0.5"
          >
            {RANGES.map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => setRange(option.days)}
                aria-pressed={range === option.days}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                  range === option.days
                    ? "bg-[var(--tint-4)] text-[var(--color-ink)]"
                    : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className={cn(loading && "opacity-50 transition-opacity")}>
          <ScoreTrendChart data={daily} showCompletion height={280} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Scores</CardTitle>
            <Icon name="CalendarRange" className="size-4 text-[var(--color-ink-faint)]" />
          </CardHeader>
          <CardContent>
            <BucketChart data={payload.weekly} unitLabel="week" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Scores</CardTitle>
            <Icon name="CalendarDays" className="size-4 text-[var(--color-ink-faint)]" />
          </CardHeader>
          <CardContent>
            <BucketChart data={payload.monthly} unitLabel="month" />
          </CardContent>
        </Card>
      </div>

      {/* items-start so the task card keeps its natural height instead of
          stretching to match the taller stack beside it. */}
      <div className="grid items-start gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>Task Completion Rate</CardTitle>
              <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
                Share of logged days each task was finished.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <TaskStatsChart stats={payload.taskStats} />
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Performance Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <TierDistribution rows={payload.tierDistribution} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Strongest Weekdays</CardTitle>
                <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
                  Your best day is highlighted.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <WeekdayChart data={payload.weekdayStats} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Core Subject Coverage</CardTitle>
              <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
                Completion rate for each slot in the weekly rotation.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <CoreSubjectStats stats={payload.coreSubjectStats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Streak History</CardTitle>
              <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
                Every run of days scoring 70 or more.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <StreakHistory streaks={streaks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
