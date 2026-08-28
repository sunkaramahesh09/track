import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number into an inclusive range. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Percentage helper that never divides by zero. */
export function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Thousands-separated integer with the locale pinned.
 *
 * A bare `toLocaleString()` resolves differently on the server than in the
 * browser (1,234 vs 1.234), which fails hydration; pinning it makes the
 * output identical on both sides.
 */
export function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}
