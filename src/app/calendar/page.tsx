import type { Metadata } from "next";
import { contributionWindow, getSummaries } from "@/lib/db/day-service";
import { computeStreaks } from "@/lib/streak";
import { todayKey } from "@/lib/date";
import { PageHeader } from "@/components/layout/page-header";
import { DatabaseError } from "@/components/layout/database-error";
import { CalendarView } from "@/components/calendar/calendar-view";

export const metadata: Metadata = { title: "Calendar" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const today = todayKey();
  const { from, to } = contributionWindow(364, today);

  let summaries;
  try {
    summaries = await getSummaries(from, to);
  } catch (error) {
    return <DatabaseError message={(error as Error).message} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="History"
        icon="CalendarDays"
        title="Consistency calendar"
        description="A year at a glance. Colour is the performance tier, intensity is the score — click any day to see exactly what was and wasn't done."
      />
      <CalendarView
        from={from}
        to={to}
        today={today}
        summaries={summaries}
        streaks={computeStreaks(summaries, today)}
      />
    </>
  );
}
