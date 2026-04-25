import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import { deployProject } from "@/lib/deploy-runner";
import { getRun, emitSSE, setTunnelStatus, updateRun } from "@/lib/pipeline-state";
import { validateBody, deploySchema } from "@/lib/schemas";
import { CONFIG } from "@/lib/config";
import { log } from "@/lib/logger";

const logger = log.scope("api:deploy");
const EMPIRE_API = CONFIG.EMPIRE_API;

async function resolveProjectPath(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${EMPIRE_API}/api/projects`, { signal: AbortSignal.timeout(4_000) });
    if (res.ok) {
      const projects = await res.json();
      const found = Array.isArray(projects)
        ? projects.find((p: { id: string; project_path?: string }) => p.id === slug)
        : null;
      if (found?.project_path && existsSync(found.project_path)) return found.project_path;
    }
  } catch { /* fallback */ }
  const candidates = [
    `/opt/${slug}`, `/var/www/${slug}`, `/var/www/app-${slug}`,
    `/home/paul/projects/${slug}`, `/opt/${slug}-refonte`, `/opt/app-${slug}`,
  ];
  for (const path of candidates) if (existsSync(path)) return path;
  const aliases: Record<string, string> = {
    "ecom-dropship": "/opt/ecom-mygong",
    matthias: "/opt/matthias-website",
    dimension: "/opt/site-web-dimension-refonte",
    miam: "/opt/dietplus",
  };
  if (aliases[slug] && existsSync(aliases[slug])) return aliases[slug];
  return null;
}

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, deploySchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { runId, commitMessage } = validation.data;

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  const projectPath = await resolveProjectPath(run.projectSlug);
  if (!projectPath) {
    return NextResponse.json({ error: `Project path not found for ${run.projectSlug}` }, { status: 404 });
  }

  emitSSE(runId, "deploy:start", { projectSlug: run.projectSlug, projectPath });
  setTunnelStatus(runId, 8, "active");

  logger.info("deploy started", { runId, projectSlug: run.projectSlug, projectPath });

  const result = await deployProject(run.projectSlug, projectPath, commitMessage);

  // Emit each step in order so the UI can show progress retrospectively
  for (const step of result.steps) {
    emitSSE(runId, "deploy:step", {
      name: step.name,
      status: step.status,
      output: step.output,
      duration: step.duration,
    });
  }

  emitSSE(runId, "deploy:complete", {
    success: result.success,
    commitSha: result.commitSha,
    pm2Restarted: result.pm2Restarted,
    empireUpdated: result.empireUpdated,
    stepsCount: result.steps.length,
  });

  if (result.success) {
    setTunnelStatus(runId, 8, "completed");
    updateRun(runId, { tunnels: run.tunnels });
  }

  logger.info("deploy finished", {
    runId,
    success: result.success,
    commitSha: result.commitSha,
    steps: result.steps.length,
  });

  return NextResponse.json(result);
}
