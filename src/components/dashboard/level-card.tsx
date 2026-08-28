"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "./dashboard-provider";
import { MAX_LEVEL } from "@/lib/level";
import { formatNumber } from "@/lib/utils";

export function LevelCard() {
  const { overview } = useDashboard();
  const { level, day, lifetime } = overview;

  return (
    <Card className="relative">
      <div className="pointer-events-none absolute -left-10 -top-12 size-40 rounded-full bg-[var(--color-accent)] opacity-15 blur-3xl" />

      <CardHeader>
        <CardTitle>Level &amp; XP</CardTitle>
        <Badge variant="accent">
          <Icon name="Zap" />+{day.xpEarned} today
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative grid size-16 shrink-0 place-items-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8b6cff] to-[#4f37c9] opacity-90 shadow-[0_12px_32px_-14px_rgba(124,92,255,1)]" />
            <span className="numeric relative text-2xl font-bold text-white">
              {level.level}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-semibold tracking-tight">
              {level.title}
            </p>
            <p className="numeric mt-0.5 text-[13px] text-[var(--color-ink-muted)]">
              {formatNumber(level.totalXp)} XP lifetime
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between text-xs">
            <span className="font-medium text-[var(--color-ink-muted)]">
              {level.isMax
                ? "Maximum level reached"
                : `Level ${level.level + 1} in ${formatNumber(level.xpRemaining)} XP`}
            </span>
            <span className="numeric text-[var(--color-ink-faint)]">
              {level.xpIntoLevel} / {level.xpForNextLevel}
            </span>
          </div>
          <ProgressBar value={level.progressPercent} height={8} shimmer />
          <p className="mt-2 text-[11px] text-[var(--color-ink-faint)]">
            Level {level.level} of {MAX_LEVEL} · {lifetime.unlockedBadges} of{" "}
            {lifetime.totalBadges} badges unlocked
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
