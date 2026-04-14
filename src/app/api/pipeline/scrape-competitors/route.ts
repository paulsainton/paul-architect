import { NextRequest, NextResponse } from "next/server";
import { scrapeCompetitors, fetchOgMetadata } from "@/lib/competitor-scraper";
import { getRun, emitSSE } from "@/lib/pipeline-state";

export async function POST(request: NextRequest) {
  const { runId, sector, type, projectName } = await request.json();

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  emitSSE(runId, "competitors:searching", { sector, type });

  const results = await scrapeCompetitors(sector, type, projectName);

  // Enrichir avec OG metadata
  for (let i = 0; i < results.length; i++) {
    const comp = results[i];
    emitSSE(runId, "competitors:found", {
      index: i,
      title: comp.title,
      url: comp.url,
      score: comp.score,
    });

    const og = await fetchOgMetadata(comp.url);
    if (og.title) comp.title = og.title;
    if (og.description) comp.description = og.description;
    if (og.image) comp.ogImage = og.image;
  }

  emitSSE(runId, "competitors:complete", { count: results.length });

  return NextResponse.json(results);
}
