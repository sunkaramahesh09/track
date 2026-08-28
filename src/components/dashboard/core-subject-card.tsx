"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon, accentVar } from "@/components/ui/icon";
import { useDashboard } from "./dashboard-provider";
import { CORE_SUBJECT_WEIGHT, CORE_SUBJECT_XP } from "@/lib/tasks";
import { formatTime, weekdayName } from "@/lib/date";
import { cn } from "@/lib/utils";

export function CoreSubjectCard() {
  const { overview, pending, toggleCoreSubject } = useDashboard();
  const { corePlan, day, date } = overview;
  const done = day.coreSubject.completed;
  const color = accentVar(corePlan.accent);
  const completedAt = formatTime(day.coreSubject.completedAt);

  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full blur-3xl"
        style={{ background: color, opacity: 0.15 }}
      />

      <CardHeader>
        <div>
          <CardTitle>Core Subject · {weekdayName(date)}</CardTitle>
          <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
            Rotates automatically with the day of the week.
          </p>
        </div>
        <Badge variant={done ? "success" : "neutral"}>
          <Icon name="Clock" />
          {corePlan.target}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="flex items-start gap-4">
          <span
            className="grid size-12 shrink-0 place-items-center rounded-2xl border"
            style={{
              borderColor: `color-mix(in oklab, ${color} 34%, transparent)`,
              background: `color-mix(in oklab, ${color} 14%, transparent)`,
            }}
          >
            <Icon name={corePlan.icon} className="size-5.5" style={{ color }} />
          </span>

          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-semibold tracking-tight">
              {corePlan.label}
            </h4>
            <p className="mt-0.5 text-[13px] text-[var(--color-ink-muted)]">
              {corePlan.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {corePlan.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-lg border px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    borderColor: `color-mix(in oklab, ${color} 26%, transparent)`,
                    background: `color-mix(in oklab, ${color} 9%, transparent)`,
                    color,
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleCoreSubject(!done)}
          disabled={pending}
          aria-pressed={done}
          className={cn(
            "mt-5 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-250 active:scale-[0.99]",
            "disabled:cursor-progress disabled:opacity-70",
            done
              ? "text-[var(--on-accent)]"
              : "border-[var(--color-hairline-strong)] text-[var(--color-ink)] hover:bg-[var(--tint-3)]",
          )}
          style={
            done
              ? {
                  background: color,
                  borderColor: color,
                  boxShadow: `0 10px 30px -14px ${color}`,
                }
              : undefined
          }
        >
          <Icon name={done ? "CheckCircle2" : "Circle"} className="size-4" />
          {done
            ? completedAt
              ? `Completed at ${completedAt}`
              : "Completed"
            : `Mark complete · +${CORE_SUBJECT_WEIGHT} pts · ${CORE_SUBJECT_XP} XP`}
        </button>
      </CardContent>
    </Card>
  );
}
