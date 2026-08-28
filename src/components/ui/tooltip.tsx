"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-xs rounded-xl border border-[var(--color-hairline-strong)] bg-[color-mix(in_oklab,var(--color-canvas)_94%,white_6%)] px-3 py-2 text-xs leading-relaxed text-[var(--color-ink)] shadow-xl backdrop-blur-xl",
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in data-[state=delayed-open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
