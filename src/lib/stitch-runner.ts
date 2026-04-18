import type { Inspiration, Brand, Brief } from "@/types/pipeline";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const STITCH_API = "http://localhost:3012";
const DATA_DIR = "/opt/paul-architect/data/extractions";

interface MaquetteResult {
  refUrl: string;
  refDomain: string;
  imageUrl?: string;
  stitchProjectId?: string;
  status: "success" | "fallback" | "failed";
}

export async function generateMaquettes(
  runId: string,
  inspirations: Inspiration[],
  brief: Brief,
  brand: Brand,
  onProgress: (refUrl: string, status: string) => void
): Promise<MaquetteResult[]> {
  const results: MaquetteResult[] = [];

  for (const insp of inspirations) {
    const domain = (() => {
      try { return new URL(insp.url).hostname.replace("www.", ""); } catch { return "unknown"; }
    })();

    onProgress(insp.url, "generating");

    // Lire les tokens spécifiques de cette ref
    let refTokens = "";
    const tokensPath = join(DATA_DIR, runId, domain, "tokens.json");
    if (existsSync(tokensPath)) {
      try { refTokens = readFileSync(tokensPath, "utf-8"); } catch { /* ignore */ }
    }

    let designMd = "";
    const designPath = join(DATA_DIR, runId, domain, "DESIGN.md");
    if (existsSync(designPath)) {
      try { designMd = readFileSync(designPath, "utf-8").slice(0, 2000); } catch { /* ignore */ }
    }

    const prompt = `Reproduis le layout de ${insp.url} pour le projet "${brief.project.name}" (${brief.project.type}).
Palette: primary ${brand.palette.primary}, secondary ${brand.palette.secondary}, accent ${brand.palette.accent}, bg ${brand.palette.background}.
Typo: heading ${brand.typography.heading}, body ${brand.typography.body}.
Tokens de référence: ${refTokens.slice(0, 500)}
Design system: ${designMd.slice(0, 500)}
Features: ${brief.paul.priorities.join(", ")}.
Mood: ${brief.paul.mood}.
Génère un design DESKTOP complet inspiré à 100% de cette référence.`;

    try {
      const slug = `${brief.project.slug}-${domain}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

      // 1. Créer le projet Stitch (409 = existe déjà, ok)
      const createRes = await fetch(`${STITCH_API}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: `${brief.project.name} — ${domain}`,
          type: brief.project.type === "mobile" ? "mobile" : "webapp",
          sector: brief.project.sector || "design",
          targetAudience: brief.paul.audience || "general",
          description: prompt.slice(0, 500),
          features: brief.paul.priorities.slice(0, 5),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!createRes.ok && createRes.status !== 409) throw new Error("create failed");

      // 2. Lancer le pipeline
      const runRes = await fetch(`${STITCH_API}/api/pipeline/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!runRes.ok) throw new Error("run failed");
      const { runId } = await runRes.json();

      // 3. Poll le résultat (max 90s)
      const deadline = Date.now() + 90_000;
      let imageUrl = "";
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 3000));
        const statusRes = await fetch(`${STITCH_API}/api/pipeline/list?runId=${runId}`, {
          signal: AbortSignal.timeout(5_000),
        }).catch(() => null);
        if (!statusRes?.ok) continue;
        const s = await statusRes.json().catch(() => null);
        if (s?.imageUrl || s?.preview) { imageUrl = s.imageUrl || s.preview; break; }
        if (s?.status === "completed" || s?.status === "failed") break;
      }

      results.push({
        refUrl: insp.url,
        refDomain: domain,
        imageUrl,
        stitchProjectId: slug,
        status: imageUrl ? "success" : "fallback",
      });
      onProgress(insp.url, imageUrl ? "ready" : "fallback");
      continue;
    } catch { /* fallback */ }

    // Fallback
    results.push({
      refUrl: insp.url,
      refDomain: domain,
      status: "fallback",
    });
    onProgress(insp.url, "fallback");
  }

  return results;
}
