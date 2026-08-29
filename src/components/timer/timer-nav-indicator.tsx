"use client";

import * as React from "react";
import { formatCompact } from "@/lib/timer";
import { cn } from "@/lib/utils";
import { useTimerSecond, useTimerState } from "./timer-store";

/**
 * The running clock, surfaced in the desktop sidebar so you never have to
 * leave the page you are working on to check it. Ticks once a second, not
 * once a frame — the face on /timer is the only thing that needs 60fps.
 */
export function TimerNavPill({ className }: { className?: string }) {
  const state = useTimerState();
  const seconds = useTimerSecond();

  if (!state.running && state.accumulatedMs === 0) return null;

  return (
    <span
      className={cn(
        "numeric ml-auto rounded-md px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
        state.running
          ? "bg-[var(--color-accent)]/15 text-[var(--color-accent-soft)]"
          : "bg-[var(--tint-3)] text-[var(--color-ink-faint)]",
        className,
      )}
    >
      {formatCompact(seconds * 1000)}
    </span>
  );
}

/** The same signal, reduced to a dot for the mobile tab bar. */
export function TimerNavDot() {
  const state = useTimerState();
  if (!state.running) return null;
  return (
    <span className="absolute right-[26%] top-1 size-1.5 animate-pulse rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
  );
}

/**
 * Mirrors a running timer into the tab title, so it stays visible from
 * another tab entirely. Mounted once, in the shell — never alongside the nav
 * indicators, which render twice across the two navigations.
 */
export function TimerTitleBeacon() {
  const state = useTimerState();
  const seconds = useTimerSecond();
  const base = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!state.running) {
      if (base.current !== null) {
        document.title = base.current;
        base.current = null;
      }
      return;
    }
    base.current ??= document.title;
    document.title = `${formatCompact(seconds * 1000)} · ${base.current}`;
  }, [state.running, seconds]);

  return null;
}
