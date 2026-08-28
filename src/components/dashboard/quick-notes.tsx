"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useDashboard } from "./dashboard-provider";
import { formatTime } from "@/lib/date";
import { cn } from "@/lib/utils";

const FIELDS = [
  {
    key: "wentWell" as const,
    label: "What went well today",
    placeholder: "Cleared two DP problems without hints…",
    icon: "ThumbsUp",
    color: "var(--tier-excellent)",
  },
  {
    key: "needsImprovement" as const,
    label: "What needs improvement",
    placeholder: "Lost 40 minutes to the phone before starting…",
    icon: "TriangleAlert",
    color: "var(--tier-average)",
  },
  {
    key: "tomorrowFocus" as const,
    label: "Tomorrow's focus",
    placeholder: "Two graph problems before 10am, no exceptions…",
    icon: "Target",
    color: "var(--accent-cyan)",
  },
];

export function QuickNotes() {
  const { overview, saveNotes, pending } = useDashboard();
  const { notes } = overview.day;

  const serverNotes = React.useMemo(
    () => ({
      wentWell: notes.wentWell,
      needsImprovement: notes.needsImprovement,
      tomorrowFocus: notes.tomorrowFocus,
    }),
    [notes.wentWell, notes.needsImprovement, notes.tomorrowFocus],
  );

  const [draft, setDraft] = React.useState(serverNotes);
  const [syncedFrom, setSyncedFrom] = React.useState(serverNotes);
  const [saved, setSaved] = React.useState(false);

  // Adjust state during render (React's documented alternative to an effect):
  // when the server payload changes underneath us, adopt it as the new draft.
  if (syncedFrom !== serverNotes) {
    setSyncedFrom(serverNotes);
    setDraft(serverNotes);
  }

  const dirty =
    draft.wentWell !== notes.wentWell ||
    draft.needsImprovement !== notes.needsImprovement ||
    draft.tomorrowFocus !== notes.tomorrowFocus;

  async function handleSave() {
    await saveNotes(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Quick Notes</CardTitle>
          <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
            Stored against {overview.date}. Two honest lines beat a page of excuses.
          </p>
        </div>
        <Icon
          name="NotebookPen"
          className="size-4.5 shrink-0 text-[var(--color-ink-faint)]"
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={`note-${field.key}`}
              className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.13em]"
              style={{ color: field.color }}
            >
              <Icon name={field.icon} className="size-3.5" />
              {field.label}
            </label>
            <textarea
              id={`note-${field.key}`}
              rows={2}
              value={draft[field.key]}
              placeholder={field.placeholder}
              onChange={(e) =>
                setDraft((d) => ({ ...d, [field.key]: e.target.value }))
              }
              className={cn(
                "w-full resize-y rounded-xl border border-[var(--color-hairline)] bg-[var(--tint-1)] px-3 py-2.5 text-[13.5px] leading-relaxed",
                "placeholder:text-[var(--color-ink-faint)]/70",
                "transition-colors focus:border-[var(--color-accent)]/50 focus:bg-[var(--tint-2)] focus:outline-none",
              )}
            />
          </div>
        ))}

        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-[var(--color-ink-faint)]">
            {saved
              ? "Saved."
              : dirty
                ? "Unsaved changes"
                : notes.updatedAt
                  ? `Last saved ${formatTime(notes.updatedAt)}`
                  : "No notes yet"}
          </p>
          <Button
            variant={dirty ? "primary" : "glass"}
            size="sm"
            onClick={handleSave}
            disabled={!dirty || pending}
          >
            <Icon name={saved ? "Check" : "Save"} />
            {saved ? "Saved" : "Save notes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
