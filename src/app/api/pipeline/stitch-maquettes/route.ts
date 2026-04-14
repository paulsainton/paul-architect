import { NextRequest, NextResponse } from "next/server";
import { generateMaquettes } from "@/lib/stitch-runner";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import type { Inspiration, Brief, Brand } from "@/types/pipeline";

export async function POST(request: NextRequest) {
  const { runId, inspirations, brief, brand } = (await request.json()) as {
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
    if (status === "generating") {
      emitSSE(runId, "maquette:generating", { refUrl, status });
    } else {
      const result = results?.find((r) => r.refUrl === refUrl);
      emitSSE(runId, "maquette:ready", {
        refUrl,
        imageUrl: result?.imageUrl || "",
        stitchProjectId: result?.stitchProjectId || "",
      });
    }
  });

  setTunnelStatus(runId, 7, "completed");
  emitSSE(runId, "maquette:all-complete", {
    count: results.length,
    successCount: results.filter((r) => r.status === "success").length,
  });

  return NextResponse.json(results);
}
