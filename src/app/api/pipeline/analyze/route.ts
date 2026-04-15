import { NextRequest, NextResponse } from "next/server";
import { scanProject } from "@/lib/project-analyzer";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import { existsSync } from "fs";

function resolveProjectPath(slug: string): string | null {
  // Essayer dans l'ordre : /opt/{slug} exact, puis chercher un match partiel
  const direct = `/opt/${slug}`;
  if (existsSync(direct)) return direct;
  // Mappings courants (slug != dossier)
  const aliases: Record<string, string> = {
    miam: "/opt/dietplus",
    "ecom-dropship": "/opt/ecom-mygong",
    matthias: "/opt/matthias-website",
  };
  if (aliases[slug] && existsSync(aliases[slug])) return aliases[slug];
  return null;
}

export async function POST(request: NextRequest) {
  const { runId, projectPath: explicitPath } = await request.json();

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  // Résoudre le path : explicite > auto depuis slug
  const projectPath = explicitPath && existsSync(explicitPath) ? explicitPath : resolveProjectPath(run.projectSlug);
  if (!projectPath) {
    return NextResponse.json({ error: `Project path not found for "${run.projectSlug}"` }, { status: 400 });
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
