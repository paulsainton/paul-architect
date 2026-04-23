import { NextRequest, NextResponse } from "next/server";
import { createRun, getAllRuns, getRun, updateRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import { checkRateLimit, getClientKey, getResetSeconds } from "@/lib/rate-limit";
import { createRunSchema, patchRunSchema, validateBody } from "@/lib/schemas";

const RUN_LIMIT = 20;
const RUN_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  const key = getClientKey(request, "run");
  if (!checkRateLimit(key, RUN_LIMIT, RUN_WINDOW_MS)) {
    const reset = getResetSeconds(key, RUN_WINDOW_MS);
    return NextResponse.json(
      { error: `Trop de runs. R\u00e9essayez dans ${reset}s.` },
      { status: 429, headers: { "Retry-After": String(reset) } }
    );
  }
  const parsed = await validateBody(request, createRunSchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: parsed.status });

  const run = createRun(parsed.data.projectSlug);
  emitSSE(run.id, "pipeline:start", { projectSlug: parsed.data.projectSlug });
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
  const parsed = await validateBody(request, patchRunSchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const { runId, skipTunnelAdvance, ...updates } = parsed.data;

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

  const run = updateRun(runId, updates as Parameters<typeof updateRun>[1]);
  return run ? NextResponse.json(run) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
