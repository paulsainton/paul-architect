import { NextRequest, NextResponse } from "next/server";
import { runQA } from "@/lib/qa-runner";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import { validateBody, reviewSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, reviewSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const {
    runId,
    pagesValidated = 0,
    totalPages = 1,
    maquettesApproved = 0,
    totalMaquettes = 1,
  } = validation.data;

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  setTunnelStatus(runId, 8, "active");

  const score = await runQA(
    { projectSlug: run.projectSlug, pagesValidated, totalPages, maquettesApproved, totalMaquettes },
    (check, status, checkScore, maxScore, issues) => {
      if (status === "running") {
        emitSSE(runId, "qa:running", { check });
      } else {
        emitSSE(runId, "qa:score", { check, score: checkScore, maxScore, issues });
      }
    }
  );

  emitSSE(runId, "qa:verdict", {
    totalScore: score.total,
    verdict: score.verdict,
    breakdown: {
      codeQuality: score.codeQuality,
      technicalRobustness: score.technicalRobustness,
      visualFidelity: score.visualFidelity,
      completeness: score.completeness,
    },
  });

  if (score.verdict === "PASS") {
    setTunnelStatus(runId, 8, "completed");
    emitSSE(runId, "pipeline:complete", {
      verdict: "PASS",
      score: score.total,
    });
  }

  return NextResponse.json(score);
}
