"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ScoreTrendChart } from "@/components/analytics/score-trend-chart";
import { useDashboard } from "./dashboard-provider";

export function MomentumCard() {
  const { overview } = useDashboard();
  const { recentTrend, lifetime } = overview;

  const logged = recentTrend.filter((p) => p.logged);
  const recent = logged.slice(-7);
  const prior = logged.slice(-14, -7);
  const avg = (arr: typeof logged) =>
    arr.length ? Math.round(arr.reduce((s, p) => s + p.score, 0) / arr.length) : 0;
  const delta = avg(recent) - avg(prior);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>14-Day Momentum</CardTitle>
          <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
            Lifetime average {lifetime.averageScore} over {lifetime.daysLogged}{" "}
            {lifetime.daysLogged === 1 ? "day" : "days"}.
          </p>
        </div>
        {prior.length > 0 && (
          <Badge variant={delta >= 0 ? "success" : "danger"}>
            <Icon name={delta >= 0 ? "TrendingUp" : "TrendingDown"} />
            {delta >= 0 ? "+" : ""}
            {delta} vs last week
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <ScoreTrendChart data={recentTrend} height={180} />
      </CardContent>
    </Card>
  );
}
