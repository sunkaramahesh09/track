"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { Icon } from "@/components/ui/icon";
import { formatDayLong, todayKey } from "@/lib/date";
import { ThemeToggleButton } from "@/components/theme/theme-toggle";

/** Compact header for small screens; the sidebar covers desktop. */
export function TopBar() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((i) => i.href === pathname) ?? NAV_ITEMS[0];

  // Safe to render on the server: the calendar zone is pinned, so this string
  // is identical on both sides.
  const today = formatDayLong(todayKey());

  return (
    <div className="sticky top-0 z-30 border-b border-[var(--color-hairline)] bg-[color-mix(in_oklab,var(--color-canvas)_78%,transparent)] backdrop-blur-2xl lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[#8b6cff] to-[#4f37c9]">
            <Icon name="Rocket" className="size-4 text-white" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{current.label}</p>
            <p className="text-[11px] text-[var(--color-ink-faint)]">
              {today ?? " "}
            </p>
          </div>
        </div>

        <ThemeToggleButton />
      </div>
    </div>
  );
}
