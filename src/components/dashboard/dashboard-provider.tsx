"use client";

import * as React from "react";
import type { OverviewPayload } from "@/lib/overview";
import type { DayMutation } from "@/lib/db/day-service";
import { computeDayScore } from "@/lib/scoring";
import { coreSubjectFor } from "@/lib/core-subjects";
import { getTask } from "@/lib/tasks";
import { formatNumber } from "@/lib/utils";

interface DashboardContextValue {
  overview: OverviewPayload;
  /** True while a mutation is in flight. */
  pending: boolean;
  error: string | null;
  toggleTask: (taskId: string, completed: boolean) => Promise<void>;
  toggleCoreSubject: (completed: boolean) => Promise<void>;
  saveNotes: (notes: DayMutation["notes"]) => Promise<void>;
  /** Set when a mutation crosses a level or unlocks a badge. */
  celebration: Celebration | null;
  dismissCelebration: () => void;
}

export interface Celebration {
  kind: "level" | "badge" | "perfect";
  title: string;
  detail: string;
}

const DashboardContext = React.createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = React.useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}

/**
 * Applies a mutation locally so checkboxes and the score ring respond
 * instantly; the server response then replaces the whole payload, which also
 * refreshes streaks, XP, level and badges.
 */
function applyOptimistic(
  overview: OverviewPayload,
  mutation: DayMutation,
): OverviewPayload {
  const day = { ...overview.day };
  const now = new Date().toISOString();

  if (mutation.task) {
    const definition = getTask(mutation.task.taskId);
    day.tasks = day.tasks.map((t) =>
      t.taskId === mutation.task!.taskId
        ? {
            ...t,
            completed: mutation.task!.completed,
            completedAt: mutation.task!.completed ? (t.completedAt ?? now) : null,
            value: mutation.task!.completed ? (definition?.targetValue ?? 0) : 0,
          }
        : t,
    );
  }

  if (mutation.coreSubject) {
    const plan = coreSubjectFor(overview.date);
    day.coreSubject = {
      ...day.coreSubject,
      completed: mutation.coreSubject.completed,
      completedAt: mutation.coreSubject.completed
        ? (day.coreSubject.completedAt ?? now)
        : null,
      value: mutation.coreSubject.completed ? plan.targetValue : 0,
    };
  }

  if (mutation.notes) {
    day.notes = { ...day.notes, ...mutation.notes, updatedAt: now };
  }

  const score = computeDayScore({
    completedTaskIds: day.tasks.filter((t) => t.completed).map((t) => t.taskId),
    coreSubjectCompleted: day.coreSubject.completed,
  });

  return {
    ...overview,
    day: { ...day, score: score.score, xpEarned: score.xp, completedCount: score.completedCount },
    score,
  };
}

function detectCelebration(
  before: OverviewPayload,
  after: OverviewPayload,
): Celebration | null {
  if (after.level.level > before.level.level) {
    return {
      kind: "level",
      title: `Level ${after.level.level}`,
      detail: `${after.level.title} — ${formatNumber(after.level.totalXp)} XP total.`,
    };
  }

  const newBadge = after.achievements.find(
    (a) =>
      a.unlocked && !before.achievements.find((b) => b.id === a.id)?.unlocked,
  );
  if (newBadge) {
    return {
      kind: "badge",
      title: newBadge.name,
      detail: newBadge.description,
    };
  }

  if (after.score.score === 100 && before.score.score < 100) {
    return {
      kind: "perfect",
      title: "Perfect day",
      detail: "Every single item complete. That is what a 100 looks like.",
    };
  }

  return null;
}

export function DashboardProvider({
  initialOverview,
  children,
}: {
  initialOverview: OverviewPayload;
  children: React.ReactNode;
}) {
  const [overview, setOverview] = React.useState(initialOverview);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [celebration, setCelebration] = React.useState<Celebration | null>(null);

  // Guards against out-of-order responses when toggles land rapidly.
  const requestId = React.useRef(0);

  const mutate = React.useCallback(
    async (mutation: DayMutation) => {
      const id = ++requestId.current;
      const previous = overview;
      const optimistic = applyOptimistic(previous, mutation);

      setOverview(optimistic);
      setPending(true);
      setError(null);

      try {
        const response = await fetch(`/api/day/${previous.date}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mutation),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? `Request failed (${response.status})`);
        }

        const fresh = (await response.json()) as OverviewPayload;
        if (id !== requestId.current) return; // a newer mutation already won

        setOverview(fresh);
        const party = detectCelebration(previous, fresh);
        if (party) setCelebration(party);
      } catch (err) {
        if (id === requestId.current) {
          setOverview(previous); // roll back
          setError((err as Error).message);
        }
      } finally {
        if (id === requestId.current) setPending(false);
      }
    },
    [overview],
  );

  const value = React.useMemo<DashboardContextValue>(
    () => ({
      overview,
      pending,
      error,
      celebration,
      dismissCelebration: () => setCelebration(null),
      toggleTask: (taskId, completed) => mutate({ task: { taskId, completed } }),
      toggleCoreSubject: (completed) => mutate({ coreSubject: { completed } }),
      saveNotes: (notes) => mutate({ notes }),
    }),
    [overview, pending, error, celebration, mutate],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
