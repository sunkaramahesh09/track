import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "glass rounded-[var(--radius-card)] relative overflow-hidden",
        interactive && "glass-hover",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3 p-5 pb-3", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-[var(--color-ink-faint)]", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-[var(--color-hairline)] px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}
