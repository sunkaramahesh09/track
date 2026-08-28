import type { Metadata } from "next";
import { getAllSummaries } from "@/lib/db/day-service";
import { buildAnalytics } from "@/lib/analytics";
import { computeStreaks } from "@/lib/streak";
import { todayKey } from "@/lib/date";
import { PageHeader } from "@/components/layout/page-header";
import { DatabaseError } from "@/components/layout/database-error";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export const metadata: Metadata = { title: "Analytics" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  let payload;
  try {
    const summaries = await getAllSummaries();
    payload = {
      ...buildAnalytics(summaries, { dailyDays: 30 }),
      streaks: computeStreaks(summaries, todayKey()),
    };
  } catch (error) {
    return <DatabaseError message={(error as Error).message} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Performance"
        icon="ChartSpline"
        title="Analytics"
        description="Where the effort actually goes, which weeks held up, and which habits are quietly slipping."
      />
      <AnalyticsView payload={payload} />
    </>
  );
}
