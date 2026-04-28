import { NextRequest, NextResponse } from "next/server";
import { auditProject } from "@/lib/brief-auditor";
import { getRun, emitSSE, setTunnelStatus } from "@/lib/pipeline-state";
import { existsSync } from "fs";
import { resolveProjectPath } from "@/lib/project-resolver";
import { validateBody, analyzeSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, analyzeSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { runId, projectPath: explicitPath } = validation.data;

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
