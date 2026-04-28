import { NextRequest, NextResponse } from "next/server";
import { generatePageCode, type CodeGenContext } from "@/lib/code-generator";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import { validateBody, generateCodeSchema } from "@/lib/schemas";
import { resolveProjectPath } from "@/lib/project-resolver";

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, generateCodeSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { runId, context } = validation.data as {
    runId: string;
    context: CodeGenContext;
  };

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  setTunnelStatus(runId, 6, "active");

  // Injecter le projectPath + inspirations + runId depuis le run state
  const enrichedContext: CodeGenContext = {
    ...context,
    projectPath: (await resolveProjectPath(run.projectSlug)) || undefined,
    inspirations: run.inspirations,
    runId,
  };

  // Génération en parallèle bornée (4 simultanées max) — 10 pages sequentiel = 15min,
  // batch 4 = ~4min sur Claude Sonnet à 90s/page, sans saturer les rate limits Anthropic.
  const CONCURRENCY = 4;
  const results: Array<Awaited<ReturnType<typeof generatePageCode>>> = [];

  async function buildOne(page: string, index: number) {
    emitSSE(runId, "build:page-start", { page, index, total: enrichedContext.pages.length });
    const result = await generatePageCode(page, enrichedContext, (status, percent) => {
      emitSSE(runId, "build:generating", { page, status, percent });
    });

    if (result.compiled) {
      emitSSE(runId, "build:code-ready", {
        page,
        filesChanged: result.filesChanged,
        linesAdded: result.linesAdded,
        modelUsed: result.modelUsed,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
      });
      emitSSE(runId, "build:compiled", { page, success: true });
    } else {
      emitSSE(runId, "build:compiled", { page, success: false, errors: result.errors });
    }
    if (result.reviewScore !== undefined) {
      emitSSE(runId, "build:review", { page, score: result.reviewScore, issues: result.reviewIssues });
    }
    emitSSE(runId, "build:waiting-validation", { page });
    return result;
  }

  // Exécution batchée
  for (let i = 0; i < enrichedContext.pages.length; i += CONCURRENCY) {
    const batch = enrichedContext.pages.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((page, j) => buildOne(page, i + j))
    );
    results.push(...batchResults);
  }

  setTunnelStatus(runId, 6, "completed");
  setTunnelStatus(runId, 7, "active");

  return NextResponse.json(results);
}
