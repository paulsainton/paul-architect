import type { Inspiration, Brand, Brief } from "@/types/pipeline";

const STITCH_API = "http://localhost:3012";
const STITCH_URL = "https://stitch.ps-tools.dev";

interface MaquetteResult {
  refUrl: string;
  refDomain: string;
  imageUrl?: string;
  stitchProjectId?: string;
  stitchDashboardUrl?: string;
  status: "success" | "fallback" | "failed";
  message?: string;
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

    // Slug Stitch unique par inspiration
    const slug = `${brief.project.slug}-${domain}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);

    // Prompt ultra-cibl\u00e9
    const description = `Design pour ${brief.project.name} (${brief.project.type}, secteur ${brief.project.sector}) inspir\u00e9 de ${insp.url}.
Palette : primary ${brand.palette.primary}, secondary ${brand.palette.secondary}, accent ${brand.palette.accent}.
Typo heading ${brand.typography.heading}, body ${brand.typography.body}.
Mood : ${brief.paul.mood}. Device : ${brief.paul.device}.
Audience : ${brief.paul.audience.slice(0, 200)}.`;

    try {
      // 1. Cr\u00e9er le projet Stitch (409 = existe d\u00e9j\u00e0, ok)
      const createRes = await fetch(`${STITCH_API}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: `${brief.project.name} — ${domain}`,
          type: brief.project.type === "mobile" ? "mobile" : "webapp",
          sector: brief.project.sector || "design",
          targetAudience: brief.paul.audience?.slice(0, 300) || "general",
          description: description.slice(0, 500),
          features: brief.paul.priorities.slice(0, 5),
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!createRes.ok && createRes.status !== 409) {
        const errText = await createRes.text().catch(() => "");
        throw new Error(`create project failed: ${createRes.status} ${errText.slice(0, 100)}`);
      }

      // 2. Lancer le pipeline Stitch
      const runRes = await fetch(`${STITCH_API}/api/pipeline/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!runRes.ok) throw new Error("stitch run failed");
      const { runId: stitchRunId } = await runRes.json();

      // 3. Retourner imm\u00e9diatement avec l'URL du dashboard Stitch
      // Le pipeline Stitch n\u00e9cessite validations user (bench selection, screens) \u2014 ne peut pas \u00eatre fully automatis\u00e9
      results.push({
        refUrl: insp.url,
        refDomain: domain,
        stitchProjectId: slug,
        stitchDashboardUrl: `${STITCH_URL}/project/${slug}?run=${stitchRunId}`,
        status: "success",
        message: "Projet Stitch cr\u00e9\u00e9. Ouvre le dashboard pour continuer (bench selection, validations screens).",
      });
      onProgress(insp.url, "ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        refUrl: insp.url,
        refDomain: domain,
        stitchDashboardUrl: `${STITCH_URL}/projects`,
        status: "fallback",
        message: `Stitch indisponible (${msg.slice(0, 80)}). Ouvre Stitch manuellement pour cr\u00e9er le projet.`,
      });
      onProgress(insp.url, "fallback");
    }
  }

  return results;
}
