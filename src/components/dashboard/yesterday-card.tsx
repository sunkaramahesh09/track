"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useDashboard } from "./dashboard-provider";
import { performanceFor } from "@/lib/scoring";
import { formatDayShort } from "@/lib/date";

/**
 * Yesterday, deliberately read-only.
 *
 * Unfinished work from yesterday never appears on today's board — it lives
 * here as a record, which is the whole point of the no-rollover rule.
 */
export function YesterdayCard() {
  const { overview } = useDashboard();
  const { yesterday } = overview;

  if (!yesterday) return null;

  const performance = performanceFor(yesterday.score);
  const missed = yesterday.totalCount - yesterday.completedCount;

  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center gap-4 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.04]">
          <Icon name="History" className="size-4.5 text-[var(--color-ink-faint)]" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">
            {formatDayShort(yesterday.date)} · historical record
          </p>
          <p className="mt-0.5 text-[13px] text-[var(--color-ink-muted)]">
            Scored{" "}
            <span
              className="numeric font-semibold"
              style={{ color: performance.color }}
            >
              {yesterday.score}
            </span>{" "}
            · {yesterday.completedCount}/{yesterday.totalCount} done
            {missed > 0 && (
              <>
                {" · "}
                <span className="text-[var(--color-ink-faint)]">
                  {missed} missed, not carried over
                </span>
              </>
            )}
          </p>
        </div>

        <Link
          href="/calendar"
          className="shrink-0 rounded-lg border border-[var(--color-hairline)] px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)]"
        >
          History
        </Link>
      </CardContent>
    </Card>
  );
}
