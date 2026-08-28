import type { AccentToken } from "./tasks";
import { weekdayOf, type DayKey } from "./date";

/**
 * The rotating core-subject slot. Some weekdays carry two topics
 * (revision days); they share the single one-hour target and are
 * completed together.
 */
export interface CoreSubjectPlan {
  /** Stable key persisted alongside the day log. */
  key: string;
  label: string;
  topics: string[];
  target: string;
  targetValue: number;
  accent: AccentToken;
  icon: string;
  description: string;
}

const ROTATION: Record<number, CoreSubjectPlan> = {
  1: {
    key: "cn",
    label: "Computer Networks",
    topics: ["Computer Networks (CN)"],
    target: "1 hour",
    targetValue: 60,
    accent: "cyan",
    icon: "Network",
    description: "OSI, TCP/IP, routing, congestion control.",
  },
  2: {
    key: "oops",
    label: "OOPS",
    topics: ["Object Oriented Programming"],
    target: "1 hour",
    targetValue: 60,
    accent: "violet",
    icon: "Boxes",
    description: "Abstraction, inheritance, polymorphism, SOLID.",
  },
  3: {
    key: "os",
    label: "Operating Systems",
    topics: ["Operating Systems (OS)"],
    target: "1 hour",
    targetValue: 60,
    accent: "emerald",
    icon: "Cpu",
    description: "Processes, scheduling, memory, deadlocks.",
  },
  4: {
    key: "dbms",
    label: "DBMS",
    topics: ["Database Management Systems"],
    target: "1 hour",
    targetValue: 60,
    accent: "sky",
    icon: "Database",
    description: "Normalisation, indexing, transactions, ACID.",
  },
  5: {
    key: "cn-oops-revision",
    label: "CN + OOPS Revision",
    topics: ["CN Revision", "OOPS Revision"],
    target: "1 hour",
    targetValue: 60,
    accent: "amber",
    icon: "RefreshCw",
    description: "Consolidate Monday and Tuesday.",
  },
  6: {
    key: "os-dbms-revision",
    label: "OS + DBMS Revision",
    topics: ["OS Revision", "DBMS Revision"],
    target: "1 hour",
    targetValue: 60,
    accent: "orange",
    icon: "RefreshCw",
    description: "Consolidate Wednesday and Thursday.",
  },
  0: {
    key: "weekly-review",
    label: "Weekly Review",
    topics: ["Weekly Review"],
    target: "1 hour",
    targetValue: 60,
    accent: "fuchsia",
    icon: "ClipboardCheck",
    description: "Audit the week. Decide what changes.",
  },
};

export function coreSubjectFor(day: DayKey): CoreSubjectPlan {
  return ROTATION[weekdayOf(day)];
}

export function coreSubjectByKey(key: string): CoreSubjectPlan | undefined {
  return Object.values(ROTATION).find((plan) => plan.key === key);
}

export const ALL_CORE_SUBJECTS = Object.values(ROTATION);

/** Weekday index → plan, for the rotation table in the UI. */
export const CORE_ROTATION = ROTATION;
