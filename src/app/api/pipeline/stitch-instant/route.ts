import { NextRequest, NextResponse } from "next/server";

const STITCH_API = "http://localhost:3012";

export const maxDuration = 120;

/**
 * Proxy vers Stitch /api/instant (createProject + generate + getImage)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${STITCH_API}/api/instant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(110_000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `stitch-instant proxy: ${msg}` }, { status: 502 });
  }
}
