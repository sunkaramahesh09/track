import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  className?: string;
  barClassName?: string;
  color?: string;
  height?: number;
  /** Adds a travelling highlight; use sparingly for hero bars. */
  shimmer?: boolean;
}

export function ProgressBar({
  value,
  className,
  barClassName,
  color = "var(--color-accent)",
  height = 6,
  shimmer = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-white/[0.07]",
        className,
      )}
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          barClassName,
        )}
        style={{
          width: `${clamped}%`,
          background: `linear-gradient(90deg, color-mix(in oklab, ${color} 65%, transparent), ${color})`,
          boxShadow: `0 0 12px -2px ${color}`,
        }}
      />
      {shimmer && clamped > 0 && (
        <div
          className="animate-shimmer pointer-events-none absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${clamped}%`,
            backgroundImage:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      )}
    </div>
  );
}
