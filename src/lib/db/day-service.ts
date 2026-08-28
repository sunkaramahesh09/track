import { connectToDatabase } from "./mongoose";
import { DayLogModel, type DayLogDocument } from "./models/DayLog";
import { ProfileModel, SINGLE_USER_KEY } from "./models/Profile";
import { coreSubjectFor } from "../core-subjects";
import { computeDayScore, performanceFor } from "../scoring";
import { TASKS, TOTAL_TRACKED_ITEMS, getTask } from "../tasks";
import { addDays, todayKey, type DayKey } from "../date";
import type { DayLog, DaySummary, TaskEntry } from "@/types";

/** A day the user has never touched, rendered as a fresh empty slate. */
export function blankDay(date: DayKey): DayLog {
  const core = coreSubjectFor(date);
  return {
    date,
    tasks: TASKS.map((task) => ({
      taskId: task.id,
      completed: false,
      completedAt: null,
      value: 0,
    })),
    coreSubject: {
      key: core.key,
      label: core.label,
      topics: core.topics,
      completed: false,
      completedAt: null,
      value: 0,
    },
    notes: {
      wentWell: "",
      needsImprovement: "",
      tomorrowFocus: "",
      updatedAt: null,
    },
    score: 0,
    xpEarned: 0,
    completedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

type LeanDayLog = DayLogDocument & { createdAt?: Date; updatedAt?: Date };

/**
 * Normalise a stored document against the current task catalogue: tasks added
 * to `TASKS` after a day was written simply appear as incomplete rather than
 * breaking the read.
 */
function serialize(doc: LeanDayLog): DayLog {
  const stored = new Map(
    (doc.tasks ?? []).map((t) => [t.taskId, t] as const),
  );

  const tasks: TaskEntry[] = TASKS.map((task) => {
    const entry = stored.get(task.id);
    return {
      taskId: task.id,
      completed: Boolean(entry?.completed),
      completedAt: entry?.completedAt ? entry.completedAt.toISOString() : null,
      value: entry?.value ?? 0,
    };
  });

  const core = doc.coreSubject ?? coreSubjectFor(doc.date);

  return {
    date: doc.date,
    tasks,
    coreSubject: {
      key: core.key,
      label: core.label,
      topics: core.topics ?? [],
      completed: Boolean(core.completed),
      completedAt: core.completedAt ? core.completedAt.toISOString() : null,
      value: core.value ?? 0,
    },
    notes: {
      wentWell: doc.notes?.wentWell ?? "",
      needsImprovement: doc.notes?.needsImprovement ?? "",
      tomorrowFocus: doc.notes?.tomorrowFocus ?? "",
      updatedAt: doc.notes?.updatedAt
        ? doc.notes.updatedAt.toISOString()
        : null,
    },
    score: doc.score ?? 0,
    xpEarned: doc.xpEarned ?? 0,
    completedCount: doc.completedCount ?? 0,
    createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

export function summarize(log: DayLog, hasLog = true): DaySummary {
  return {
    date: log.date,
    score: log.score,
    xpEarned: log.xpEarned,
    completedCount: log.completedCount,
    totalCount: TOTAL_TRACKED_ITEMS,
    tier: performanceFor(log.score).tier,
    completedTaskIds: log.tasks.filter((t) => t.completed).map((t) => t.taskId),
    coreSubjectKey: log.coreSubject.key,
    coreSubjectCompleted: log.coreSubject.completed,
    hasLog,
  };
}

/** Read a single day. Never writes — untouched days stay absent from history. */
export async function getDay(date: DayKey): Promise<DayLog> {
  await connectToDatabase();
  const doc = await DayLogModel.findOne({ date }).lean<LeanDayLog>().exec();
  return doc ? serialize(doc) : blankDay(date);
}

/**
 * Recompute the denormalised score/XP/count fields from the task state.
 * Called on every mutation so stored aggregates can never drift.
 */
function applyDerivedFields(log: DayLog): DayLog {
  const result = computeDayScore({
    completedTaskIds: log.tasks.filter((t) => t.completed).map((t) => t.taskId),
    coreSubjectCompleted: log.coreSubject.completed,
  });
  return {
    ...log,
    score: result.score,
    xpEarned: result.xp,
    completedCount: result.completedCount,
  };
}

export interface DayMutation {
  /** Toggle or set a daily task. */
  task?: { taskId: string; completed: boolean; value?: number };
  coreSubject?: { completed: boolean; value?: number };
  notes?: Partial<Pick<DayLog["notes"], "wentWell" | "needsImprovement" | "tomorrowFocus">>;
}

export async function mutateDay(
  date: DayKey,
  mutation: DayMutation,
): Promise<DayLog> {
  await connectToDatabase();

  const existing = await DayLogModel.findOne({ date }).lean<LeanDayLog>().exec();
  const current = existing ? serialize(existing) : blankDay(date);
  const now = new Date();

  let next: DayLog = { ...current };

  if (mutation.task) {
    const definition = getTask(mutation.task.taskId);
    if (!definition) throw new Error(`Unknown task: ${mutation.task.taskId}`);
    const { taskId, completed } = mutation.task;

    next.tasks = next.tasks.map((entry) =>
      entry.taskId !== taskId
        ? entry
        : {
            ...entry,
            completed,
            // Preserve the original timestamp when re-checking within the same
            // session; only stamp when transitioning into a completed state.
            completedAt: completed
              ? (entry.completed && entry.completedAt
                  ? entry.completedAt
                  : now.toISOString())
              : null,
            value:
              mutation.task?.value ??
              (completed ? definition.targetValue : 0),
          },
    );
  }

  if (mutation.coreSubject) {
    const plan = coreSubjectFor(date);
    const { completed } = mutation.coreSubject;
    next.coreSubject = {
      ...next.coreSubject,
      key: plan.key,
      label: plan.label,
      topics: plan.topics,
      completed,
      completedAt: completed
        ? (next.coreSubject.completed && next.coreSubject.completedAt
            ? next.coreSubject.completedAt
            : now.toISOString())
        : null,
      value: mutation.coreSubject.value ?? (completed ? plan.targetValue : 0),
    };
  }

  if (mutation.notes) {
    next.notes = {
      ...next.notes,
      ...mutation.notes,
      updatedAt: now.toISOString(),
    };
  }

  next = applyDerivedFields(next);

  const saved = await DayLogModel.findOneAndUpdate(
    { date },
    {
      $set: {
        date,
        tasks: next.tasks.map((t) => ({
          taskId: t.taskId,
          completed: t.completed,
          completedAt: t.completedAt ? new Date(t.completedAt) : null,
          value: t.value,
        })),
        coreSubject: {
          ...next.coreSubject,
          completedAt: next.coreSubject.completedAt
            ? new Date(next.coreSubject.completedAt)
            : null,
        },
        notes: {
          ...next.notes,
          updatedAt: next.notes.updatedAt ? new Date(next.notes.updatedAt) : null,
        },
        score: next.score,
        xpEarned: next.xpEarned,
        completedCount: next.completedCount,
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  )
    .lean<LeanDayLog>()
    .exec();

  return serialize(saved);
}

/** All logged days between two keys, oldest first. */
export async function getSummaries(
  from: DayKey,
  to: DayKey,
): Promise<DaySummary[]> {
  await connectToDatabase();
  const docs = await DayLogModel.find({ date: { $gte: from, $lte: to } })
    .sort({ date: 1 })
    .lean<LeanDayLog[]>()
    .exec();
  return docs.map((doc) => summarize(serialize(doc)));
}

/** Every logged day, oldest first. Bounded by the app's own history. */
export async function getAllSummaries(): Promise<DaySummary[]> {
  await connectToDatabase();
  const docs = await DayLogModel.find({})
    .sort({ date: 1 })
    .lean<LeanDayLog[]>()
    .exec();
  return docs.map((doc) => summarize(serialize(doc)));
}

export async function getProfile() {
  await connectToDatabase();
  const profile = await ProfileModel.findOneAndUpdate(
    { key: SINGLE_USER_KEY },
    { $setOnInsert: { key: SINGLE_USER_KEY, startedOn: todayKey() } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).exec();
  return profile;
}

/**
 * Persist the first date a badge was earned so the badge wall can show
 * "unlocked on" even after the underlying streak has since been broken.
 */
export async function recordAchievementUnlocks(ids: string[]) {
  if (ids.length === 0) return {};
  await connectToDatabase();
  const profile = await getProfile();
  const unlocks = profile.achievementUnlocks ?? new Map<string, string>();
  let changed = false;
  const today = todayKey();

  for (const id of ids) {
    if (!unlocks.get(id)) {
      unlocks.set(id, today);
      changed = true;
    }
  }

  if (changed) {
    profile.achievementUnlocks = unlocks;
    await profile.save();
  }

  return Object.fromEntries(unlocks.entries()) as Record<string, string>;
}

/** Rolling window used by the contribution calendar. */
export function contributionWindow(days = 364, end: DayKey = todayKey()) {
  return { from: addDays(end, -days), to: end };
}
