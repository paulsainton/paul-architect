import { NextRequest, NextResponse } from "next/server";
import { runCloneArchitect } from "@/lib/clone-runner";
import { mergeTokens } from "@/lib/token-merger";
import { getRun, emitSSE, setTunnelStatus, updateRun } from "@/lib/pipeline-state";
import type { ExtractionResult } from "@/types/pipeline";
import { log } from "@/lib/logger";
import { validateBody, cloneSchema } from "@/lib/schemas";

export const maxDuration = 600; // 10 min max pour cette route (Next.js 16)

/**
 * T3 Clone fire-and-forget : retourne imm\u00e9diatement, SSE events pour progression.
 * Les URLs sont clon\u00e9es en s\u00e9quentiel mais la route retourne avant la fin.
 */
async function runClonesBackground(runId: string, urls: string[]) {
  const extractions: ExtractionResult[] = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    emitSSE(runId, "clone:queue", { url, position: i + 1, total: urls.length });
    emitSSE(runId, "clone:start", { url, step: "launching playwright" });

    try {
      const result = await runCloneArchitect(url, runId, (step, percent) => {
        emitSSE(runId, "clone:progress", { url, step, percent });
      });

      if (result.screenshots.desktop || result.screenshots.mobile) {
        emitSSE(runId, "clone:screenshot", {
          url,
          desktopUrl: result.screenshots.desktop,
          mobileUrl: result.screenshots.mobile,
        });
      }

      emitSSE(runId, "clone:tokens", {
        url,
        colorsCount: result.tokens.colors.length,
        fontsCount: result.tokens.fonts.length,
        spacingCount: result.tokens.spacing.length,
      });

      emitSSE(runId, "clone:complete", { url, status: result.status });
      extractions.push(result);
    } catch (err) {
      emitSSE(runId, "clone:error", { url, error: String(err) });
      extractions.push({
        url,
        domain: new URL(url).hostname,
        tokens: { colors: [], fonts: [], spacing: [], shadows: [], borderRadius: [] },
        screenshots: {},
        status: "failed",
      });
    }
  }

  emitSSE(runId, "clone:merge-start", {
    totalSources: extractions.filter((e) => e.status !== "failed").length,
  });
  const merged = mergeTokens(extractions);
  emitSSE(runId, "clone:merge-complete", {
    colors: merged.colors.length,
    fonts: merged.fonts.length,
    extractions,
  });

  updateRun(runId, { mergedTokens: merged });
  setTunnelStatus(runId, 3, "completed");
  setTunnelStatus(runId, 4, "active");
}

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, cloneSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { runId, urls } = validation.data;

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  setTunnelStatus(runId, 3, "active");

  // Fire-and-forget : ne pas await pour ne pas timeout la route
  runClonesBackground(runId, urls).catch((err) => {
    log.scope("clone-route").error("background error", { error: err, runId });
    emitSSE(runId, "clone:error", { error: String(err) });
  });

  return NextResponse.json({ started: true, urls: urls.length, runId });
}
