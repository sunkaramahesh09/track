import { NextResponse } from "next/server";
import { buildOverview } from "@/lib/overview";
import { isDayKey, todayKey } from "@/lib/date";

// Mongoose requires the Node.js runtime; it cannot run on the edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("date");
  const date = requested && isDayKey(requested) ? requested : todayKey();

  try {
    return NextResponse.json(await buildOverview(date));
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
