import { NextRequest, NextResponse } from "next/server";

const STITCH_API = "http://localhost:3012";

/**
 * Proxy GET /api/stitch/projects/[slug] \u2014 d\u00e9tails du projet + maquettes
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    // Fetch projet + maquettes en parall\u00e8le
    const [projectRes, maquettesRes] = await Promise.allSettled([
      fetch(`${STITCH_API}/api/projects/${slug}`, { signal: AbortSignal.timeout(8_000) }),
      fetch(`${STITCH_API}/api/projects/${slug}/maquettes`, { signal: AbortSignal.timeout(8_000) }),
    ]);

    let project = null;
    let maquettes = null;

    if (projectRes.status === "fulfilled" && projectRes.value.ok) {
      project = await projectRes.value.json();
    }
    if (maquettesRes.status === "fulfilled" && maquettesRes.value.ok) {
      maquettes = await maquettesRes.value.json();
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project, maquettes });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
