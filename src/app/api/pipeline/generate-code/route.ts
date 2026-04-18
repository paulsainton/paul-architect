import { NextRequest, NextResponse } from "next/server";
import { generatePageCode, type CodeGenContext } from "@/lib/code-generator";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import { existsSync } from "fs";

function resolveProjectPath(slug: string): string | null {
  const direct = `/opt/${slug}`;
  if (existsSync(direct)) return direct;
  const aliases: Record<string, string> = {
    miam: "/opt/dietplus",
    "ecom-dropship": "/opt/ecom-mygong",
    matthias: "/opt/matthias-website",
  };
  if (aliases[slug] && existsSync(aliases[slug])) return aliases[slug];
  return null;
}

export async function POST(request: NextRequest) {
  const { runId, context } = (await request.json()) as {
    runId: string;
    context: CodeGenContext;
  };

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  setTunnelStatus(runId, 6, "active");

  // Injecter le projectPath + inspirations depuis le run state
  const enrichedContext: CodeGenContext = {
    ...context,
    projectPath: resolveProjectPath(run.projectSlug) || undefined,
    inspirations: run.inspirations,
  };

  const results = [];

  for (let i = 0; i < enrichedContext.pages.length; i++) {
    const page = enrichedContext.pages[i];
    emitSSE(runId, "build:page-start", { page, index: i, total: enrichedContext.pages.length });

    const result = await generatePageCode(page, enrichedContext, (status, percent) => {
      emitSSE(runId, "build:generating", { page, status, percent });
    });

    if (result.compiled) {
      emitSSE(runId, "build:code-ready", {
        page,
        filesChanged: result.filesChanged,
        linesAdded: result.linesAdded,
      });
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

  setTunnelStatus(runId, 6, "completed");
  setTunnelStatus(runId, 7, "active");

  return NextResponse.json(results);
}
