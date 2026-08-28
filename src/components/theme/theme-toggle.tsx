"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { useTheme, type Theme } from "./theme-provider";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "Sun" },
  { value: "dark", label: "Dark", icon: "Moon" },
  { value: "system", label: "System", icon: "Monitor" },
];

/** Three-way segmented control, used in the desktop sidebar. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "flex gap-0.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--tint-1)] p-0.5",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
              active
                ? "bg-[var(--tint-4)] text-[var(--color-ink)]"
                : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]",
            )}
          >
            <Icon name={option.icon} className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}

/** Single button that cycles the three modes. Used in the mobile bar. */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, resolved, cycle } = useTheme();

  const icon =
    theme === "system" ? "Monitor" : resolved === "dark" ? "Moon" : "Sun";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${theme}. Activate to change.`}
      title={`Theme: ${theme}`}
      className={cn(
        "grid size-9 place-items-center rounded-xl border border-[var(--color-hairline)] text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)]",
        className,
      )}
    >
      <Icon name={icon} className="size-4" />
    </button>
  );
}
