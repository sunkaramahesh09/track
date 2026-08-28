"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { TASKS } from "@/lib/tasks";
import { useDashboard } from "./dashboard-provider";
import { TaskRow } from "./task-row";

export function TaskList() {
  const { overview, pending, toggleTask } = useDashboard();
  const entries = new Map(overview.day.tasks.map((t) => [t.taskId, t] as const));
  const done = overview.day.tasks.filter((t) => t.completed).length;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div>
          <CardTitle>Daily Tasks</CardTitle>
          <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
            Fixed every day. Nothing carries over.
          </p>
        </div>
        <Badge variant={done === TASKS.length ? "success" : "neutral"}>
          <Icon name={done === TASKS.length ? "PartyPopper" : "ListChecks"} />
          {done} / {TASKS.length}
        </Badge>
      </CardHeader>

      <ul className="space-y-2 px-3 pb-4 sm:px-4">
        {TASKS.map((task, index) => (
          <TaskRow
            key={task.id}
            task={task}
            index={index}
            disabled={pending}
            entry={
              entries.get(task.id) ?? {
                taskId: task.id,
                completed: false,
                completedAt: null,
                value: 0,
              }
            }
            onToggle={(completed) => toggleTask(task.id, completed)}
          />
        ))}
      </ul>
    </Card>
  );
}
