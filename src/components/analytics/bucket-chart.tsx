"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  ChartTableToggle,
  ChartTooltip,
  DataTable,
  GRID_STROKE,
  SERIES,
} from "./chart-chrome";
import type { BucketPoint } from "@/lib/analytics";
import { STREAK_THRESHOLD } from "@/lib/scoring";
import { formatNumber } from "@/lib/utils";

/**
 * Average score per week or month. One series, one colour — the bar length
 * already encodes magnitude, so hue stays free. Empty buckets are dimmed
 * rather than recoloured.
 */
export function BucketChart({
  data,
  unitLabel,
  height = 240,
}: {
  data: BucketPoint[];
  unitLabel: string;
  height?: number;
}) {
  const [showTable, setShowTable] = React.useState(false);
  const populated = data.filter((d) => d.daysLogged > 0);

  if (populated.length === 0) {
    return (
      <ChartEmpty
        message={`Not enough history yet — ${unitLabel} averages appear once you have logged days.`}
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-[var(--color-ink-faint)]">
          Average of logged days per {unitLabel}.
        </p>
        <ChartTableToggle
          showTable={showTable}
          onToggle={() => setShowTable((v) => !v)}
        />
      </div>

      {showTable ? (
        <DataTable
          columns={["Period", "Avg score", "Best", "Days logged", "Qualifying", "XP"]}
          rows={data.map((d) => [
            d.label,
            d.averageScore,
            d.bestScore,
            d.daysLogged,
            d.qualifyingDays,
            d.totalXp,
          ])}
        />
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke={GRID_STROKE} strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={AXIS_TICK}
                axisLine={AXIS_LINE}
                tickLine={false}
                minTickGap={8}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <ReferenceLine
                y={STREAK_THRESHOLD}
                stroke="var(--color-ink-faint)"
                strokeOpacity={0.55}
                strokeWidth={1}
              />
              <Tooltip
                cursor={{ fill: "var(--tint-2)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as BucketPoint;
                  return (
                    <ChartTooltip
                      title={point.label}
                      subtitle={`${point.daysLogged} ${point.daysLogged === 1 ? "day" : "days"} logged`}
                      rows={[
                        { label: "Avg score", value: String(point.averageScore), color: SERIES[0] },
                        { label: "Best day", value: String(point.bestScore) },
                        { label: "Streak days", value: String(point.qualifyingDays) },
                        { label: "XP earned", value: formatNumber(point.totalXp) },
                      ]}
                    />
                  );
                }}
              />
              <Bar dataKey="averageScore" radius={[4, 4, 0, 0]} maxBarSize={34}>
                {data.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={SERIES[0]}
                    fillOpacity={entry.daysLogged > 0 ? 1 : 0.18}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
