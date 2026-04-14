import { NextRequest, NextResponse } from "next/server";
import { runCloneArchitect } from "@/lib/clone-runner";
import { mergeTokens } from "@/lib/token-merger";
import { getRun, emitSSE, setTunnelStatus, updateRun } from "@/lib/pipeline-state";
import type { ExtractionResult } from "@/types/pipeline";

export async function POST(request: NextRequest) {
  const { runId, urls } = await request.json();

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "urls required" }, { status: 400 });
  }

  setTunnelStatus(runId, 3, "active");

  const extractions: ExtractionResult[] = [];

  // Séquentiel pour éviter surcharge Playwright
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
      });

      emitSSE(runId, "clone:complete", { url, status: result.status });
      extractions.push(result);
    } catch (err) {
      emitSSE(runId, "clone:error", { url, error: String(err), fallback: "skipped" });
      extractions.push({
        url,
        domain: new URL(url).hostname,
        tokens: { colors: [], fonts: [], spacing: [], shadows: [], borderRadius: [] },
        screenshots: {},
        status: "failed",
      });
    }
  }

  // Merge des tokens
  emitSSE(runId, "clone:merge-start", { totalSources: extractions.filter((e) => e.status !== "failed").length });
  const merged = mergeTokens(extractions);
  emitSSE(runId, "clone:merge-complete", {
    colors: merged.colors.length,
    fonts: merged.fonts.length,
  });

  updateRun(runId, { mergedTokens: merged } as Record<string, unknown>);
  setTunnelStatus(runId, 3, "completed");
  setTunnelStatus(runId, 4, "active");

  return NextResponse.json({ extractions, merged });
}
