import { NextResponse } from "next/server";
import { getAllSummaries } from "@/lib/db/day-service";
import { buildAnalytics } from "@/lib/analytics";
import { computeStreaks } from "@/lib/streak";
import { todayKey } from "@/lib/date";

// Mongoose requires the Node.js runtime; it cannot run on the edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const days = Number(new URL(request.url).searchParams.get("days") ?? 30);

  try {
    const summaries = await getAllSummaries();
    return NextResponse.json({
      ...buildAnalytics(summaries, {
        dailyDays: Number.isFinite(days) ? Math.min(Math.max(days, 7), 365) : 30,
      }),
      streaks: computeStreaks(summaries, todayKey()),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
