"use client";

import * as React from "react";
import {
  DEFAULT_DURATION_MS,
  MAX_DURATION_MS,
  MIN_DURATION_MS,
  type TimerMode,
  type TimerState,
  displayMs,
  hasExpired,
  initialTimerState,
  runTime,
} from "@/lib/timer";

export const TIMER_STORAGE_KEY = "track-timer";

/* -------------------------------------------------------------------------- *
 * The timer is a module-level external store, not React state, for two
 * reasons: it has to keep running while you are on another page, and it has to
 * survive a refresh. Components read it with useSyncExternalStore, the same
 * pattern the theme uses — nothing is mirrored into state by an effect.
 *
 * There are two subscription granularities on purpose. The clock face needs a
 * new value every animation frame; the nav pill and the tab title need one a
 * second. Both are driven by the single rAF loop below, so a running timer
 * costs exactly one loop no matter how many things are watching it.
 * -------------------------------------------------------------------------- */

const SERVER_STATE: TimerState = initialTimerState();

let state: TimerState = SERVER_STATE;
let hydrated = false;

const stateListeners = new Set<() => void>();
const frameListeners = new Set<() => void>();
const secondListeners = new Set<() => void>();

/** Last published face value, in ms. A primitive, so it compares by value. */
let frameValue = 0;
/** The same value floored to whole seconds. */
let secondValue = 0;

let rafId: number | null = null;

/* ----------------------------- persistence ------------------------------ */

function readStored(): TimerState | null {
  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TimerState>;
    const base = initialTimerState();
    const next: TimerState = {
      mode: parsed.mode === "countdown" ? "countdown" : "stopwatch",
      durationMs: clampDuration(parsed.durationMs ?? base.durationMs),
      running: parsed.running === true,
      accumulatedMs: Math.max(0, Number(parsed.accumulatedMs) || 0),
      startedAt:
        typeof parsed.startedAt === "number" && Number.isFinite(parsed.startedAt)
          ? parsed.startedAt
          : null,
      laps: Array.isArray(parsed.laps)
        ? parsed.laps.filter((n) => typeof n === "number")
        : [],
      label: typeof parsed.label === "string" ? parsed.label.slice(0, 80) : "",
      sound: parsed.sound !== false,
    };
    // A run persisted without its start time cannot be resumed honestly.
    if (next.running && next.startedAt === null) next.running = false;
    return next;
  } catch {
    return null;
  }
}

function persist() {
  try {
    window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing can reject writes; the timer still works in-memory.
  }
}

function clampDuration(ms: number): number {
  if (!Number.isFinite(ms)) return DEFAULT_DURATION_MS;
  return Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, Math.round(ms)));
}

/* -------------------------------- ticking -------------------------------- */

/**
 * Recomputes the published face values. `notify` is false when called from
 * inside `subscribe`, because React re-reads the snapshot straight after
 * subscribing and a synchronous notify there would be a wasted render.
 */
function syncTick(notify: boolean, now = Date.now()) {
  const shown = displayMs(state, now);
  if (shown !== frameValue) {
    frameValue = shown;
    if (notify) frameListeners.forEach((fn) => fn());
  }
  const whole = Math.floor(shown / 1000);
  if (whole !== secondValue) {
    secondValue = whole;
    if (notify) secondListeners.forEach((fn) => fn());
  }
}

function step() {
  rafId = null;
  const now = Date.now();
  if (hasExpired(state, now)) {
    expire();
    return;
  }
  syncTick(true, now);
  ensureLoop();
}

function ensureLoop() {
  if (rafId !== null || !state.running) return;
  if (typeof requestAnimationFrame !== "function") return;
  rafId = requestAnimationFrame(step);
}

function stopLoop() {
  if (rafId === null) return;
  cancelAnimationFrame(rafId);
  rafId = null;
}

/**
 * Nothing is watching, so nothing needs computing. Elapsed time is derived
 * from timestamps, so the loop can be dropped and picked up freely.
 */
function stopLoopIfUnwatched() {
  if (stateListeners.size || frameListeners.size || secondListeners.size) return;
  stopLoop();
}

/* ------------------------------- mutation -------------------------------- */

function commit(next: TimerState) {
  state = next;
  persist();
  stateListeners.forEach((fn) => fn());
  syncTick(true);
  if (state.running) ensureLoop();
  else stopLoop();
}

function getState(): TimerState {
  if (!hydrated) {
    hydrated = true;
    state = readStored() ?? state;
    syncTick(false);
  }
  return state;
}

function getServerState(): TimerState {
  return SERVER_STATE;
}

/** Fires when the countdown reaches zero. */
function expire() {
  stopLoop();
  const finished: TimerState = {
    ...state,
    running: false,
    startedAt: null,
    accumulatedMs: state.durationMs,
  };
  const shouldChime = state.sound;
  commit(finished);
  if (shouldChime) chime();
}

/**
 * A short three-note chime, synthesised rather than shipped as an asset.
 * Audio is a nicety here — every failure path is silent on purpose.
 */
function chime() {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const t0 = ctx.currentTime;
    [783.99, 783.99, 1046.5].forEach((frequency, index) => {
      const at = t0 + index * 0.26;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.2, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.24);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.25);
    });
    window.setTimeout(() => void ctx.close(), 1400);
  } catch {
    // No audio output, or the page has never been interacted with.
  }
}

/* -------------------------------- actions -------------------------------- */

export const timer = {
  start() {
    if (state.running) return;
    if (state.mode === "countdown" && state.accumulatedMs >= state.durationMs) {
      // Restarting a finished countdown starts it over rather than no-ops.
      commit({ ...state, accumulatedMs: 0, running: true, startedAt: Date.now() });
      return;
    }
    commit({ ...state, running: true, startedAt: Date.now() });
  },

  pause() {
    if (!state.running) return;
    commit({
      ...state,
      running: false,
      startedAt: null,
      accumulatedMs: runTime(state, Date.now()),
    });
  },

  toggle() {
    if (state.running) timer.pause();
    else timer.start();
  },

  reset() {
    commit({ ...state, running: false, startedAt: null, accumulatedMs: 0, laps: [] });
  },

  lap() {
    if (state.mode !== "stopwatch" || !state.running) return;
    commit({ ...state, laps: [...state.laps, runTime(state, Date.now())] });
  },

  setMode(mode: TimerMode) {
    if (mode === state.mode) return;
    // Switching face resets the clock — a half-run stopwatch means nothing as
    // a countdown, and vice versa.
    commit({
      ...state,
      mode,
      running: false,
      startedAt: null,
      accumulatedMs: 0,
      laps: [],
    });
  },

  setDuration(ms: number) {
    const durationMs = clampDuration(ms);
    commit({
      ...state,
      durationMs,
      running: false,
      startedAt: null,
      accumulatedMs: 0,
    });
  },

  setLabel(label: string) {
    commit({ ...state, label: label.slice(0, 80) });
  },

  toggleSound() {
    commit({ ...state, sound: !state.sound });
  },
};

/* --------------------------------- hooks --------------------------------- */

function subscribeState(onChange: () => void) {
  stateListeners.add(onChange);
  ensureLoop();
  return () => {
    stateListeners.delete(onChange);
    stopLoopIfUnwatched();
  };
}

function subscribeFrame(onChange: () => void) {
  frameListeners.add(onChange);
  getState();
  syncTick(false);
  ensureLoop();
  return () => {
    frameListeners.delete(onChange);
    stopLoopIfUnwatched();
  };
}

function subscribeSecond(onChange: () => void) {
  secondListeners.add(onChange);
  getState();
  syncTick(false);
  ensureLoop();
  return () => {
    secondListeners.delete(onChange);
    stopLoopIfUnwatched();
  };
}

/** The timer's configuration. Re-renders only when something is changed. */
export function useTimerState(): TimerState {
  return React.useSyncExternalStore(subscribeState, getState, getServerState);
}

/** The face value in ms, refreshed every animation frame. */
export function useTimerFrame(): number {
  return React.useSyncExternalStore(
    subscribeFrame,
    () => frameValue,
    () => 0,
  );
}

/** The face value in whole seconds, for anything that shouldn't run at 60fps. */
export function useTimerSecond(): number {
  return React.useSyncExternalStore(
    subscribeSecond,
    () => secondValue,
    () => 0,
  );
}
