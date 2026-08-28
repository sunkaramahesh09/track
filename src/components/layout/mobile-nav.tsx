"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-hairline)] bg-[color-mix(in_oklab,var(--color-canvas)_82%,transparent)] backdrop-blur-2xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors",
                active
                  ? "text-[var(--color-accent-soft)]"
                  : "text-[var(--color-ink-faint)]",
              )}
            >
              {active && (
                <span className="absolute -top-px h-[2px] w-8 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]" />
              )}
              <Icon name={item.icon} className="size-5" />
              {item.short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
