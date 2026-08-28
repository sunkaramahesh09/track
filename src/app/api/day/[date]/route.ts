import { NextResponse } from "next/server";
import { getDay, mutateDay, type DayMutation } from "@/lib/db/day-service";
import { buildOverview } from "@/lib/overview";
import { isDayKey } from "@/lib/date";

// Mongoose requires the Node.js runtime; it cannot run on the edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ date: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { date } = await params;
  if (!isDayKey(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  try {
    return NextResponse.json(await getDay(date));
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

/**
 * PATCH applies one mutation (a task toggle, the core subject, or notes) and
 * returns the entire refreshed overview, so the client updates streaks, XP,
 * level and badges from the same response that confirmed the write.
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const { date } = await params;
  if (!isDayKey(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  let body: DayMutation;
  try {
    body = (await request.json()) as DayMutation;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.task && !body.coreSubject && !body.notes) {
    return NextResponse.json(
      { error: "Provide one of: task, coreSubject, notes" },
      { status: 400 },
    );
  }

  try {
    await mutateDay(date, body);
    return NextResponse.json(await buildOverview(date));
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
