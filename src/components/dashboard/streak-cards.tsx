"use client";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useDashboard } from "./dashboard-provider";
import { cn } from "@/lib/utils";

interface StreakTileProps {
  label: string;
  value: number;
  caption: string;
  icon: string;
  color: string;
  glow?: boolean;
}

function StreakTile({ label, value, caption, icon, color, glow }: StreakTileProps) {
  return (
    <Card interactive className="group relative p-5">
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: color, opacity: 0.16 }}
      />
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">
          {label}
        </p>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl border",
            glow && "animate-float",
          )}
          style={{
            borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
            background: `color-mix(in oklab, ${color} 14%, transparent)`,
            boxShadow: glow ? `0 0 22px -6px ${color}` : undefined,
          }}
        >
          <Icon name={icon} className="size-4.5" style={{ color }} />
        </span>
      </div>

      <p className="numeric mt-3 text-[40px] font-semibold leading-none tracking-tight">
        {value}
        <span className="ml-1.5 text-sm font-medium text-[var(--color-ink-faint)]">
          {value === 1 ? "day" : "days"}
        </span>
      </p>
      <p className="mt-2 text-[13px] leading-snug text-[var(--color-ink-muted)]">
        {caption}
      </p>
    </Card>
  );
}

export function StreakCards() {
  const { overview } = useDashboard();
  const { streaks } = overview;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StreakTile
        label="Current Streak"
        value={streaks.current}
        icon="Flame"
        color="var(--accent-orange)"
        glow={streaks.current > 0}
        caption={
          streaks.current === 0
            ? "Score 70 or more today to start a new chain."
            : streaks.todayQualifies
              ? "Today is locked in. Keep the chain alive tomorrow."
              : "Yesterday still counts — finish today to extend it."
        }
      />
      <StreakTile
        label="Longest Streak"
        value={streaks.longest}
        icon="Trophy"
        color="var(--accent-amber)"
        caption={
          streaks.longest === 0
            ? "Your record starts with the first qualifying day."
            : streaks.current >= streaks.longest && streaks.longest > 0
              ? "You are at your personal best right now."
              : `${streaks.longest - streaks.current} more days to match your record.`
        }
      />
    </div>
  );
}
