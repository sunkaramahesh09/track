"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Single colour, or a two-stop gradient. */
  color?: string;
  gradient?: [string, string];
  trackColor?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * SVG progress ring.
 *
 * The arc starts empty and animates to `value` on mount: the first paint uses
 * offset = circumference, then a single animation frame later the real offset
 * is applied and the CSS transition does the work. A unique gradient id per
 * instance prevents collisions when several rings share a page.
 */
export function ProgressRing({
  value,
  size = 160,
  strokeWidth = 12,
  color,
  gradient,
  trackColor = "rgba(255,255,255,0.07)",
  className,
  children,
}: ProgressRingProps) {
  const gradientId = React.useId();
  const clamped = Math.max(0, Math.min(100, value));
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = mounted ? circumference - (clamped / 100) * circumference : circumference;
  const stroke = gradient ? `url(#${gradientId})` : (color ?? "var(--color-accent)");

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)",
            filter: "drop-shadow(0 0 10px rgba(124,92,255,0.35))",
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {children}
      </div>
    </div>
  );
}
