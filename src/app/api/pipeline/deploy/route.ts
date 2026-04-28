import { NextRequest, NextResponse } from "next/server";
import { deployProject } from "@/lib/deploy-runner";
import { getRun, emitSSE, setTunnelStatus, updateRun } from "@/lib/pipeline-state";
import { validateBody, deploySchema } from "@/lib/schemas";
import { resolveProjectPath, isReservedSlug } from "@/lib/project-resolver";
import { log } from "@/lib/logger";

const logger = log.scope("api:deploy");

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, deploySchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { runId, commitMessage } = validation.data;

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  if (isReservedSlug(run.projectSlug)) {
    return NextResponse.json({ error: `Slug réservé interdit: ${run.projectSlug}` }, { status: 403 });
  }

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
