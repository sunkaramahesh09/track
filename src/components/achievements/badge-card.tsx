"use client";

import { Icon, accentVar } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatDayShort } from "@/lib/date";
import type { AchievementState } from "@/types";
import { cn } from "@/lib/utils";

const TIER_RING: Record<AchievementState["tier"], string> = {
  bronze: "#c98500",
  silver: "#9aa4b8",
  gold: "#e0a92e",
  platinum: "#7f5af0",
};

export function BadgeCard({
  achievement,
  index = 0,
}: {
  achievement: AchievementState;
  index?: number;
}) {
  const color = accentVar(achievement.accent);
  const locked = !achievement.unlocked;

  return (
    <li
      className={cn(
        "glass glass-hover animate-rise group relative overflow-hidden rounded-[var(--radius-card)] p-4",
        locked && "opacity-70",
      )}
      style={{
        animationDelay: `${Math.min(index * 40, 400)}ms`,
        borderColor: locked
          ? undefined
          : `color-mix(in oklab, ${color} 28%, transparent)`,
      }}
    >
      {!locked && (
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-45"
          style={{ background: color, opacity: 0.22 }}
        />
      )}

      <div className="relative flex items-start gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-xl border"
          style={{
            borderColor: locked
              ? "var(--color-hairline)"
              : `color-mix(in oklab, ${color} 40%, transparent)`,
            background: locked
              ? "var(--tint-1)"
              : `color-mix(in oklab, ${color} 16%, transparent)`,
            boxShadow: locked ? undefined : `0 0 20px -8px ${color}`,
          }}
        >
          <Icon
            name={locked ? "Lock" : achievement.icon}
            className="size-5"
            style={{ color: locked ? "var(--color-ink-faint)" : color }}
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "text-[14px] font-semibold tracking-tight",
                locked && "text-[var(--color-ink-muted)]",
              )}
            >
              {achievement.name}
            </h4>
            <span
              className="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
              style={{
                color: TIER_RING[achievement.tier],
                background: `color-mix(in oklab, ${TIER_RING[achievement.tier]} 15%, transparent)`,
              }}
            >
              {achievement.tier}
            </span>
          </div>

          <p className="mt-0.5 text-[12px] leading-snug text-[var(--color-ink-faint)]">
            {achievement.description}
          </p>
        </div>
      </div>

      <div className="relative mt-3.5">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span
            className={cn(
              "font-medium",
              locked ? "text-[var(--color-ink-faint)]" : "",
            )}
            style={locked ? undefined : { color }}
          >
            {achievement.unlocked
              ? achievement.unlockedOn
                ? `Unlocked ${formatDayShort(achievement.unlockedOn)}`
                : "Unlocked"
              : `${achievement.goal - achievement.progress} to go`}
          </span>
          <span className="numeric text-[var(--color-ink-faint)]">
            {achievement.progress} / {achievement.goal}
          </span>
        </div>
        <ProgressBar
          value={achievement.progressPercent}
          color={locked ? "var(--color-ink-faint)" : color}
          height={5}
        />
      </div>
    </li>
  );
}
