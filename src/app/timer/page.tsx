import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { TimerView } from "@/components/timer/timer-view";

export const metadata: Metadata = {
  title: "Timer",
  description:
    "A stopwatch and a countdown for focused work sessions, with presets drawn from the daily targets.",
};

export default function TimerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Focus"
        icon="Timer"
        title="Timer"
        description="A stopwatch and a countdown. It keeps running while you move around the app, survives a refresh, and records nothing — the board is still yours to tick."
      />
      <TimerView />
    </>
  );
}
