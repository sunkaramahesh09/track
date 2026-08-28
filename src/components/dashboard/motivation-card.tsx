"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useDashboard } from "./dashboard-provider";

export function MotivationCard() {
  const { overview } = useDashboard();
  const { motivation, streaks, score } = overview;

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/12 via-transparent to-[var(--accent-cyan)]/10" />

      <CardContent className="relative p-6">
        <Icon
          name="Quote"
          className="mb-3 size-6 text-[var(--color-accent-soft)] opacity-70"
        />

        <blockquote className="text-[19px] font-medium leading-snug tracking-tight text-[var(--color-ink)] sm:text-[21px]">
          &ldquo;{motivation.quote}&rdquo;
        </blockquote>
        <cite className="mt-2 block text-[13px] not-italic text-[var(--color-ink-faint)]">
          — {motivation.author}
        </cite>

        <div className="mt-5 grid gap-3 border-t border-[var(--color-hairline)] pt-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">
              Today&apos;s Focus
            </p>
            <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-muted)]">
              {motivation.focus}
            </p>
          </div>

          <div className="flex gap-5 sm:justify-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">
                Streak
              </p>
              <p className="numeric mt-1 flex items-center gap-1.5 text-xl font-semibold">
                <Icon
                  name="Flame"
                  className="size-4 text-[var(--accent-orange)]"
                />
                {streaks.current}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">
                Score
              </p>
              <p
                className="numeric mt-1 text-xl font-semibold"
                style={{ color: score.performance.color }}
              >
                {score.score}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
