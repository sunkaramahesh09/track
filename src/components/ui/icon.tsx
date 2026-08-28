"use client";

import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

/**
 * Resolves icon names stored in the domain layer (tasks, achievements) to
 * Lucide components, so the data model never imports React.
 */
export function Icon({
  name,
  ...props
}: LucideProps & { name: string }) {
  const Resolved =
    (Lucide as unknown as Record<string, React.ComponentType<LucideProps>>)[name] ??
    Lucide.Circle;
  return <Resolved {...props} />;
}

export const ACCENT_VARS: Record<string, string> = {
  violet: "var(--accent-violet)",
  cyan: "var(--accent-cyan)",
  emerald: "var(--accent-emerald)",
  amber: "var(--accent-amber)",
  rose: "var(--accent-rose)",
  sky: "var(--accent-sky)",
  fuchsia: "var(--accent-fuchsia)",
  lime: "var(--accent-lime)",
  orange: "var(--accent-orange)",
};

export function accentVar(token: string) {
  return ACCENT_VARS[token] ?? "var(--color-accent)";
}
