"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_LINE,
  AXIS_TICK,
  ChartEmpty,
  ChartTooltip,
  GRID_STROKE,
  SERIES,
} from "./chart-chrome";

interface WeekdayStat {
  weekday: string;
  averageScore: number;
  days: number;
}

/** Which weekdays you are strongest and weakest on. */
export function WeekdayChart({ data }: { data: WeekdayStat[] }) {
  if (data.every((d) => d.days === 0)) {
    return <ChartEmpty message="Weekday patterns emerge after a week of logging." />;
  }

  const best = Math.max(...data.map((d) => d.averageScore));

  return (
    <div style={{ height: 210 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="weekday"
            tick={AXIS_TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            cursor={{ fill: "var(--tint-2)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as WeekdayStat;
              return (
                <ChartTooltip
                  title={p.weekday}
                  subtitle={`${p.days} ${p.days === 1 ? "day" : "days"} logged`}
                  rows={[
                    { label: "Avg score", value: String(p.averageScore), color: SERIES[0] },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="averageScore" radius={[4, 4, 0, 0]} maxBarSize={38}>
            {data.map((entry) => (
              <Cell
                key={entry.weekday}
                fill={SERIES[0]}
                /* Emphasis, not a value ramp: the single best day is solid,
                   the rest recede so the outlier reads instantly. */
                fillOpacity={
                  entry.days === 0 ? 0.15 : entry.averageScore === best ? 1 : 0.55
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
