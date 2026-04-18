import { NextRequest, NextResponse } from "next/server";
import { auditProject } from "@/lib/brief-auditor";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import { existsSync } from "fs";

const EMPIRE_API = "http://localhost:3060";

async function resolveProjectPath(slug: string): Promise<string | null> {
  // 1. EmpireDONE : source de v\u00e9rit\u00e9
  try {
    const res = await fetch(`${EMPIRE_API}/api/projects`, { signal: AbortSignal.timeout(4_000) });
    if (res.ok) {
      const projects = await res.json();
      const found = Array.isArray(projects) ? projects.find((p: { id: string; project_path?: string }) => p.id === slug) : null;
      if (found?.project_path && existsSync(found.project_path)) return found.project_path;
    }
  } catch { /* fallback below */ }

  // 2. Scan multi-chemins
  const candidates = [
    `/opt/${slug}`,
    `/var/www/${slug}`,
    `/var/www/app-${slug}`,
    `/home/paul/projects/${slug}`,
    `/opt/${slug}-refonte`,
    `/opt/${slug}-dashboard`,
    `/opt/app-${slug}`,
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }

  // 3. Alias historiques
  const aliases: Record<string, string> = {
    "ecom-dropship": "/opt/ecom-mygong",
    matthias: "/opt/matthias-site",
    dimension: "/opt/site-web-dimension-refonte",
  };
  if (aliases[slug] && existsSync(aliases[slug])) return aliases[slug];
  return null;
}

export async function POST(request: NextRequest) {
  const { runId, projectPath: explicitPath } = await request.json();

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  const projectPath = explicitPath && existsSync(explicitPath) ? explicitPath : await resolveProjectPath(run.projectSlug);
  if (!projectPath) {
    return NextResponse.json({ error: `Project path not found for "${run.projectSlug}"` }, { status: 400 });
  }

  setTunnelStatus(runId, 1, "active");

  // Scan par \u00e9tapes avec SSE pour feedback visuel
  const sources = [
    { key: "package.json", label: "Lecture package.json" },
    { key: "CLAUDE.md", label: "Analyse CLAUDE.md" },
    { key: "src/app", label: "Scan des pages" },
    { key: "src/components", label: "D\u00e9tection composants" },
    { key: "globals.css", label: "Extraction tokens CSS" },
    { key: ".env", label: "Relev\u00e9 variables d'environnement" },
    { key: "empiredone", label: "Requ\u00eate EmpireDONE API" },
    { key: "orchestrator", label: "Sync Orchestrator" },
    { key: "inference", label: "Inf\u00e9rences brief (audience, vision, mood)" },
  ];

  for (const source of sources) {
    emitSSE(runId, "collect:scanning", { source: source.label, key: source.key });
    await new Promise((r) => setTimeout(r, 150));
  }

  const audit = await auditProject(projectPath, run.projectSlug);

  emitSSE(runId, "collect:found", {
    pages: audit.scan.pages.length,
    components: audit.scan.components.length,
    tokens: Object.keys(audit.scan.tokens).length,
    features: audit.scan.features.length,
    empireFound: !!audit.empireData,
  });

  emitSSE(runId, "collect:complete", {
    scan: audit.scan,
    empireData: audit.empireData,
    autofilled: audit.autofilled,
    auditNotes: audit.auditNotes,
    targetUrl: audit.targetUrl,
  });

  return NextResponse.json(audit);
}
