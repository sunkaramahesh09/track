"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared chart chrome so every plot in the app reads as one system:
 * recessive hairline grid, muted tick text, and a single tooltip shell.
 */

export const AXIS_TICK = {
  fill: "var(--color-ink-faint)",
  fontSize: 11,
  fontFamily: "var(--font-sans)",
} as const;

export const GRID_STROKE = "var(--viz-grid)";
export const AXIS_LINE = { stroke: "var(--viz-grid)" } as const;

/** Fixed slot order — never cycled, never reassigned by rank. */
export const SERIES = ["var(--viz-1)", "var(--viz-2)", "var(--viz-3)", "var(--viz-4)"];

export const TIER_MARKS: Record<string, string> = {
  excellent: "var(--mark-excellent)",
  good: "var(--mark-good)",
  average: "var(--mark-average)",
  poor: "var(--mark-poor)",
};

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

export function ChartTooltip({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle?: string;
  rows: TooltipRow[];
}) {
  return (
    <div
      className="pointer-events-none min-w-[9.5rem] rounded-xl border border-[var(--color-hairline-strong)] px-3 py-2.5 shadow-2xl backdrop-blur-xl"
      style={{
        background: "color-mix(in oklab, var(--color-canvas) 93%, white 7%)",
      }}
    >
      <p className="text-[12px] font-semibold tracking-tight text-[var(--color-ink)]">
        {title}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-[11px] text-[var(--color-ink-faint)]">{subtitle}</p>
      )}
      <ul className="mt-1.5 space-y-1">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-4 text-[11.5px]"
          >
            <span className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
              {row.color && (
                <span
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ background: row.color }}
                />
              )}
              {row.label}
            </span>
            <span className="numeric font-semibold text-[var(--color-ink)]">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A legend swatch row. Present whenever a plot carries two or more series. */
export function ChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-muted)]"
        >
          <span
            className="size-2.5 rounded-[3px]"
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/** Toggle between the plot and the underlying numbers. */
export function ChartTableToggle({
  showTable,
  onToggle,
}: {
  showTable: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-lg border border-[var(--color-hairline)] px-2 py-1 text-[11px] font-medium text-[var(--color-ink-faint)] transition-colors hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)]"
    >
      {showTable ? "Show chart" : "Show table"}
    </button>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="max-h-[280px] overflow-auto rounded-xl border border-[var(--color-hairline)]">
      <table className="w-full text-left text-[12px]">
        <thead className="sticky top-0 bg-[color-mix(in_oklab,var(--color-canvas)_92%,transparent)] backdrop-blur">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 font-semibold uppercase tracking-[0.1em] text-[10px] text-[var(--color-ink-faint)]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-[var(--color-hairline)] text-[var(--color-ink-muted)]"
            >
              {row.map((cell, j) => (
                <td key={j} className={cn("px-3 py-1.5", j > 0 && "numeric")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Empty state used by every chart before there is enough history. */
export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="grid h-full min-h-[180px] place-items-center px-6 text-center">
      <p className="max-w-xs text-[13px] leading-relaxed text-[var(--color-ink-faint)]">
        {message}
      </p>
    </div>
  );
}
