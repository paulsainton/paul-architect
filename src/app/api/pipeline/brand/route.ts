import { NextRequest, NextResponse } from "next/server";
import { generateBrandOptions } from "@/lib/brand-generator";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import type { MergedTokens, Brief } from "@/types/pipeline";
import { validateBody, brandSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, brandSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { runId, tokens, brief } = validation.data as {
    runId: string;
    tokens: MergedTokens;
    brief: Brief;
  };

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  setTunnelStatus(runId, 4, "active");

  const options = await generateBrandOptions(tokens, brief, (option, status, data) => {
    emitSSE(runId, `brand:${status}`, { option, ...(data || {}) });
  });

  emitSSE(runId, "brand:complete", { count: options.length, options });

  return NextResponse.json(options);
}
