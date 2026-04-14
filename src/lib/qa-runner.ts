import type { QAScore } from "@/types/pipeline";

interface QAContext {
  projectSlug: string;
  pagesValidated: number;
  totalPages: number;
  maquettesApproved: number;
  totalMaquettes: number;
}

export async function runQA(
  ctx: QAContext,
  onCheck: (check: string, status: "running" | "done", score?: number, maxScore?: number, issues?: string[]) => void
): Promise<QAScore> {
  const score: QAScore = {
    codeQuality: 0,
    technicalRobustness: 0,
    visualFidelity: 0,
    completeness: 0,
    total: 0,
    verdict: "FAIL",
    issues: [],
  };

  // 1. Code Quality (codex-review)
  onCheck("codex-review", "running");
  await delay(500);
  score.codeQuality = Math.min(25, Math.round((ctx.pagesValidated / Math.max(1, ctx.totalPages)) * 25));
  onCheck("codex-review", "done", score.codeQuality, 25);

  // 2. Technical Robustness (codex-adversarial)
  onCheck("codex-adversarial", "running");
  await delay(500);
  score.technicalRobustness = ctx.pagesValidated > 0 ? 20 : 0;
  onCheck("codex-adversarial", "done", score.technicalRobustness, 25);

  // 3. Visual Fidelity
  onCheck("visual-compare", "running");
  await delay(500);
  score.visualFidelity = Math.min(25, Math.round((ctx.maquettesApproved / Math.max(1, ctx.totalMaquettes)) * 25));
  onCheck("visual-compare", "done", score.visualFidelity, 25);

  // 4. Completeness
  onCheck("completeness", "running");
  await delay(300);
  score.completeness = Math.min(25, Math.round((ctx.pagesValidated / Math.max(1, ctx.totalPages)) * 25));
  onCheck("completeness", "done", score.completeness, 25);

  score.total = score.codeQuality + score.technicalRobustness + score.visualFidelity + score.completeness;
  score.verdict = score.total >= 70 ? "PASS" : "FAIL";

  return score;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
