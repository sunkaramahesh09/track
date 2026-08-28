"use client";

import { Icon } from "@/components/ui/icon";
import { ChartEmpty } from "./chart-chrome";
import { TIER_MARKS } from "./chart-chrome";

interface TierRow {
  tier: string;
  label: string;
  count: number;
  color: string;
}

const TIER_ICONS: Record<string, string> = {
  excellent: "Sparkles",
  good: "ThumbsUp",
  average: "Minus",
  poor: "TrendingDown",
};

/**
 * How your days distribute across the four performance tiers.
 * Status colours, so every row carries an icon and a written label —
 * the colour never carries the meaning alone.
 */
export function TierDistribution({ rows }: { rows: TierRow[] }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  if (total === 0) {
    return <ChartEmpty message="Once you log a few days, the shape of your consistency shows up here." />;
  }

  return (
    <div className="space-y-3">
      {/* Single stacked bar with 2px surface gaps between segments. */}
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full">
        {rows
          .filter((r) => r.count > 0)
          .map((row) => (
            <div
              key={row.tier}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${(row.count / total) * 100}%`,
                background: TIER_MARKS[row.tier],
              }}
              title={`${row.label}: ${row.count}`}
            />
          ))}
      </div>

      <ul className="grid grid-cols-2 gap-2.5">
        {rows.map((row) => (
          <li key={row.tier} className="flex items-center gap-2.5">
            <span
              className="grid size-7 shrink-0 place-items-center rounded-lg"
              style={{
                background: `color-mix(in oklab, ${TIER_MARKS[row.tier]} 20%, transparent)`,
              }}
            >
              <Icon
                name={TIER_ICONS[row.tier] ?? "Circle"}
                className="size-3.5"
                style={{ color: TIER_MARKS[row.tier] }}
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-[var(--color-ink)]">
                {row.label}
              </span>
              <span className="numeric block text-[11px] text-[var(--color-ink-faint)]">
                {row.count} {row.count === 1 ? "day" : "days"} ·{" "}
                {Math.round((row.count / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
