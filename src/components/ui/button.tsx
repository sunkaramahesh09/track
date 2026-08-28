"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-[#8b6cff] to-[#6d4bf0] text-white shadow-[0_10px_30px_-12px_rgba(124,92,255,0.9)] hover:from-[#9a7dff] hover:to-[#7a5bf5]",
        glass:
          "glass text-[var(--color-ink)] hover:border-[var(--color-hairline-strong)] hover:bg-[var(--tint-3)]",
        ghost:
          "text-[var(--color-ink-muted)] hover:bg-[var(--tint-3)] hover:text-[var(--color-ink)]",
        outline:
          "border border-[var(--color-hairline-strong)] text-[var(--color-ink)] hover:bg-[var(--tint-2)]",
        danger:
          "bg-[var(--tier-poor)]/15 text-[var(--tier-poor)] hover:bg-[var(--tier-poor)]/25",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4",
        lg: "h-11 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "glass", size: "md" },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
