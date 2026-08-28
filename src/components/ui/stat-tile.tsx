import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string | number;
  suffix?: string;
  caption?: string;
  icon: string;
  color?: string;
}

/** A hero number is the right form when the story is one value. */
export function StatTile({
  label,
  value,
  suffix,
  caption,
  icon,
  color = "var(--color-accent)",
}: StatTileProps) {
  const isLongText = typeof value === "string" && value.length > 10;

  return (
    <Card interactive className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">
          {label}
        </p>
        <Icon name={icon} className="size-4 shrink-0" style={{ color }} />
      </div>
      {/* A long text value (a badge name, say) steps down a size so it stays on
          one or two lines instead of overflowing the tile. */}
      <p
        className={cn(
          "numeric mt-2.5 font-semibold leading-none tracking-tight",
          isLongText ? "text-[19px] leading-tight" : "text-[28px]",
        )}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-medium text-[var(--color-ink-faint)]">
            {suffix}
          </span>
        )}
      </p>
      {caption && (
        <p className="mt-1.5 text-[11.5px] leading-snug text-[var(--color-ink-faint)]">
          {caption}
        </p>
      )}
    </Card>
  );
}
