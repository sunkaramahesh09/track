"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { useDashboard } from "./dashboard-provider";

const ICONS = {
  level: "TrendingUp",
  badge: "Medal",
  perfect: "Sparkles",
} as const;

/** Transient reward moment shown when a mutation crosses a milestone. */
export function CelebrationToast() {
  const { celebration, dismissCelebration } = useDashboard();

  React.useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(dismissCelebration, 6000);
    return () => clearTimeout(timer);
  }, [celebration, dismissCelebration]);

  if (!celebration) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-pop fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm lg:inset-x-auto lg:bottom-8 lg:right-8 lg:mx-0"
    >
      {/* An overlay lands on top of dense cards, so it gets an opaque ground
          rather than the translucent glass used by in-flow surfaces. */}
      <div
        className="flex items-start gap-3 rounded-2xl border border-[var(--color-accent)]/40 p-4 shadow-[0_20px_60px_-20px_rgba(124,92,255,0.7)] backdrop-blur-2xl"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--color-canvas) 92%, white 8%), color-mix(in oklab, var(--color-canvas) 97%, transparent))",
        }}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#8b6cff] to-[#4f37c9]">
          <Icon name={ICONS[celebration.kind]} className="size-5 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-soft)]">
            {celebration.kind === "level"
              ? "Level up"
              : celebration.kind === "badge"
                ? "Badge unlocked"
                : "Milestone"}
          </p>
          <p className="mt-0.5 text-[15px] font-semibold tracking-tight">
            {celebration.title}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--color-ink-muted)]">
            {celebration.detail}
          </p>
        </div>
        <button
          type="button"
          onClick={dismissCelebration}
          className="-mr-1 -mt-1 rounded-lg p-1 text-[var(--color-ink-faint)] transition-colors hover:bg-white/10 hover:text-[var(--color-ink)]"
        >
          <Icon name="X" className="size-3.5" />
          <span className="sr-only">Dismiss</span>
        </button>
      </div>
    </div>
  );
}
