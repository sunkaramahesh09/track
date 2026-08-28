import type { AchievementState, DaySummary, StreakState } from "@/types";
import { clamp } from "./utils";

interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  tier: AchievementState["tier"];
  goal: number;
  /** Current progress toward `goal`, given the full history. */
  measure: (ctx: AchievementContext) => number;
}

export interface AchievementContext {
  summaries: DaySummary[];
  streaks: StreakState;
  totalXp: number;
  level: number;
}

/** Days on which a given task was completed. */
function daysWithTask(summaries: DaySummary[], taskId: string): DaySummary[] {
  return summaries.filter((s) => s.completedTaskIds.includes(taskId));
}

/** Longest consecutive run of days satisfying a predicate. */
function longestRun(
  summaries: DaySummary[],
  predicate: (s: DaySummary) => boolean,
): number {
  const sorted = [...summaries].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let run = 0;
  let prev: string | null = null;

  for (const s of sorted) {
    const isConsecutive =
      prev !== null &&
      new Date(s.date).getTime() - new Date(prev).getTime() === 86_400_000;
    if (predicate(s)) {
      run = isConsecutive ? run + 1 : 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    prev = s.date;
  }
  return best;
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: "streak-7",
    name: "7 Day Streak",
    description: "Score 70+ for seven days in a row.",
    icon: "Flame",
    accent: "orange",
    tier: "bronze",
    goal: 7,
    measure: (c) => c.streaks.longest,
  },
  {
    id: "streak-30",
    name: "30 Day Streak",
    description: "A full month without breaking the chain.",
    icon: "Flame",
    accent: "rose",
    tier: "gold",
    goal: 30,
    measure: (c) => c.streaks.longest,
  },
  {
    id: "streak-100",
    name: "Century",
    description: "One hundred consecutive qualifying days.",
    icon: "Trophy",
    accent: "amber",
    tier: "platinum",
    goal: 100,
    measure: (c) => c.streaks.longest,
  },
  {
    id: "dsa-warrior",
    name: "DSA Warrior",
    description: "Complete DSA on 30 days.",
    icon: "Binary",
    accent: "violet",
    tier: "gold",
    goal: 30,
    measure: (c) => daysWithTask(c.summaries, "dsa").length,
  },
  {
    id: "english-master",
    name: "English Master",
    description: "Speak English for 25 days.",
    icon: "Mic",
    accent: "fuchsia",
    tier: "silver",
    goal: 25,
    measure: (c) => daysWithTask(c.summaries, "english").length,
  },
  {
    id: "sql-consistency",
    name: "SQL Consistency",
    description: "Practise SQL 14 days in a row.",
    icon: "Database",
    accent: "sky",
    tier: "silver",
    goal: 14,
    measure: (c) =>
      longestRun(c.summaries, (s) => s.completedTaskIds.includes("sql")),
  },
  {
    id: "fitness-discipline",
    name: "Fitness Discipline",
    description: "Work out 21 days in a row.",
    icon: "Dumbbell",
    accent: "emerald",
    tier: "gold",
    goal: 21,
    measure: (c) =>
      longestRun(c.summaries, (s) => s.completedTaskIds.includes("workout")),
  },
  {
    id: "core-scholar",
    name: "Core Scholar",
    description: "Finish the rotating core subject 20 times.",
    icon: "GraduationCap",
    accent: "cyan",
    tier: "silver",
    goal: 20,
    measure: (c) => c.summaries.filter((s) => s.coreSubjectCompleted).length,
  },
  {
    id: "perfect-day",
    name: "Perfect Day",
    description: "Complete every single item in one day.",
    icon: "Sparkles",
    accent: "lime",
    tier: "gold",
    goal: 1,
    measure: (c) => c.summaries.filter((s) => s.score === 100).length,
  },
  {
    id: "flawless-week",
    name: "Flawless Week",
    description: "Seven consecutive days scoring 90 or above.",
    icon: "Star",
    accent: "amber",
    tier: "platinum",
    goal: 7,
    measure: (c) => longestRun(c.summaries, (s) => s.score >= 90),
  },
  {
    id: "shipper",
    name: "Shipper",
    description: "Log internship work on 30 days.",
    icon: "Briefcase",
    accent: "cyan",
    tier: "silver",
    goal: 30,
    measure: (c) => daysWithTask(c.summaries, "internship").length,
  },
  {
    id: "reader",
    name: "Deep Reader",
    description: "Read on 40 days.",
    icon: "BookOpen",
    accent: "rose",
    tier: "silver",
    goal: 40,
    measure: (c) => daysWithTask(c.summaries, "reading").length,
  },
  {
    id: "resume-ready",
    name: "Resume Ready",
    description: "Ten sessions on your resume.",
    icon: "FileText",
    accent: "orange",
    tier: "bronze",
    goal: 10,
    measure: (c) => daysWithTask(c.summaries, "resume").length,
  },
  {
    id: "level-25",
    name: "Level 25",
    description: "Reach level 25.",
    icon: "Zap",
    accent: "violet",
    tier: "gold",
    goal: 25,
    measure: (c) => c.level,
  },
];

/**
 * Achievements are *derived*, never stored as truth — the unlock date is the
 * earliest day at which the criterion was met, recomputed from history so the
 * badge wall is always consistent with the data.
 */
export function evaluateAchievements(
  ctx: AchievementContext,
  unlockDates: Record<string, string> = {},
): AchievementState[] {
  return ACHIEVEMENTS.map((def) => {
    const progress = clamp(def.measure(ctx), 0, def.goal);
    const unlocked = progress >= def.goal;
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      accent: def.accent,
      tier: def.tier,
      unlocked,
      unlockedOn: unlocked ? (unlockDates[def.id] ?? null) : null,
      progress,
      goal: def.goal,
      progressPercent: Math.round((progress / def.goal) * 100),
    };
  });
}
