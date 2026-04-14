import { NextRequest, NextResponse } from "next/server";
import { runQA } from "@/lib/qa-runner";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";

export async function POST(request: NextRequest) {
  const { runId, pagesValidated, totalPages, maquettesApproved, totalMaquettes } = await request.json();

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
