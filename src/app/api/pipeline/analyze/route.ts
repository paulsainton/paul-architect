import { NextRequest, NextResponse } from "next/server";
import { scanProject } from "@/lib/project-analyzer";
import { getRun, emitSSE, setTunnelStatus, updateRun } from "@/lib/pipeline-state";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  const { runId, projectPath } = await request.json();

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
  if (!projectPath || !existsSync(projectPath)) {
    return NextResponse.json({ error: "Invalid project path" }, { status: 400 });
  }

  setTunnelStatus(runId, 1, "active");

  // Scan en étapes avec SSE
  const sources = [
    "package.json", "CLAUDE.md", "src/app (pages)", "src/components",
    "globals.css (tokens)", ".env (variables)",
  ];

  for (const source of sources) {
    emitSSE(runId, "collect:scanning", { source });
    // Petit délai pour montrer la progression
    await new Promise((r) => setTimeout(r, 100));
  }

  const scan = scanProject(projectPath);

  emitSSE(runId, "collect:found", {
    pages: scan.pages.length,
    components: scan.components.length,
    tokens: Object.keys(scan.tokens).length,
    features: scan.features.length,
  });

  emitSSE(runId, "collect:complete", { summary: scan });

  return NextResponse.json(scan);
}
