"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatTile } from "@/components/ui/stat-tile";
import { BadgeCard } from "./badge-card";
import { XpReference } from "./xp-reference";
import { MAX_LEVEL } from "@/lib/level";
import type { LevelState } from "@/lib/level";
import type { AchievementState, StreakState } from "@/types";
import { cn, formatNumber } from "@/lib/utils";

const FILTERS = ["all", "unlocked", "locked"] as const;
type Filter = (typeof FILTERS)[number];

export function AchievementsView({
  level,
  achievements,
  streaks,
  todayXp,
}: {
  level: LevelState;
  achievements: AchievementState[];
  streaks: StreakState;
  todayXp: number;
}) {
  const [filter, setFilter] = React.useState<Filter>("all");

  const unlocked = achievements.filter((a) => a.unlocked);
  const visible = achievements.filter((a) =>
    filter === "all" ? true : filter === "unlocked" ? a.unlocked : !a.unlocked,
  );

  return (
    <div className="space-y-4">
      {/* Level hero */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/14 via-transparent to-[var(--accent-cyan)]/8" />

        <CardContent className="relative flex flex-col items-center gap-7 p-6 sm:flex-row sm:p-7">
          <ProgressRing
            value={level.progressPercent}
            size={150}
            strokeWidth={11}
            gradient={["#8b5cf6", "#22d3ee"]}
            className="shrink-0"
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
                Level
              </span>
              <span className="numeric text-[42px] font-bold leading-none tracking-tight">
                {level.level}
              </span>
            </div>
          </ProgressRing>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
              {level.title}
            </p>
            <p className="numeric mt-1.5 text-[30px] font-semibold leading-none tracking-tight">
              {formatNumber(level.totalXp)}
              <span className="ml-2 text-base font-medium text-[var(--color-ink-muted)]">
                XP lifetime
              </span>
            </p>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              {level.isMax
                ? "Level 100. There is nothing left to unlock but the offer itself."
                : `${formatNumber(level.xpRemaining)} XP to level ${level.level + 1} of ${MAX_LEVEL}.`}
            </p>

            <div className="mt-4">
              <ProgressBar value={level.progressPercent} height={8} shimmer />
              <div className="numeric mt-1.5 flex justify-between text-[11px] text-[var(--color-ink-faint)]">
                <span>Level {level.level}</span>
                <span>
                  {level.xpIntoLevel} / {level.xpForNextLevel} XP
                </span>
                <span>Level {Math.min(level.level + 1, MAX_LEVEL)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Badges unlocked"
          value={`${unlocked.length} / ${achievements.length}`}
          icon="Medal"
          color="var(--viz-1)"
          caption={`${Math.round((unlocked.length / achievements.length) * 100)}% of the wall`}
        />
        <StatTile
          label="XP today"
          value={todayXp}
          icon="Zap"
          color="var(--viz-2)"
          caption="Earned from completed items"
        />
        <StatTile
          label="Current streak"
          value={streaks.current}
          suffix={streaks.current === 1 ? "day" : "days"}
          icon="Flame"
          color="var(--accent-orange)"
          caption={`Personal best: ${streaks.longest}`}
        />
        <StatTile
          label="Next milestone"
          value={
            achievements
              .filter((a) => !a.unlocked)
              .sort((a, b) => b.progressPercent - a.progressPercent)[0]?.name ??
            "All done"
          }
          icon="Target"
          color="var(--viz-3)"
          caption="Closest badge to unlocking"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Badge Wall</CardTitle>
            <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
              Every badge is recomputed from your history, so it always reflects
              what you actually did.
            </p>
          </div>
          <div
            role="group"
            aria-label="Filter badges"
            className="flex shrink-0 gap-1 rounded-xl border border-[var(--color-hairline)] p-0.5"
          >
            {FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors",
                  filter === option
                    ? "bg-white/[0.09] text-[var(--color-ink)]"
                    : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {visible.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[var(--color-ink-faint)]">
              Nothing here yet.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((achievement, index) => (
                <BadgeCard
                  key={achievement.id}
                  achievement={achievement}
                  index={index}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <XpReference />
    </div>
  );
}
