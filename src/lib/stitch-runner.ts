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
      const res = await fetch(`${STITCH_API}/api/pipeline/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          projectName: `${brief.project.name} — Inspired by ${domain}`,
          device: "DESKTOP",
          format: "html",
        }),
        signal: AbortSignal.timeout(90_000),
      });

      if (res.ok) {
        const data = await res.json();
        results.push({
          refUrl: insp.url,
          refDomain: domain,
          imageUrl: data.imageUrl || data.preview || "",
          stitchProjectId: data.projectId || data.id || "",
          status: "success",
        });
        onProgress(insp.url, "ready");
        continue;
      }
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
