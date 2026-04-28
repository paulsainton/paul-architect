import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/lib/config";
import { validateBody, stitchInstantSchema } from "@/lib/schemas";

const STITCH_API = CONFIG.STITCH_API;

export const maxDuration = 120;

/**
 * Proxy vers Stitch /api/instant (createProject + generate + getImage)
 */
export async function POST(request: NextRequest) {
  const validation = await validateBody(request, stitchInstantSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  try {
    const res = await fetch(`${STITCH_API}/api/instant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validation.data),
      signal: AbortSignal.timeout(110_000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `stitch-instant proxy: ${msg}` }, { status: 502 });
  }
}
