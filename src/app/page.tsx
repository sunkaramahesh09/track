import { buildOverview } from "@/lib/overview";
import { todayKey } from "@/lib/date";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { TodayProgress } from "@/components/dashboard/today-progress";
import { ScoreCard } from "@/components/dashboard/score-card";
import { StreakCards } from "@/components/dashboard/streak-cards";
import { LevelCard } from "@/components/dashboard/level-card";
import { TaskList } from "@/components/dashboard/task-list";
import { CoreSubjectCard } from "@/components/dashboard/core-subject-card";
import { MotivationCard } from "@/components/dashboard/motivation-card";
import { QuickNotes } from "@/components/dashboard/quick-notes";
import { YesterdayCard } from "@/components/dashboard/yesterday-card";
import { MomentumCard } from "@/components/dashboard/momentum-card";
import { CelebrationToast } from "@/components/dashboard/celebration-toast";
import { PageHeader } from "@/components/layout/page-header";
import { DatabaseError } from "@/components/layout/database-error";
import { formatDayLong } from "@/lib/date";
import { TASKS } from "@/lib/tasks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const date = todayKey();

  let overview;
  try {
    overview = await buildOverview(date);
  } catch (error) {
    return <DatabaseError message={(error as Error).message} />;
  }

  return (
    <DashboardProvider initialOverview={overview}>
      <PageHeader
        eyebrow={formatDayLong(date)}
        icon="Sun"
        title="Today's board"
        description={`${TASKS.length} fixed tasks and one rotating core subject. Nothing rolls over — every morning is a clean slate, and that is exactly what makes the streak mean something.`}
      />

      <div className="space-y-4">
        {/* Hero row — progress ring and the weighted score. */}
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <TodayProgress />
          </div>
          <div className="lg:col-span-4">
            <ScoreCard />
          </div>
        </div>

        {/* Momentum row. */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StreakCards />
          </div>
          <LevelCard />
        </div>

        {/* Working area. */}
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <TaskList />
            <QuickNotes />
          </div>
          <div className="space-y-4 lg:col-span-5">
            <CoreSubjectCard />
            <MotivationCard />
            <MomentumCard />
            <YesterdayCard />
          </div>
        </div>
      </div>

      <CelebrationToast />
    </DashboardProvider>
  );
}
