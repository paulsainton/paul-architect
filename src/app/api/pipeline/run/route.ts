import { NextRequest, NextResponse } from "next/server";
import { createRun, getAllRuns, getRun, updateRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";

export async function POST(request: NextRequest) {
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
