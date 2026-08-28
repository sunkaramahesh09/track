import { NextResponse } from "next/server";
import { contributionWindow, getSummaries } from "@/lib/db/day-service";
import { todayKey } from "@/lib/date";

// Mongoose requires the Node.js runtime; it cannot run on the edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const daysParam = Number(new URL(request.url).searchParams.get("days") ?? 364);
  const days = Number.isFinite(daysParam)
    ? Math.min(Math.max(daysParam, 30), 365)
    : 364;

  try {
    const { from, to } = contributionWindow(days);
    return NextResponse.json({
      from,
      to,
      today: todayKey(),
      summaries: await getSummaries(from, to),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
