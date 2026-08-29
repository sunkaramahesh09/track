/**
 * The fixed daily task catalogue.
 *
 * This is the single source of truth for the app: scoring weights, XP awards,
 * ordering and presentation all derive from here, so adding or retuning a task
 * is a one-line change that ripples correctly through scores, XP and analytics.
 */

export type TaskCategory =
  | "placement"
  | "skills"
  | "career"
  | "wellbeing"
  | "communication";

export interface TaskDefinition {
  /** Stable identifier persisted in the database — never rename. */
  id: string;
  name: string;
  /** Human-readable target, e.g. "3 hours". */
  target: string;
  /** Numeric target used for the per-task progress indicator. */
  targetValue: number;
  /** Unit for `targetValue`. */
  unit: "minutes" | "questions";
  category: TaskCategory;
  /** Contribution to the daily score out of 100. */
  weight: number;
  /** XP awarded on completion. */
  xp: number;
  /** Lucide icon name, resolved in the UI. */
  icon: string;
  /** Tailwind-friendly accent token (see globals.css). */
  accent: AccentToken;
  blurb: string;
}

export type AccentToken =
  | "violet"
  | "cyan"
  | "emerald"
  | "amber"
  | "rose"
  | "sky"
  | "fuchsia"
  | "lime"
  | "orange";

export const TASKS: readonly TaskDefinition[] = [
  {
    id: "dsa",
    name: "DSA",
    target: "3 hours",
    targetValue: 180,
    unit: "minutes",
    category: "placement",
    weight: 22,
    xp: 30,
    icon: "Binary",
    accent: "violet",
    blurb: "Patterns, problems, repetition.",
  },
  {
    id: "internship",
    name: "Internship Work",
    target: "2 hours",
    targetValue: 120,
    unit: "minutes",
    category: "career",
    weight: 13,
    xp: 20,
    icon: "Briefcase",
    accent: "cyan",
    blurb: "Real code, real deadlines.",
  },
  {
    id: "aptitude",
    name: "Aptitude",
    target: "45 minutes",
    targetValue: 45,
    unit: "minutes",
    category: "placement",
    weight: 9,
    xp: 12,
    icon: "Calculator",
    accent: "lime",
    blurb: "Quant, reasoning, and speed under a clock.",
  },
  {
    id: "english",
    name: "English Speaking",
    target: "1 hour",
    targetValue: 60,
    unit: "minutes",
    category: "communication",
    weight: 9,
    xp: 15,
    icon: "Mic",
    accent: "fuchsia",
    blurb: "Speak out loud, every day.",
  },
  {
    id: "sql",
    name: "SQL Practice",
    target: "2 questions",
    targetValue: 2,
    unit: "questions",
    category: "skills",
    weight: 9,
    xp: 12,
    icon: "Database",
    accent: "sky",
    blurb: "Joins, windows, aggregates.",
  },
  {
    id: "workout",
    name: "Workout",
    target: "45 minutes",
    targetValue: 45,
    unit: "minutes",
    category: "wellbeing",
    weight: 9,
    xp: 10,
    icon: "Dumbbell",
    accent: "emerald",
    blurb: "A sharp body carries a sharp mind.",
  },
  {
    id: "resume",
    name: "Resume Preparation",
    target: "1 hour",
    targetValue: 60,
    unit: "minutes",
    category: "career",
    weight: 9,
    xp: 12,
    icon: "FileText",
    accent: "orange",
    blurb: "Sharpen the first impression.",
  },
  {
    id: "interview",
    name: "Interview Questions",
    target: "30 minutes",
    targetValue: 30,
    unit: "minutes",
    category: "placement",
    weight: 5,
    xp: 8,
    icon: "MessagesSquare",
    accent: "amber",
    blurb: "Rehearse the answers you'll need.",
  },
  {
    id: "reading",
    name: "Book Reading",
    target: "30 minutes",
    targetValue: 30,
    unit: "minutes",
    category: "wellbeing",
    weight: 5,
    xp: 8,
    icon: "BookOpen",
    accent: "rose",
    blurb: "Compound your thinking.",
  },
] as const;

/** Weight reserved for the rotating core subject. */
export const CORE_SUBJECT_WEIGHT = 10;
export const CORE_SUBJECT_XP = 15;

export const TASK_IDS = TASKS.map((t) => t.id);

const TASK_MAP = new Map(TASKS.map((t) => [t.id, t]));

export function getTask(id: string): TaskDefinition | undefined {
  return TASK_MAP.get(id);
}

/** Total weight across daily tasks + the core subject. Should equal 100. */
export const TOTAL_WEIGHT =
  TASKS.reduce((sum, t) => sum + t.weight, 0) + CORE_SUBJECT_WEIGHT;

/** Daily tasks + the core subject slot. */
export const TOTAL_TRACKED_ITEMS = TASKS.length + 1;

export const MAX_DAILY_XP =
  TASKS.reduce((sum, t) => sum + t.xp, 0) + CORE_SUBJECT_XP;

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  placement: "Placement",
  skills: "Skills",
  career: "Career",
  wellbeing: "Wellbeing",
  communication: "Communication",
};
