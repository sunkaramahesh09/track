"use client";

import * as React from "react";
import { Icon, accentVar } from "@/components/ui/icon";
import { formatTime } from "@/lib/date";
import type { TaskDefinition } from "@/lib/tasks";
import type { TaskEntry } from "@/types";
import { cn } from "@/lib/utils";

interface TaskRowProps {
  task: TaskDefinition;
  entry: TaskEntry;
  onToggle: (completed: boolean) => void;
  disabled?: boolean;
  index: number;
}

export function TaskRow({ task, entry, onToggle, disabled, index }: TaskRowProps) {
  const color = accentVar(task.accent);
  const done = entry.completed;
  const completedAt = formatTime(entry.completedAt);

  return (
    <li
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
    >
      <button
        type="button"
        onClick={() => onToggle(!done)}
        disabled={disabled}
        aria-pressed={done}
        className={cn(
          "group relative flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-250",
          "disabled:cursor-progress disabled:opacity-70",
          done
            ? "border-transparent bg-[var(--tint-2)]"
            : "border-[var(--color-hairline)] bg-[var(--tint-1)] hover:border-[var(--color-hairline-strong)] hover:bg-[var(--tint-2)]",
        )}
        style={
          done
            ? {
                borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
                boxShadow: `inset 3px 0 0 0 ${color}`,
              }
            : undefined
        }
      >
        {/* Checkbox */}
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-lg border-2 transition-all duration-250",
            done ? "scale-100" : "border-[var(--color-hairline-strong)]",
          )}
          style={
            done
              ? { background: color, borderColor: color, boxShadow: `0 0 16px -4px ${color}` }
              : undefined
          }
        >
          {done && (
            <Icon name="Check" className="animate-pop size-3.5 text-[var(--on-accent)]" strokeWidth={3.5} />
          )}
        </span>

        {/* Icon chip */}
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl border transition-colors"
          style={{
            borderColor: `color-mix(in oklab, ${color} ${done ? 34 : 20}%, transparent)`,
            background: `color-mix(in oklab, ${color} ${done ? 16 : 9}%, transparent)`,
          }}
        >
          <Icon name={task.icon} className="size-4.5" style={{ color }} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span
              className={cn(
                "text-[15px] font-semibold tracking-tight transition-colors",
                done ? "text-[var(--color-ink-muted)] line-through decoration-1" : "text-[var(--color-ink)]",
              )}
            >
              {task.name}
            </span>
            <span className="numeric text-xs font-medium text-[var(--color-ink-faint)]">
              {task.target}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-[var(--color-ink-faint)]">
            {done && completedAt ? `Completed at ${completedAt}` : task.blurb}
          </span>
        </span>

        {/* Weight / XP */}
        <span className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
          <span
            className="numeric text-[11px] font-semibold tabular-nums"
            style={{ color: done ? color : "var(--color-ink-faint)" }}
          >
            +{task.weight} pts
          </span>
          <span className="numeric text-[10px] text-[var(--color-ink-faint)]">
            {task.xp} XP
          </span>
        </span>
      </button>
    </li>
  );
}
