import {
  CORE_SUBJECT_WEIGHT,
  CORE_SUBJECT_XP,
  TASKS,
  TOTAL_TRACKED_ITEMS,
  getTask,
} from "./tasks";

export type PerformanceTier = "excellent" | "good" | "average" | "poor";

export interface PerformanceLabel {
  tier: PerformanceTier;
  label: string;
  /** CSS colour token, shared by the calendar heatmap and score cards. */
  color: string;
}

export const PERFORMANCE_TIERS: Record<PerformanceTier, PerformanceLabel> = {
  excellent: { tier: "excellent", label: "Excellent", color: "var(--tier-excellent)" },
  good: { tier: "good", label: "Good", color: "var(--tier-good)" },
  average: { tier: "average", label: "Average", color: "var(--tier-average)" },
  poor: { tier: "poor", label: "Needs Improvement", color: "var(--tier-poor)" },
};

/** The score a day must reach to extend the streak. */
export const STREAK_THRESHOLD = 70;

export function performanceFor(score: number): PerformanceLabel {
  if (score >= 90) return PERFORMANCE_TIERS.excellent;
  if (score >= 75) return PERFORMANCE_TIERS.good;
  if (score >= 60) return PERFORMANCE_TIERS.average;
  return PERFORMANCE_TIERS.poor;
}

export interface ScoreInput {
  /** Ids of completed daily tasks. */
  completedTaskIds: string[];
  coreSubjectCompleted: boolean;
}

export interface ScoreBreakdownRow {
  id: string;
  name: string;
  weight: number;
  earned: number;
  completed: boolean;
}

export interface DayScore {
  score: number;
  xp: number;
  completedCount: number;
  remainingCount: number;
  totalCount: number;
  completionPercent: number;
  performance: PerformanceLabel;
  breakdown: ScoreBreakdownRow[];
  hitsStreak: boolean;
}

/**
 * Score is weighted, completion percentage is not — a day can be 75% done by
 * count yet score poorly if the heavyweight items (DSA, internship) were skipped.
 * That asymmetry is deliberate: it rewards prioritising what actually matters.
 */
export function computeDayScore(input: ScoreInput): DayScore {
  const done = new Set(input.completedTaskIds.filter((id) => getTask(id)));

  const breakdown: ScoreBreakdownRow[] = TASKS.map((task) => {
    const completed = done.has(task.id);
    return {
      id: task.id,
      name: task.name,
      weight: task.weight,
      earned: completed ? task.weight : 0,
      completed,
    };
  });

  breakdown.push({
    id: "core-subject",
    name: "Core Subject",
    weight: CORE_SUBJECT_WEIGHT,
    earned: input.coreSubjectCompleted ? CORE_SUBJECT_WEIGHT : 0,
    completed: input.coreSubjectCompleted,
  });

  const score = breakdown.reduce((sum, row) => sum + row.earned, 0);

  const xp =
    TASKS.reduce((sum, task) => sum + (done.has(task.id) ? task.xp : 0), 0) +
    (input.coreSubjectCompleted ? CORE_SUBJECT_XP : 0);

  const completedCount = done.size + (input.coreSubjectCompleted ? 1 : 0);

  return {
    score,
    xp,
    completedCount,
    remainingCount: TOTAL_TRACKED_ITEMS - completedCount,
    totalCount: TOTAL_TRACKED_ITEMS,
    completionPercent: Math.round((completedCount / TOTAL_TRACKED_ITEMS) * 100),
    performance: performanceFor(score),
    breakdown,
    hitsStreak: score >= STREAK_THRESHOLD,
  };
}
