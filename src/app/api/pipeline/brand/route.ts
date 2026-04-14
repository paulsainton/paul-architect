import { NextRequest, NextResponse } from "next/server";
import { generateBrandOptions } from "@/lib/brand-generator";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import type { MergedTokens, Brief } from "@/types/pipeline";

export async function POST(request: NextRequest) {
  const { runId, tokens, brief } = (await request.json()) as {
    runId: string;
    tokens: MergedTokens;
    brief: Brief;
  };

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  setTunnelStatus(runId, 4, "active");

  const options = await generateBrandOptions(tokens, brief, (option, status) => {
    if (status === "generating") {
      emitSSE(runId, "brand:generating", { option });
    } else {
      emitSSE(runId, "brand:preview", { option });
    }
  });

  emitSSE(runId, "brand:complete", { count: options.length });

  return NextResponse.json(options);
}
