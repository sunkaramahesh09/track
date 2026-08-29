"use client";

import { splitDuration } from "@/lib/timer";
import { cn } from "@/lib/utils";

export type FaceTone = "normal" | "warn" | "done";

const TONE_INK: Record<FaceTone, string> = {
  normal: "var(--color-ink)",
  warn: "var(--tier-average)",
  done: "var(--color-accent)",
};

/** One split-flap tile, holding a two-digit group. */
function Flap({ value, tone }: { value: string; tone: FaceTone }) {
  return (
    <span className="flap px-[0.15em] py-[0.05em]">
      <span
        className="numeric relative block font-semibold leading-[1.06] tracking-[-0.035em] tabular-nums"
        style={{ color: TONE_INK[tone] }}
      >
        {value}
      </span>
    </span>
  );
}

function Colon({ blinking }: { blinking: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex flex-col justify-center gap-[0.22em] px-[0.06em] pb-[0.12em]",
        blinking && "animate-blink",
      )}
    >
      <span className="size-[0.12em] rounded-full bg-[var(--color-ink-faint)]" />
      <span className="size-[0.12em] rounded-full bg-[var(--color-ink-faint)]" />
    </span>
  );
}

interface TimerDisplayProps {
  ms: number;
  running: boolean;
  /** Hours tile is dropped below an hour so the face stays wide, not cramped. */
  showHours: boolean;
  showCentis: boolean;
  tone: FaceTone;
}

export function TimerDisplay({
  ms,
  running,
  showHours,
  showCentis,
  tone,
}: TimerDisplayProps) {
  const { hours, minutes, seconds, centis } = splitDuration(ms);

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`${hours} hours ${minutes} minutes ${seconds} seconds`}
      className="flex w-full items-end justify-center text-[clamp(2.7rem,13vw,7.5rem)]"
    >
      {showHours && (
        <>
          <Flap value={hours} tone={tone} />
          <Colon blinking={running} />
        </>
      )}
      <Flap value={minutes} tone={tone} />
      <Colon blinking={running} />
      <Flap value={seconds} tone={tone} />
      {showCentis && (
        <span className="numeric ml-[0.14em] pb-[0.16em] font-mono text-[0.3em] font-medium tabular-nums text-[var(--color-ink-faint)]">
          .{centis}
        </span>
      )}
    </div>
  );
}
