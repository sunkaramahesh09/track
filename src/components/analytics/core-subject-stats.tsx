"use client";

import { Icon, accentVar } from "@/components/ui/icon";
import { ChartEmpty, SERIES } from "./chart-chrome";
import { coreSubjectByKey } from "@/lib/core-subjects";

interface Stat {
  key: string;
  label: string;
  completions: number;
  opportunities: number;
  rate: number;
}

export function CoreSubjectStats({ stats }: { stats: Stat[] }) {
  if (stats.every((s) => s.opportunities === 0)) {
    return (
      <ChartEmpty message="Each weekday's core subject appears here once that day has come round." />
    );
  }

  return (
    <ul className="space-y-2.5">
      {stats.map((stat) => {
        const plan = coreSubjectByKey(stat.key);
        const untouched = stat.opportunities === 0;
        return (
          <li key={stat.key}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <Icon
                  name={plan?.icon ?? "BookOpen"}
                  className="size-3.5 shrink-0"
                  style={{ color: accentVar(plan?.accent ?? "violet") }}
                />
                <span className="truncate text-[13px] font-medium text-[var(--color-ink)]">
                  {stat.label}
                </span>
              </span>
              <span className="numeric shrink-0 text-[12px] font-semibold text-[var(--color-ink-muted)]">
                {untouched ? "—" : `${stat.rate}%`}
                <span className="ml-1.5 font-normal text-[var(--color-ink-faint)]">
                  {stat.completions}/{stat.opportunities}
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${stat.rate}%`, background: SERIES[0] }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
