"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-[var(--color-hairline)] bg-[var(--tint-1)] px-4 py-6 backdrop-blur-xl lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#8b6cff] to-[#4f37c9] shadow-[0_8px_24px_-10px_rgba(124,92,255,0.9)]">
          <Icon name="Rocket" className="size-4.5 text-white" />
        </span>
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold tracking-tight">
            Track
          </span>
          <span className="block text-[11px] text-[var(--color-ink-faint)]">
            Discipline, measured
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                active
                  ? "bg-[var(--tint-3)] text-[var(--color-ink)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--tint-2)] hover:text-[var(--color-ink)]",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent)]" />
              )}
              <Icon
                name={item.icon}
                className={cn(
                  "size-4.5 transition-colors",
                  active
                    ? "text-[var(--color-accent-soft)]"
                    : "text-[var(--color-ink-faint)] group-hover:text-[var(--color-ink-muted)]",
                )}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mb-3">
        <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">
          Theme
        </p>
        <ThemeToggle />
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
          The rule
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
          Missed tasks never roll over. Every day starts clean — this measures
          consistency, not backlog.
        </p>
      </div>
    </aside>
  );
}
