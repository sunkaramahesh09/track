"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Icon, accentVar } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { TASKS } from "@/lib/tasks";
import { performanceFor } from "@/lib/scoring";
import { formatDayLong, formatTime, type DayKey } from "@/lib/date";
import type { DayLog } from "@/types";
import { cn } from "@/lib/utils";

/** Detail view for a clicked calendar cell. Read-only: history is a record. */
export function DayDetailDialog({
  date,
  onOpenChange,
}: {
  date: DayKey | null;
  onOpenChange: (open: boolean) => void;
}) {
  /**
   * One state slot keyed by the day it describes, so `loading` is derived
   * rather than toggled — the dialog is loading whenever the result on hand
   * is not for the day currently selected.
   */
  const [result, setResult] = React.useState<{
    date: DayKey;
    log: DayLog | null;
    error: string | null;
  } | null>(null);

  React.useEffect(() => {
    if (!date) return;
    let cancelled = false;

    fetch(`/api/day/${date}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Could not load ${date}`);
        return (await r.json()) as DayLog;
      })
      .then((data) => {
        if (!cancelled) setResult({ date, log: data, error: null });
      })
      .catch((e) => {
        if (!cancelled) setResult({ date, log: null, error: (e as Error).message });
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  const current = result?.date === date ? result : null;
  const log = current?.log ?? null;
  const error = current?.error ?? null;
  const loading = Boolean(date) && !current;

  const performance = log ? performanceFor(log.score) : null;
  const notes = log?.notes;
  const hasNotes =
    notes && (notes.wentWell || notes.needsImprovement || notes.tomorrowFocus);

  return (
    <Dialog open={Boolean(date)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{date ? formatDayLong(date) : ""}</DialogTitle>
        <DialogDescription>
          A record of that day. Nothing here rolls forward.
        </DialogDescription>

        {loading && (
          <div className="mt-5 space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}

        {error && (
          <p className="mt-5 text-sm text-[var(--tier-poor)]">{error}</p>
        )}

        {log && performance && (
          <div className="mt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span
                  className="numeric text-4xl font-semibold leading-none tracking-tight"
                  style={{ color: performance.color }}
                >
                  {log.score}
                </span>
                <span className="ml-1 text-sm text-[var(--color-ink-faint)]">
                  / 100
                </span>
                <p
                  className="mt-1 text-[13px] font-semibold"
                  style={{ color: performance.color }}
                >
                  {performance.label}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge variant="accent">
                  <Icon name="Zap" />
                  {log.xpEarned} XP
                </Badge>
                <Badge variant={log.score >= 70 ? "success" : "neutral"}>
                  <Icon name={log.score >= 70 ? "Flame" : "Minus"} />
                  {log.score >= 70 ? "Counted toward streak" : "Did not qualify"}
                </Badge>
              </div>
            </div>

            <ProgressBar
              value={log.score}
              color={performance.color}
              height={6}
              className="mt-4"
            />

            <ul className="mt-5 space-y-1.5">
              <li className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--color-ink-faint)]">
                <span>Tasks</span>
                <span className="numeric">
                  {log.completedCount} of {TASKS.length + 1}
                </span>
              </li>

              {TASKS.map((task) => {
                const entry = log.tasks.find((t) => t.taskId === task.id);
                const done = Boolean(entry?.completed);
                const at = formatTime(entry?.completedAt);
                return (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-[13px] odd:bg-[var(--tint-1)]"
                  >
                    <Icon
                      name={done ? "CircleCheck" : "Circle"}
                      className={cn("size-4 shrink-0")}
                      style={{
                        color: done ? accentVar(task.accent) : "var(--color-ink-faint)",
                      }}
                    />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        done ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]",
                      )}
                    >
                      {task.name}
                    </span>
                    <span className="numeric shrink-0 text-[11px] text-[var(--color-ink-faint)]">
                      {done ? (at ?? "done") : task.target}
                    </span>
                  </li>
                );
              })}

              <li className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-[13px] odd:bg-[var(--tint-1)]">
                <Icon
                  name={log.coreSubject.completed ? "CircleCheck" : "Circle"}
                  className="size-4 shrink-0"
                  style={{
                    color: log.coreSubject.completed
                      ? "var(--color-accent-soft)"
                      : "var(--color-ink-faint)",
                  }}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate",
                    log.coreSubject.completed
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--color-ink-faint)]",
                  )}
                >
                  Core: {log.coreSubject.label}
                </span>
                <span className="numeric shrink-0 text-[11px] text-[var(--color-ink-faint)]">
                  {log.coreSubject.completed
                    ? (formatTime(log.coreSubject.completedAt) ?? "done")
                    : "1 hour"}
                </span>
              </li>
            </ul>

            {hasNotes && (
              <div className="mt-5 space-y-3 border-t border-[var(--color-hairline)] pt-4">
                {notes.wentWell && (
                  <NoteBlock label="What went well" text={notes.wentWell} color="var(--tier-excellent)" />
                )}
                {notes.needsImprovement && (
                  <NoteBlock label="Needs improvement" text={notes.needsImprovement} color="var(--tier-average)" />
                )}
                {notes.tomorrowFocus && (
                  <NoteBlock label="Tomorrow's focus" text={notes.tomorrowFocus} color="var(--accent-cyan)" />
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function NoteBlock({
  label,
  text,
  color,
}: {
  label: string;
  text: string;
  color: string;
}) {
  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color }}
      >
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
        {text}
      </p>
    </div>
  );
}
