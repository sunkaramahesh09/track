"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon, accentVar } from "@/components/ui/icon";
import { CORE_SUBJECT_WEIGHT, CORE_SUBJECT_XP, MAX_DAILY_XP, TASKS } from "@/lib/tasks";

/** The rulebook: exactly what each item is worth, in points and XP. */
export function XpReference() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Scoring &amp; XP Reference</CardTitle>
          <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
            A perfect day is 100 points and {MAX_DAILY_XP} XP. Weights are
            deliberately uneven — finishing DSA matters more than finishing
            everything light.
          </p>
        </div>
        <Icon name="Scale" className="size-4 shrink-0 text-[var(--color-ink-faint)]" />
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-[13px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-faint)]">
                <th className="pb-2 font-semibold">Item</th>
                <th className="pb-2 font-semibold">Target</th>
                <th className="pb-2 text-right font-semibold">Score weight</th>
                <th className="pb-2 text-right font-semibold">XP</th>
              </tr>
            </thead>
            <tbody>
              {TASKS.map((task) => (
                <tr
                  key={task.id}
                  className="border-t border-[var(--color-hairline)]"
                >
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <Icon
                        name={task.icon}
                        className="size-3.5"
                        style={{ color: accentVar(task.accent) }}
                      />
                      <span className="font-medium">{task.name}</span>
                    </span>
                  </td>
                  <td className="py-2 text-[var(--color-ink-faint)]">
                    {task.target}
                  </td>
                  <td className="numeric py-2 text-right font-semibold">
                    {task.weight}
                  </td>
                  <td className="numeric py-2 text-right text-[var(--color-ink-muted)]">
                    {task.xp}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-[var(--color-hairline)]">
                <td className="py-2">
                  <span className="flex items-center gap-2">
                    <Icon
                      name="GraduationCap"
                      className="size-3.5 text-[var(--color-accent-soft)]"
                    />
                    <span className="font-medium">Core Subject (rotating)</span>
                  </span>
                </td>
                <td className="py-2 text-[var(--color-ink-faint)]">1 hour</td>
                <td className="numeric py-2 text-right font-semibold">
                  {CORE_SUBJECT_WEIGHT}
                </td>
                <td className="numeric py-2 text-right text-[var(--color-ink-muted)]">
                  {CORE_SUBJECT_XP}
                </td>
              </tr>
              <tr className="border-t-2 border-[var(--color-hairline-strong)] font-semibold">
                <td className="py-2">Perfect day</td>
                <td className="py-2 text-[var(--color-ink-faint)]">Everything</td>
                <td className="numeric py-2 text-right text-[var(--tier-excellent)]">
                  100
                </td>
                <td className="numeric py-2 text-right text-[var(--color-accent-soft)]">
                  {MAX_DAILY_XP}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
