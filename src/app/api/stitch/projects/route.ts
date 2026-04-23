import { NextRequest, NextResponse } from "next/server";

import { CONFIG } from "@/lib/config";
import { log } from "@/lib/logger";
const STITCH_API = CONFIG.STITCH_API;

/**
 * Proxy GET /api/stitch/projects \u2014 liste tous les projets Stitch
 * Avec filtre optionnel ?prefix=lifeos pour ne garder que ceux cr\u00e9\u00e9s depuis Paul Architect pour un projet donn\u00e9
 */
export async function GET(request: NextRequest) {
  const prefix = request.nextUrl.searchParams.get("prefix") || "";

  try {
    const res = await fetch(`${STITCH_API}/api/projects`, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) {
      return NextResponse.json({ error: `Stitch ${res.status}`, items: [] }, { status: 502 });
    }
    const all = await res.json();
    const list = Array.isArray(all) ? all : [];
    const filtered = prefix ? list.filter((p: { slug?: string }) => p.slug?.startsWith(prefix)) : list;
    return NextResponse.json(filtered);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.scope("stitch/projects").error("fetch failed", { error: err });
    return NextResponse.json({ error: msg, items: [] }, { status: 502 });
  }
}
