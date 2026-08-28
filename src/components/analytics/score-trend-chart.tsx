"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_LINE,
  AXIS_TICK,
  ChartEmpty,
  ChartLegend,
  ChartTableToggle,
  ChartTooltip,
  DataTable,
  GRID_STROKE,
  SERIES,
} from "./chart-chrome";
import type { TrendPoint } from "@/lib/analytics";
import { STREAK_THRESHOLD } from "@/lib/scoring";

interface Props {
  data: TrendPoint[];
  /** Overlay completion percentage alongside the score. */
  showCompletion?: boolean;
  height?: number;
}

/**
 * Score over time. Score and completion share a single 0–100 axis — they are
 * the same unit, so no second scale is invented.
 */
export function ScoreTrendChart({ data, showCompletion = false, height = 260 }: Props) {
  const [showTable, setShowTable] = React.useState(false);
  const gradientId = React.useId();

  if (data.length === 0) {
    return <ChartEmpty message="No days recorded yet. Tick your first task to start the trend." />;
  }

  const legend = [
    { label: "Daily score", color: SERIES[0] },
    ...(showCompletion ? [{ label: "Completion %", color: SERIES[1] }] : []),
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        {showCompletion ? (
          <ChartLegend items={legend} />
        ) : (
          <p className="text-[11.5px] text-[var(--color-ink-faint)]">
            The hairline marks the streak threshold ({STREAK_THRESHOLD}).
          </p>
        )}
        <ChartTableToggle
          showTable={showTable}
          onToggle={() => setShowTable((v) => !v)}
        />
      </div>

      {showTable ? (
        <DataTable
          columns={
            showCompletion
              ? ["Date", "Score", "Completion", "XP"]
              : ["Date", "Score", "XP"]
          }
          rows={data.map((d) =>
            showCompletion
              ? [d.label, d.score, `${d.completion}%`, d.xp]
              : [d.label, d.score, d.xp],
          )}
        />
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.42} />
                  <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke={GRID_STROKE}
                strokeDasharray="0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={AXIS_TICK}
                axisLine={AXIS_LINE}
                tickLine={false}
                minTickGap={22}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                width={44}
              />

              {/* Solid hairline: the streak threshold, not a projection. */}
              <ReferenceLine
                y={STREAK_THRESHOLD}
                stroke="var(--color-ink-faint)"
                strokeOpacity={0.55}
                strokeWidth={1}
              />

              <Tooltip
                cursor={{ stroke: "var(--viz-axis)", strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as TrendPoint;
                  return (
                    <ChartTooltip
                      title={point.label}
                      subtitle={point.logged ? undefined : "No activity logged"}
                      rows={[
                        { label: "Score", value: `${point.score} / 100`, color: SERIES[0] },
                        ...(showCompletion
                          ? [
                              {
                                label: "Completion",
                                value: `${point.completion}%`,
                                color: SERIES[1],
                              },
                            ]
                          : []),
                        { label: "XP", value: String(point.xp) },
                      ]}
                    />
                  );
                }}
              />

              <Area
                type="monotone"
                dataKey="score"
                stroke={SERIES[0]}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--viz-surface)" }}
                dot={false}
              />

              {showCompletion && (
                <Area
                  type="monotone"
                  dataKey="completion"
                  stroke={SERIES[1]}
                  strokeWidth={2}
                  fill="none"
                  activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--viz-surface)" }}
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
