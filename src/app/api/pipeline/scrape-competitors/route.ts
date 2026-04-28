import { NextRequest, NextResponse } from "next/server";
import { scrapeCompetitors } from "@/lib/competitor-scraper";
import { getRun, emitSSE } from "@/lib/pipeline-state";
import { validateBody, scrapeCompetitorsSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, scrapeCompetitorsSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { runId, sector = "", type = "", projectName = "", knownCompetitors = [], keywords = [] } = validation.data;

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  emitSSE(runId, "competitors:searching", { sector, type, knownCount: knownCompetitors.length });

  const results = await scrapeCompetitors(sector, type, projectName, knownCompetitors, keywords);

  for (let i = 0; i < results.length; i++) {
    emitSSE(runId, "competitors:found", {
      index: i,
      title: results[i].title,
      url: results[i].url,
      score: results[i].score,
      source: results[i].source,
    });
  }

  emitSSE(runId, "competitors:complete", { count: results.length });

  return NextResponse.json(results);
}
