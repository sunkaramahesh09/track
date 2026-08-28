import type { Metadata } from "next";
import { buildOverview } from "@/lib/overview";
import { todayKey } from "@/lib/date";
import { PageHeader } from "@/components/layout/page-header";
import { DatabaseError } from "@/components/layout/database-error";
import { AchievementsView } from "@/components/achievements/achievements-view";

export const metadata: Metadata = { title: "Achievements" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  let overview;
  try {
    overview = await buildOverview(todayKey());
  } catch (error) {
    return <DatabaseError message={(error as Error).message} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Progression"
        icon="Medal"
        title="Level & achievements"
        description="XP accrues from what you finish, not what you plan. Levels run from 1 to 100 — badges mark the milestones worth remembering."
      />
      <AchievementsView
        level={overview.level}
        achievements={overview.achievements}
        streaks={overview.streaks}
        todayXp={overview.day.xpEarned}
      />
    </>
  );
}
