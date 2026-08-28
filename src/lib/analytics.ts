import {
  addDays,
  formatDayShort,
  formatMonth,
  lastNDays,
  startOfMonth,
  startOfWeek,
  todayKey,
  weekdayOf,
  type DayKey,
} from "./date";
import { TASKS, TOTAL_TRACKED_ITEMS, CORE_SUBJECT_WEIGHT } from "./tasks";
import { performanceFor } from "./scoring";
import { ALL_CORE_SUBJECTS } from "./core-subjects";
import type { DaySummary } from "@/types";

export interface TrendPoint {
  date: DayKey;
  label: string;
  score: number;
  completion: number;
  xp: number;
  logged: boolean;
}

export interface BucketPoint {
  key: string;
  label: string;
  averageScore: number;
  bestScore: number;
  daysLogged: number;
  qualifyingDays: number;
  totalXp: number;
}

export interface TaskStat {
  id: string;
  name: string;
  accent: string;
  icon: string;
  completions: number;
  opportunities: number;
  rate: number;
  weight: number;
  currentRun: number;
}

export interface AnalyticsPayload {
  daily: TrendPoint[];
  weekly: BucketPoint[];
  monthly: BucketPoint[];
  taskStats: TaskStat[];
  coreSubjectStats: {
    key: string;
    label: string;
    completions: number;
    opportunities: number;
    rate: number;
  }[];
  weekdayStats: { weekday: string; averageScore: number; days: number }[];
  tierDistribution: { tier: string; label: string; count: number; color: string }[];
  totals: {
    daysLogged: number;
    averageScore: number;
    bestScore: number;
    totalXp: number;
    qualifyingDays: number;
    consistencyRate: number;
    tasksCompleted: number;
  };
}

function indexByDate(summaries: DaySummary[]) {
  return new Map(summaries.map((s) => [s.date, s] as const));
}

/** Dense daily series — missing days become explicit zeroes, not gaps. */
export function buildDailyTrend(
  summaries: DaySummary[],
  days: number,
  end: DayKey = todayKey(),
): TrendPoint[] {
  const byDate = indexByDate(summaries);
  return lastNDays(days, end).map((date) => {
    const s = byDate.get(date);
    return {
      date,
      label: formatDayShort(date),
      score: s?.score ?? 0,
      completion: s
        ? Math.round((s.completedCount / TOTAL_TRACKED_ITEMS) * 100)
        : 0,
      xp: s?.xpEarned ?? 0,
      logged: Boolean(s),
    };
  });
}

function bucket(
  points: TrendPoint[],
  keyOf: (date: DayKey) => string,
  labelOf: (date: DayKey) => string,
): BucketPoint[] {
  const groups = new Map<string, { label: string; points: TrendPoint[] }>();

  for (const point of points) {
    const key = keyOf(point.date);
    if (!groups.has(key)) groups.set(key, { label: labelOf(point.date), points: [] });
    groups.get(key)!.points.push(point);
  }

  return [...groups.entries()].map(([key, group]) => {
    const logged = group.points.filter((p) => p.logged);
    const total = logged.reduce((sum, p) => sum + p.score, 0);
    return {
      key,
      label: group.label,
      // Average over *logged* days so a partially elapsed week isn't punished.
      averageScore: logged.length ? Math.round(total / logged.length) : 0,
      bestScore: group.points.reduce((max, p) => Math.max(max, p.score), 0),
      daysLogged: logged.length,
      qualifyingDays: group.points.filter((p) => p.score >= 70).length,
      totalXp: group.points.reduce((sum, p) => sum + p.xp, 0),
    };
  });
}

/** Longest trailing run (ending today) in which a predicate held. */
function trailingRun(
  summaries: DaySummary[],
  predicate: (s: DaySummary) => boolean,
  end: DayKey = todayKey(),
): number {
  const byDate = indexByDate(summaries);
  let cursor = end;
  let run = 0;
  // Allow today to be pending without zeroing the run.
  if (!predicate(byDate.get(cursor) ?? ({} as DaySummary))) cursor = addDays(end, -1);
  while (true) {
    const s = byDate.get(cursor);
    if (!s || !predicate(s)) break;
    run += 1;
    cursor = addDays(cursor, -1);
  }
  return run;
}

export function buildAnalytics(
  summaries: DaySummary[],
  options: { dailyDays?: number; end?: DayKey } = {},
): AnalyticsPayload {
  const end = options.end ?? todayKey();
  const dailyDays = options.dailyDays ?? 30;

  const daily = buildDailyTrend(summaries, dailyDays, end);
  const weeklySource = buildDailyTrend(summaries, 84, end); // 12 weeks
  const monthlySource = buildDailyTrend(summaries, 365, end);

  const weekly = bucket(
    weeklySource,
    (d) => startOfWeek(d),
    (d) => `Wk ${formatDayShort(startOfWeek(d))}`,
  ).slice(-12);

  const monthly = bucket(
    monthlySource,
    (d) => startOfMonth(d),
    (d) => formatMonth(d),
  ).slice(-12);

  const logged = summaries.filter((s) => s.hasLog);
  const opportunities = logged.length;

  const taskStats: TaskStat[] = TASKS.map((task) => {
    const completions = logged.filter((s) =>
      s.completedTaskIds.includes(task.id),
    ).length;
    return {
      id: task.id,
      name: task.name,
      accent: task.accent,
      icon: task.icon,
      completions,
      opportunities,
      rate: opportunities ? Math.round((completions / opportunities) * 100) : 0,
      weight: task.weight,
      currentRun: trailingRun(
        summaries,
        (s) => Boolean(s.completedTaskIds?.includes(task.id)),
        end,
      ),
    };
  }).sort((a, b) => b.rate - a.rate);

  const coreSubjectStats = ALL_CORE_SUBJECTS.map((plan) => {
    const relevant = logged.filter((s) => s.coreSubjectKey === plan.key);
    const completions = relevant.filter((s) => s.coreSubjectCompleted).length;
    return {
      key: plan.key,
      label: plan.label,
      completions,
      opportunities: relevant.length,
      rate: relevant.length
        ? Math.round((completions / relevant.length) * 100)
        : 0,
    };
  });

  const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayStats = WEEKDAY_NAMES.map((weekday, index) => {
    const days = logged.filter((s) => weekdayOf(s.date) === index);
    const total = days.reduce((sum, s) => sum + s.score, 0);
    return {
      weekday,
      averageScore: days.length ? Math.round(total / days.length) : 0,
      days: days.length,
    };
  });

  const tiers = ["excellent", "good", "average", "poor"] as const;
  const tierDistribution = tiers.map((tier) => ({
    tier,
    label: performanceFor(
      tier === "excellent" ? 95 : tier === "good" ? 80 : tier === "average" ? 65 : 30,
    ).label,
    count: logged.filter((s) => s.tier === tier).length,
    color: `var(--tier-${tier})`,
  }));

  const totalScore = logged.reduce((sum, s) => sum + s.score, 0);
  const qualifyingDays = logged.filter((s) => s.score >= 70).length;

  return {
    daily,
    weekly,
    monthly,
    taskStats,
    coreSubjectStats,
    weekdayStats,
    tierDistribution,
    totals: {
      daysLogged: logged.length,
      averageScore: logged.length ? Math.round(totalScore / logged.length) : 0,
      bestScore: logged.reduce((max, s) => Math.max(max, s.score), 0),
      totalXp: logged.reduce((sum, s) => sum + s.xpEarned, 0),
      qualifyingDays,
      consistencyRate: logged.length
        ? Math.round((qualifyingDays / logged.length) * 100)
        : 0,
      tasksCompleted: logged.reduce((sum, s) => sum + s.completedCount, 0),
    },
  };
}

export { CORE_SUBJECT_WEIGHT };
