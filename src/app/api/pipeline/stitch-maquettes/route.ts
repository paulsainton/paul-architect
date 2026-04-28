import { NextRequest, NextResponse } from "next/server";
import { generateMaquettes } from "@/lib/stitch-runner";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import type { Inspiration, Brief, Brand } from "@/types/pipeline";
import { validateBody, stitchMaquettesSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, stitchMaquettesSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { runId, inspirations, brief, brand } = validation.data as {
    runId: string;
    inspirations: Inspiration[];
    brief: Brief;
    brand: Brand;
  };

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  setTunnelStatus(runId, 7, "active");

  for (let i = 0; i < inspirations.length; i++) {
    emitSSE(runId, "maquette:queue", {
      refUrl: inspirations[i].url,
      position: i + 1,
      total: inspirations.length,
    });
  }

  const results = await generateMaquettes(runId, inspirations, brief, brand, (refUrl, status) => {
    // Ne PAS r\u00e9f\u00e9rencer `results` ici (TDZ \u2014 pas encore initialis\u00e9 pendant l'await)
    emitSSE(runId, `maquette:${status === "generating" ? "generating" : "ready"}`, {
      refUrl,
      status,
    });
  });

  setTunnelStatus(runId, 7, "completed");
  emitSSE(runId, "maquette:all-complete", {
    count: results.length,
    successCount: results.filter((r) => r.status === "success").length,
  });

  return NextResponse.json(results);
}
