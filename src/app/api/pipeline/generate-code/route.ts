import { NextRequest, NextResponse } from "next/server";
import { generatePageCode, type CodeGenContext } from "@/lib/code-generator";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import { existsSync } from "fs";

import { CONFIG } from "@/lib/config";
const EMPIRE_API = CONFIG.EMPIRE_API;

async function resolveProjectPath(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${EMPIRE_API}/api/projects`, { signal: AbortSignal.timeout(4_000) });
    if (res.ok) {
      const projects = await res.json();
      const found = Array.isArray(projects) ? projects.find((p: { id: string; project_path?: string }) => p.id === slug) : null;
      if (found?.project_path && existsSync(found.project_path)) return found.project_path;
    }
  } catch { /* fallback */ }
  const candidates = [
    `/opt/${slug}`, `/var/www/${slug}`, `/var/www/app-${slug}`,
    `/home/paul/projects/${slug}`, `/opt/${slug}-refonte`, `/opt/app-${slug}`,
  ];
  for (const path of candidates) if (existsSync(path)) return path;
  const aliases: Record<string, string> = {
    "ecom-dropship": "/opt/ecom-mygong", matthias: "/opt/matthias-site",
    dimension: "/opt/site-web-dimension-refonte",
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

  // Injecter le projectPath + inspirations + runId depuis le run state
  const enrichedContext: CodeGenContext = {
    ...context,
    projectPath: (await resolveProjectPath(run.projectSlug)) || undefined,
    inspirations: run.inspirations,
    runId,
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
        modelUsed: result.modelUsed,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
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
