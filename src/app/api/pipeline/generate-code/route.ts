import { NextRequest, NextResponse } from "next/server";
import { generatePageCode, type CodeGenContext } from "@/lib/code-generator";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";

export async function POST(request: NextRequest) {
  const { runId, context } = (await request.json()) as {
    runId: string;
    context: CodeGenContext;
  };

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  setTunnelStatus(runId, 6, "active");

  const results = [];

  for (let i = 0; i < context.pages.length; i++) {
    const page = context.pages[i];
    emitSSE(runId, "build:page-start", { page, index: i, total: context.pages.length });

    const result = await generatePageCode(page, context, (status, percent) => {
      emitSSE(runId, "build:generating", { page, status, percent });
    });

    if (result.compiled) {
      emitSSE(runId, "build:compiled", { page, success: true });
    } else {
      emitSSE(runId, "build:compiled", { page, success: false, errors: result.errors });
    }

    if (result.reviewScore !== undefined) {
      emitSSE(runId, "build:review", {
        page,
        score: result.reviewScore,
        issues: result.reviewIssues,
      });
    }

    emitSSE(runId, "build:waiting-validation", { page });
    results.push(result);
  }

  return NextResponse.json(results);
}
