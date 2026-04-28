import { NextRequest, NextResponse } from "next/server";
import { runAnalysis } from "@/lib/ux-analysis";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import type { Brief, Brand, MergedTokens } from "@/types/pipeline";
import { validateBody, analysisSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, analysisSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { runId, brief, brand, tokens, inspirationsCount = 0 } = validation.data as {
    runId: string;
    brief: Brief;
    brand: Brand;
    tokens: MergedTokens;
    inspirationsCount?: number;
  };

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  setTunnelStatus(runId, 5, "active");

  const results = await runAnalysis(
    {
      brief, brand, tokens, inspirationsCount,
      runId,
      inspirations: run.inspirations,  // pour charger les extractions Clone par insp
    },
    (name, role) => emitSSE(runId, "analysis:persona-start", { name, role }),
    (name, text) => emitSSE(runId, "analysis:persona-chunk", { name, text }),
    (name, summary) => emitSSE(runId, "analysis:persona-complete", { name, summary })
  );

  setTunnelStatus(runId, 5, "completed");
  emitSSE(runId, "analysis:complete", {
    personas: results.map((r) => r.name),
    totalRecommendations: results.reduce((acc, r) => acc + r.recommendations.length, 0),
  });

  return NextResponse.json(results);
}
