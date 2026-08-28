import {
  getAllSummaries,
  getDay,
  recordAchievementUnlocks,
  summarize,
} from "./db/day-service";
import { computeDayScore, type DayScore } from "./scoring";
import { computeStreaks } from "./streak";
import { levelFromXp, type LevelState } from "./level";
import { evaluateAchievements } from "./achievements";
import { motivationFor, type Motivation } from "./quotes";
import { coreSubjectFor, type CoreSubjectPlan } from "./core-subjects";
import { buildDailyTrend, type TrendPoint } from "./analytics";
import { todayKey, type DayKey } from "./date";
import type { AchievementState, DayLog, DaySummary, StreakState } from "@/types";

export interface OverviewPayload {
  date: DayKey;
  day: DayLog;
  score: DayScore;
  corePlan: CoreSubjectPlan;
  streaks: StreakState;
  level: LevelState;
  achievements: AchievementState[];
  motivation: Motivation;
  recentTrend: TrendPoint[];
  lifetime: {
    totalXp: number;
    daysLogged: number;
    averageScore: number;
    unlockedBadges: number;
    totalBadges: number;
  };
  /** Yesterday, shown read-only — it never rolls forward into today. */
  yesterday: DaySummary | null;
}

/**
 * Assembles everything the dashboard needs in one pass so the page renders
 * from a single round-trip instead of a fetch waterfall.
 */
export async function buildOverview(
  date: DayKey = todayKey(),
): Promise<OverviewPayload> {
  const [day, allSummaries] = await Promise.all([
    getDay(date),
    getAllSummaries(),
  ]);

  // The requested day may not be persisted yet; splice its live state in so
  // streaks and XP reflect the checkbox the user just ticked.
  const todaySummary = summarize(day, day.completedCount > 0);
  const summaries = [
    ...allSummaries.filter((s) => s.date !== date),
    todaySummary,
  ].sort((a, b) => a.date.localeCompare(b.date));

  const score = computeDayScore({
    completedTaskIds: day.tasks.filter((t) => t.completed).map((t) => t.taskId),
    coreSubjectCompleted: day.coreSubject.completed,
  });

  const streaks = computeStreaks(summaries, date);
  const totalXp = summaries.reduce((sum, s) => sum + s.xpEarned, 0);
  const level = levelFromXp(totalXp);

  const evaluated = evaluateAchievements({
    summaries,
    streaks,
    totalXp,
    level: level.level,
  });

  const unlockDates = await recordAchievementUnlocks(
    evaluated.filter((a) => a.unlocked).map((a) => a.id),
  );

  const achievements = evaluated.map((a) => ({
    ...a,
    unlockedOn: a.unlocked ? (unlockDates[a.id] ?? null) : null,
  }));

  const logged = summaries.filter((s) => s.hasLog);
  const yesterdayKey = summaries.filter((s) => s.date < date).pop()?.date;

  return {
    date,
    day,
    score,
    corePlan: coreSubjectFor(date),
    streaks,
    level,
    achievements,
    motivation: motivationFor(date),
    recentTrend: buildDailyTrend(summaries, 14, date),
    lifetime: {
      totalXp,
      daysLogged: logged.length,
      averageScore: logged.length
        ? Math.round(logged.reduce((s, d) => s + d.score, 0) / logged.length)
        : 0,
      unlockedBadges: achievements.filter((a) => a.unlocked).length,
      totalBadges: achievements.length,
    },
    yesterday: yesterdayKey
      ? (summaries.find((s) => s.date === yesterdayKey) ?? null)
      : null,
  };
}
