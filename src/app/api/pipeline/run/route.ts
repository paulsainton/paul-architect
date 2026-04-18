import { NextRequest, NextResponse } from "next/server";
import { createRun, getAllRuns, getRun, updateRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import { checkRateLimit, getClientKey, getResetSeconds } from "@/lib/rate-limit";

const RUN_LIMIT = 20;         // 20 runs cr\u00e9\u00e9s
const RUN_WINDOW_MS = 60_000; // par minute

export async function POST(request: NextRequest) {
  const key = getClientKey(request, "run");
  if (!checkRateLimit(key, RUN_LIMIT, RUN_WINDOW_MS)) {
    const reset = getResetSeconds(key, RUN_WINDOW_MS);
    return NextResponse.json(
      { error: `Trop de runs cr\u00e9\u00e9s. R\u00e9essayez dans ${reset}s.` },
      { status: 429, headers: { "Retry-After": String(reset) } }
    );
  }
  const { projectSlug } = await request.json();
  if (!projectSlug) {
    return NextResponse.json({ error: "projectSlug required" }, { status: 400 });
  }
  const run = createRun(projectSlug);
  emitSSE(run.id, "pipeline:start", { projectSlug });
  return NextResponse.json(run);
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const run = getRun(id);
    return run ? NextResponse.json(run) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(getAllRuns());
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { runId, skipTunnelAdvance, ...updates } = body;
  if (!runId) return NextResponse.json({ error: "runId required" }, { status: 400 });

  // skipTunnelAdvance = auto-save pendant l'\u00e9dition, ne pas avancer le statut des tunnels
  if (!skipTunnelAdvance) {
    if (updates.brief) {
      setTunnelStatus(runId, 1, "completed");
      setTunnelStatus(runId, 2, "active");
      emitSSE(runId, "brief:validated", { brief: updates.brief });
    }
    if (updates.inspirations) {
      setTunnelStatus(runId, 2, "completed");
      setTunnelStatus(runId, 3, "active");
      emitSSE(runId, "inspirations:validated", { total: updates.inspirations.length });
    }
    if (updates.brand) {
      setTunnelStatus(runId, 4, "completed");
      setTunnelStatus(runId, 5, "active");
      emitSSE(runId, "brand:validated", { brand: updates.brand });
    }
  }

  const run = updateRun(runId, updates);
  return run ? NextResponse.json(run) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
