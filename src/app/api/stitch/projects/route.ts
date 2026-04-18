import { NextRequest, NextResponse } from "next/server";

const STITCH_API = "http://localhost:3012";

/**
 * Proxy GET /api/stitch/projects \u2014 liste tous les projets Stitch
 * Avec filtre optionnel ?prefix=lifeos pour ne garder que ceux cr\u00e9\u00e9s depuis Paul Architect pour un projet donn\u00e9
 */
export async function GET(request: NextRequest) {
  const prefix = request.nextUrl.searchParams.get("prefix") || "";

  try {
    const res = await fetch(`${STITCH_API}/api/projects`, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return NextResponse.json([], { status: 200 });
    const all = await res.json();

    const list = Array.isArray(all) ? all : [];
    const filtered = prefix ? list.filter((p: { slug?: string }) => p.slug?.startsWith(prefix)) : list;

    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
