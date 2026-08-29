/**
 * Stopwatch and countdown domain logic.
 *
 * The timer stores *timestamps*, never accumulated ticks: elapsed time is
 * always derived from the wall clock against the moment the current run began.
 * A backgrounded tab, a sleeping laptop and a page refresh all stop delivering
 * animation frames, and none of them may cost you a second.
 */

import { TASKS } from "./tasks";

export type TimerMode = "stopwatch" | "countdown";

export interface TimerState {
  mode: TimerMode;
  /** Countdown target in ms. Ignored by the stopwatch. */
  durationMs: number;
  running: boolean;
  /** Run time banked by previous start/pause cycles. */
  accumulatedMs: number;
  /** Wall-clock ms at which the current run began; null while paused. */
  startedAt: number | null;
  /** Run time at each lap, oldest first. Stopwatch only. */
  laps: number[];
  /** What you are timing — free text, for your own recall. */
  label: string;
  /** Whether the countdown chime plays. */
  sound: boolean;
}

export const DEFAULT_DURATION_MS = 25 * 60_000;
export const MIN_DURATION_MS = 60_000;
export const MAX_DURATION_MS = 12 * 60 * 60_000;

export function initialTimerState(): TimerState {
  return {
    mode: "stopwatch",
    durationMs: DEFAULT_DURATION_MS,
    running: false,
    accumulatedMs: 0,
    startedAt: null,
    laps: [],
    label: "",
    sound: true,
  };
}

/** Total run time, before any countdown clamping. */
export function runTime(state: TimerState, now: number): number {
  const live =
    state.running && state.startedAt !== null
      ? Math.max(0, now - state.startedAt)
      : 0;
  return state.accumulatedMs + live;
}

/** The number on the face: counting up, or counting down towards zero. */
export function displayMs(state: TimerState, now: number): number {
  const run = runTime(state, now);
  if (state.mode === "countdown") return Math.max(0, state.durationMs - run);
  return run;
}

export function hasExpired(state: TimerState, now: number): boolean {
  return state.mode === "countdown" && runTime(state, now) >= state.durationMs;
}

/** Fraction of the countdown consumed, 0–1. Always 0 for the stopwatch. */
export function countdownProgress(state: TimerState, now: number): number {
  if (state.mode !== "countdown" || state.durationMs <= 0) return 0;
  return Math.min(1, runTime(state, now) / state.durationMs);
}

export interface ClockFace {
  hours: string;
  minutes: string;
  seconds: string;
  /** Hundredths, for the small trailing tile. */
  centis: string;
}

/** Splits a duration into the zero-padded parts a clock face shows. */
export function splitDuration(ms: number): ClockFace {
  const total = Math.max(0, Math.floor(ms));
  const seconds = Math.floor(total / 1000);
  return {
    hours: String(Math.floor(seconds / 3600)).padStart(2, "0"),
    minutes: String(Math.floor(seconds / 60) % 60).padStart(2, "0"),
    seconds: String(seconds % 60).padStart(2, "0"),
    centis: String(Math.floor((total % 1000) / 10)).padStart(2, "0"),
  };
}

/** Compact form for the nav pill: "4:09", or "1:04:09" past the hour. */
export function formatCompact(ms: number): string {
  const { hours, minutes, seconds } = splitDuration(ms);
  const h = Number(hours);
  return h > 0
    ? `${h}:${minutes}:${seconds}`
    : `${Number(minutes)}:${seconds}`;
}

/** Prose form for lap tables and summaries: "1h 04m 09s". */
export function formatSpoken(ms: number): string {
  const { hours, minutes, seconds } = splitDuration(ms);
  const h = Number(hours);
  const m = Number(minutes);
  if (h > 0) return `${h}h ${minutes}m ${seconds}s`;
  if (m > 0) return `${m}m ${seconds}s`;
  return `${Number(seconds)}s`;
}

/** Generic durations, in minutes. */
export const QUICK_PRESETS = [5, 10, 15, 25, 30, 45, 60, 90] as const;

export interface TaskPreset {
  id: string;
  name: string;
  minutes: number;
  icon: string;
  accent: string;
}

/**
 * Countdown presets for the timed tasks, derived from the catalogue rather
 * than restated — retuning a target in `tasks.ts` retunes the timer with it.
 */
export const TASK_PRESETS: readonly TaskPreset[] = TASKS.filter(
  (task) => task.unit === "minutes",
).map((task) => ({
  id: task.id,
  name: task.name,
  minutes: task.targetValue,
  icon: task.icon,
  accent: task.accent,
}));
