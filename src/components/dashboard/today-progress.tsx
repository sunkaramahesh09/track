"use client";

import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useDashboard } from "./dashboard-provider";
import { formatDayLong, weekdayName } from "@/lib/date";

export function TodayProgress() {
  const { overview } = useDashboard();
  const { score, date, streaks } = overview;

  return (
    <Card className="relative p-6 sm:p-7">
      {/* Soft accent wash behind the ring */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full opacity-60 blur-3xl"
        style={{ background: score.performance.color, opacity: 0.12 }}
      />

      <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-8">
        <ProgressRing
          value={score.completionPercent}
          size={172}
          strokeWidth={13}
          gradient={["#8b5cf6", "#22d3ee"]}
          className="shrink-0"
        >
          <div className="flex flex-col items-center">
            <span className="numeric text-[34px] font-semibold leading-none tracking-tight">
              {score.completionPercent}
              <span className="text-lg text-[var(--color-ink-faint)]">%</span>
            </span>
            <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">
              Complete
            </span>
          </div>
        </ProgressRing>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
            {weekdayName(date)} · Today&apos;s Progress
          </p>

          <p className="numeric mt-2 text-[30px] font-semibold leading-none tracking-tight sm:text-[36px]">
            {score.completedCount}
            <span className="text-[var(--color-ink-faint)]">
              {" "}
              / {score.totalCount}
            </span>
            <span className="ml-2 text-base font-medium text-[var(--color-ink-muted)]">
              tasks done
            </span>
          </p>

          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {score.remainingCount === 0
              ? "Everything on the board is complete. Outstanding."
              : `${score.remainingCount} ${score.remainingCount === 1 ? "item" : "items"} still open — ${formatDayLong(date)}.`}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge
              variant={
                score.performance.tier === "excellent"
                  ? "success"
                  : score.performance.tier === "good"
                    ? "info"
                    : score.performance.tier === "average"
                      ? "warning"
                      : "danger"
              }
            >
              <Icon name="Gauge" />
              {score.performance.label}
            </Badge>
            <Badge variant={streaks.todayQualifies ? "success" : "neutral"}>
              <Icon name={streaks.todayQualifies ? "CheckCircle2" : "Target"} />
              {streaks.todayQualifies
                ? "Streak secured today"
                : `${Math.max(0, 70 - score.score)} pts to secure the streak`}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
