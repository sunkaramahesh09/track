"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useDashboard } from "./dashboard-provider";
import { cn } from "@/lib/utils";

export function ScoreCard() {
  const { overview } = useDashboard();
  const { score } = overview;
  const [open, setOpen] = React.useState(false);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Daily Score</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="-mr-2 -mt-1 text-[var(--color-ink-faint)]"
        >
          {open ? "Hide" : "Breakdown"}
          <Icon
            name="ChevronDown"
            className={cn("transition-transform", open && "rotate-180")}
          />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <div className="flex items-end gap-3">
          <span
            className="numeric text-[52px] font-semibold leading-none tracking-tight"
            style={{ color: score.performance.color }}
          >
            {score.score}
          </span>
          <span className="pb-2 text-base text-[var(--color-ink-faint)]">/ 100</span>
        </div>

        <p
          className="mt-2 text-sm font-semibold"
          style={{ color: score.performance.color }}
        >
          {score.performance.label}
        </p>

        <ProgressBar
          value={score.score}
          color={score.performance.color}
          height={8}
          className="mt-4"
          shimmer
        />

        <div className="mt-3 flex justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-ink-faint)]">
          <span>0</span>
          <span className="text-[var(--tier-average)]">60</span>
          <span className="text-[var(--tier-good)]">75</span>
          <span className="text-[var(--tier-excellent)]">90</span>
        </div>

        {open && (
          <ul className="animate-rise mt-4 space-y-1.5 border-t border-[var(--color-hairline)] pt-4">
            {score.breakdown.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 text-[13px]"
              >
                <span
                  className={cn(
                    "flex min-w-0 items-center gap-2 truncate",
                    row.completed
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--color-ink-faint)]",
                  )}
                >
                  <Icon
                    name={row.completed ? "CircleCheck" : "Circle"}
                    className={cn(
                      "size-3.5 shrink-0",
                      row.completed && "text-[var(--tier-excellent)]",
                    )}
                  />
                  <span className="truncate">{row.name}</span>
                </span>
                <span
                  className={cn(
                    "numeric shrink-0 tabular-nums",
                    row.completed
                      ? "text-[var(--tier-excellent)]"
                      : "text-[var(--color-ink-faint)]",
                  )}
                >
                  {row.earned} / {row.weight}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
