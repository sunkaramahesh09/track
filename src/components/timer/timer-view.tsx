"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon, accentVar } from "@/components/ui/icon";
import {
  MAX_DURATION_MS,
  MIN_DURATION_MS,
  QUICK_PRESETS,
  TASK_PRESETS,
  type TimerMode,
  formatSpoken,
  splitDuration,
} from "@/lib/timer";
import { cn } from "@/lib/utils";
import { TimerDisplay, type FaceTone } from "./timer-display";
import { timer, useTimerFrame, useTimerState } from "./timer-store";

const MODES: { value: TimerMode; label: string; icon: string }[] = [
  { value: "stopwatch", label: "Stopwatch", icon: "Timer" },
  { value: "countdown", label: "Countdown", icon: "Hourglass" },
];

const HOUR_MS = 60 * 60_000;
const NUDGE_MS = 5 * 60_000;

export function TimerView() {
  const state = useTimerState();
  const shown = useTimerFrame();

  const countdown = state.mode === "countdown";
  const finished =
    countdown && !state.running && state.accumulatedMs >= state.durationMs;
  const idle = !state.running && state.accumulatedMs === 0;

  const tone: FaceTone = finished
    ? "done"
    : countdown && shown > 0 && shown <= 10_000
      ? "warn"
      : "normal";

  useTimerKeyboard();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card className="animate-rise">
        {/* ---- face ---- */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <ModeToggle mode={state.mode} />
          <div className="flex items-center gap-2">
            <StatusBadge
              running={state.running}
              finished={finished}
              idle={idle}
            />
            <button
              type="button"
              onClick={() => timer.toggleSound()}
              aria-pressed={state.sound}
              title={state.sound ? "Chime on" : "Chime off"}
              className="grid size-8 place-items-center rounded-lg text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--tint-2)] hover:text-[var(--color-ink)]"
            >
              <Icon
                name={state.sound ? "Volume2" : "VolumeX"}
                className="size-4"
              />
            </button>
          </div>
        </div>

        <CardContent className="px-4 pb-6 pt-6 sm:px-8">
          <TimerDisplay
            ms={shown}
            running={state.running}
            showHours={
              countdown ? state.durationMs >= HOUR_MS : shown >= HOUR_MS
            }
            showCentis={!countdown || shown < 60_000}
            tone={tone}
          />

          {countdown && (
            <div className="mx-auto mt-7 h-1 w-full max-w-md overflow-hidden rounded-full bg-[var(--tint-3)]">
              <div
                className="h-full rounded-full transition-[width] duration-200 ease-linear"
                style={{
                  width: `${Math.min(100, (1 - shown / state.durationMs) * 100)}%`,
                  background: finished
                    ? "var(--color-accent)"
                    : "var(--viz-2)",
                }}
              />
            </div>
          )}

          <p className="mt-5 text-center text-[13px] text-[var(--color-ink-faint)]">
            {finished
              ? `${formatSpoken(state.durationMs)} done. Log it and take the break.`
              : countdown
                ? `Counting down from ${formatSpoken(state.durationMs)}.`
                : "Counting up. Nothing is saved — this is a clock, not a record."}
          </p>

          {/* ---- what you're timing ---- */}
          <div className="mx-auto mt-5 flex max-w-md items-center gap-2 rounded-xl border border-[var(--color-hairline)] bg-[var(--tint-1)] px-3 py-2 focus-within:border-[var(--color-hairline-strong)]">
            <Icon
              name="PenLine"
              className="size-4 shrink-0 text-[var(--color-ink-faint)]"
            />
            <input
              value={state.label}
              onChange={(event) => timer.setLabel(event.target.value)}
              placeholder="What are you working on?"
              maxLength={80}
              className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
            />
          </div>

          {/* ---- transport ---- */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <Button
              variant="primary"
              size="lg"
              onClick={() => timer.toggle()}
              className="min-w-[9.5rem]"
            >
              <Icon name={state.running ? "Pause" : "Play"} />
              {state.running
                ? "Pause"
                : finished
                  ? "Start over"
                  : idle
                    ? "Start"
                    : "Resume"}
            </Button>

            {!countdown && (
              <Button
                variant="glass"
                size="lg"
                onClick={() => timer.lap()}
                disabled={!state.running}
              >
                <Icon name="Flag" />
                Lap
              </Button>
            )}

            <Button
              variant="ghost"
              size="lg"
              onClick={() => timer.reset()}
              disabled={idle}
            >
              <Icon name="RotateCcw" />
              Reset
            </Button>
          </div>

          <p className="mt-4 text-center text-[11px] text-[var(--color-ink-faint)]">
            <Kbd>Space</Kbd> start or pause
            {!countdown && (
              <>
                {" · "}
                <Kbd>L</Kbd> lap
              </>
            )}{" · "}
            <Kbd>R</Kbd> reset
          </p>
        </CardContent>
      </Card>

      {countdown && <DurationPicker durationMs={state.durationMs} />}
      {!countdown && state.laps.length > 0 && <Laps laps={state.laps} />}
    </div>
  );
}

/* ------------------------------- pieces --------------------------------- */

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-[var(--color-hairline-strong)] bg-[var(--tint-2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-ink-muted)]">
      {children}
    </kbd>
  );
}

function StatusBadge({
  running,
  finished,
  idle,
}: {
  running: boolean;
  finished: boolean;
  idle: boolean;
}) {
  if (finished) {
    return (
      <Badge variant="accent">
        <Icon name="BellRing" />
        Time&rsquo;s up
      </Badge>
    );
  }
  if (running) {
    return (
      <Badge variant="success">
        <span className="size-1.5 animate-pulse rounded-full bg-[var(--tier-excellent)]" />
        Running
      </Badge>
    );
  }
  return (
    <Badge variant="neutral">
      <Icon name={idle ? "Circle" : "Pause"} />
      {idle ? "Ready" : "Paused"}
    </Badge>
  );
}

function ModeToggle({ mode }: { mode: TimerMode }) {
  return (
    <div
      role="radiogroup"
      aria-label="Timer mode"
      className="flex gap-0.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--tint-1)] p-0.5"
    >
      {MODES.map((option) => {
        const active = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => timer.setMode(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
              active
                ? "bg-[var(--tint-4)] text-[var(--color-ink)]"
                : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]",
            )}
          >
            <Icon name={option.icon} className="size-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function DurationPicker({ durationMs }: { durationMs: number }) {
  const minutes = Math.round(durationMs / 60_000);

  return (
    <Card className="animate-rise">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              Set the countdown
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-faint)]">
              Changing the duration resets the clock.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              aria-label="Five minutes less"
              disabled={durationMs - NUDGE_MS < MIN_DURATION_MS}
              onClick={() => timer.setDuration(durationMs - NUDGE_MS)}
            >
              <Icon name="Minus" />
            </Button>
            <span className="numeric w-20 text-center font-mono text-lg tabular-nums">
              {minutes}m
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Five minutes more"
              disabled={durationMs + NUDGE_MS > MAX_DURATION_MS}
              onClick={() => timer.setDuration(durationMs + NUDGE_MS)}
            >
              <Icon name="Plus" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset) => (
            <Chip
              key={preset}
              active={minutes === preset}
              onClick={() => timer.setDuration(preset * 60_000)}
            >
              {preset}m
            </Chip>
          ))}
        </div>

        <div className="border-t border-[var(--color-hairline)] pt-4">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">
            Today&rsquo;s targets
          </p>
          <div className="flex flex-wrap gap-2">
            {TASK_PRESETS.map((preset) => (
              <Chip
                key={preset.id}
                active={minutes === preset.minutes}
                onClick={() => timer.setDuration(preset.minutes * 60_000)}
              >
                <Icon
                  name={preset.icon}
                  className="size-3.5"
                  style={{ color: accentVar(preset.accent) }}
                />
                {preset.name}
                <span className="text-[var(--color-ink-faint)]">
                  {preset.minutes}m
                </span>
              </Chip>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
        active
          ? "border-[var(--color-accent)]/45 bg-[var(--color-accent)]/12 text-[var(--color-accent-soft)]"
          : "border-[var(--color-hairline)] bg-[var(--tint-1)] text-[var(--color-ink-muted)] hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)]",
      )}
    >
      {children}
    </button>
  );
}

function Laps({ laps }: { laps: number[] }) {
  const rows = laps.map((total, index) => ({
    index: index + 1,
    total,
    split: total - (laps[index - 1] ?? 0),
  }));
  const splits = rows.map((r) => r.split);
  const fastest = Math.min(...splits);
  const slowest = Math.max(...splits);

  return (
    <Card className="animate-rise">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Laps
          </p>
          <Badge variant="neutral">{rows.length}</Badge>
        </div>
        <ul className="divide-y divide-[var(--color-hairline)]">
          {rows
            .slice()
            .reverse()
            .map((row) => {
              const mark =
                rows.length > 1 && row.split === fastest
                  ? "fastest"
                  : rows.length > 1 && row.split === slowest
                    ? "slowest"
                    : null;
              return (
                <li
                  key={row.index}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="flex items-center gap-2 text-[var(--color-ink-faint)]">
                    <span className="numeric w-6 font-mono tabular-nums">
                      {row.index}
                    </span>
                    {mark && (
                      <Badge variant={mark === "fastest" ? "success" : "warning"}>
                        {mark}
                      </Badge>
                    )}
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="numeric font-mono tabular-nums text-[var(--color-ink)]">
                      {clock(row.split)}
                    </span>
                    <span className="numeric w-24 text-right font-mono text-[13px] tabular-nums text-[var(--color-ink-faint)]">
                      {clock(row.total)}
                    </span>
                  </span>
                </li>
              );
            })}
        </ul>
      </CardContent>
    </Card>
  );
}

function clock(ms: number): string {
  const { hours, minutes, seconds, centis } = splitDuration(ms);
  const head = Number(hours) > 0 ? `${hours}:${minutes}` : minutes;
  return `${head}:${seconds}.${centis}`;
}

/**
 * Transport shortcuts. Deliberately inert while a text field has focus, so
 * typing a space into the label does not pause the clock.
 */
function useTimerKeyboard() {
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        timer.toggle();
      } else if (event.key === "l" || event.key === "L") {
        timer.lap();
      } else if (event.key === "r" || event.key === "R") {
        timer.reset();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
