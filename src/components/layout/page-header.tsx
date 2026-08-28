import { Icon } from "@/components/ui/icon";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  actions,
}: PageHeaderProps) {
  return (
    <header className="animate-rise mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
            {icon && <Icon name={icon} className="size-3.5" />}
            {eyebrow}
          </p>
        )}
        <h1 className="text-gradient text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--color-ink-muted)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
