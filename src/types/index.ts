import type { DayKey } from "@/lib/date";
import type { PerformanceTier } from "@/lib/scoring";

export interface TaskEntry {
  taskId: string;
  completed: boolean;
  completedAt: string | null;
  /** Progress toward the task's numeric target (minutes or questions). */
  value: number;
}

export interface CoreSubjectEntry {
  key: string;
  label: string;
  topics: string[];
  completed: boolean;
  completedAt: string | null;
  value: number;
}

export interface DayNotes {
  wentWell: string;
  needsImprovement: string;
  tomorrowFocus: string;
  updatedAt: string | null;
}

/** The full persisted record for a single day. */
export interface DayLog {
  date: DayKey;
  tasks: TaskEntry[];
  coreSubject: CoreSubjectEntry;
  notes: DayNotes;
  score: number;
  xpEarned: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight projection used by analytics, streaks and the calendar. */
export interface DaySummary {
  date: DayKey;
  score: number;
  xpEarned: number;
  completedCount: number;
  totalCount: number;
  tier: PerformanceTier;
  completedTaskIds: string[];
  coreSubjectKey: string;
  coreSubjectCompleted: boolean;
  hasLog: boolean;
}

export interface StreakState {
  current: number;
  longest: number;
  /** Day-keys in the active streak, oldest first. */
  activeRun: DayKey[];
  /** Whether today already qualifies. */
  todayQualifies: boolean;
  /** Historical runs, most recent first. */
  history: { start: DayKey; end: DayKey; length: number }[];
}

export interface AchievementState {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  unlocked: boolean;
  unlockedOn: DayKey | null;
  progress: number;
  goal: number;
  progressPercent: number;
}
