import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide [&_svg]:size-3",
  {
    variants: {
      variant: {
        neutral:
          "border-[var(--color-hairline-strong)] bg-[var(--tint-2)] text-[var(--color-ink-muted)]",
        accent:
          "border-[var(--color-accent)]/35 bg-[var(--color-accent)]/12 text-[var(--color-accent-soft)]",
        success:
          "border-[var(--tier-excellent)]/35 bg-[var(--tier-excellent)]/12 text-[var(--tier-excellent)]",
        info: "border-[var(--tier-good)]/35 bg-[var(--tier-good)]/12 text-[var(--tier-good)]",
        warning:
          "border-[var(--tier-average)]/35 bg-[var(--tier-average)]/12 text-[var(--tier-average)]",
        danger:
          "border-[var(--tier-poor)]/35 bg-[var(--tier-poor)]/12 text-[var(--tier-poor)]",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
