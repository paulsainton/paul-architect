import type { Inspiration, Brand, Brief } from "@/types/pipeline";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { CONFIG } from "./config";
const STITCH_API = CONFIG.STITCH_API;
const STITCH_URL = CONFIG.STITCH_PUBLIC_URL;
const CLONE_EXTRACTIONS = `${CONFIG.CLONE_ARCHITECT_DIR}/extractions`;
const PA_DATA = `${CONFIG.PA_DATA_DIR}/extractions`;

interface MaquetteResult {
  refUrl: string;
  refDomain: string;
  imageUrl?: string;
  stitchProjectSlug?: string;
  stitchRunId?: string;
  stitchDashboardUrl?: string;
  status: "success" | "fallback" | "failed";
  message?: string;
  promptUsed?: string;
}

/**
 * Lire les outputs clone-architect pour enrichir le prompt Stitch
 */
function readExtractionContext(runId: string, domain: string): {
  tokens?: string;
  designMd?: string;
  layout?: string;
} {
  const ctx: { tokens?: string; designMd?: string; layout?: string } = {};

  // Chercher dans /opt/paul-architect/data puis dans /home/paul/clone-architect
  const candidates = [
    join(PA_DATA, runId, domain),
    join(CLONE_EXTRACTIONS, domain),
  ];

  for (const base of candidates) {
    if (!existsSync(base)) continue;

    try {
      const tokensPath = join(base, "tokens.json");
      if (existsSync(tokensPath) && !ctx.tokens) {
        ctx.tokens = readFileSync(tokensPath, "utf-8").slice(0, 2000);
      }
      const designPath = join(base, "DESIGN.md");
      if (existsSync(designPath) && !ctx.designMd) {
        ctx.designMd = readFileSync(designPath, "utf-8").slice(0, 3000);
      }
      const layoutPath = join(base, "layout-analysis.md");
      if (existsSync(layoutPath) && !ctx.layout) {
        ctx.layout = readFileSync(layoutPath, "utf-8").slice(0, 2000);
      }
      break; // premier trouv\u00e9 = OK
    } catch { /* ignore */ }
  }

  return ctx;
}

/**
 * Construire un nom Stitch riche bas\u00e9 sur l'inspiration + le projet
 */
function buildStitchProjectName(brief: Brief, insp: Inspiration, domain: string): string {
  const styles = (insp.visualStyles || []).slice(0, 2).join(", ");
  const device = brief.paul.device === "mobile" ? "Mobile" : brief.paul.device === "desktop" ? "Desktop" : "Responsive";
  const sector = brief.project.sector.split(" ")[0];

  // Format: "LIFEOS \u00d7 Notion \u2014 Productivity daily view (minimalist, dark)"
  const parts = [
    `${brief.project.name} \u00d7 ${domain.replace(/\..+$/, "")}`,
    `${sector} ${device}`,
  ];
  if (styles) parts.push(`(${styles})`);
  return parts.join(" \u2014 ").slice(0, 120);
}

/**
 * Construire un slug Stitch propre
 */
function buildStitchSlug(brief: Brief, domain: string, inspId: string): string {
  const base = `${brief.project.slug}-${domain.replace(/\..+$/, "")}-${inspId}`;
  return base.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/**
 * Construire un prompt unique pour chaque inspiration \u2014 pas de g\u00e9n\u00e9rique
 */
function buildUniquePrompt(brief: Brief, brand: Brand, insp: Inspiration, extraction: ReturnType<typeof readExtractionContext>): string {
  const inspFeatures = (insp.keyFeatures || []).slice(0, 3).join(", ");
  const inspStyles = (insp.visualStyles || []).slice(0, 3).join(", ");
  const inspTags = (insp.tags || []).slice(0, 5).join(", ");

  const lines: string[] = [];

  // Section 1 : projet cible
  lines.push(`# Projet : ${brief.project.name}`);
  lines.push(`Type : ${brief.project.type} \u00b7 Secteur : ${brief.project.sector} \u00b7 Device : ${brief.paul.device}`);
  lines.push(`Audience : ${brief.paul.audience.slice(0, 250)}`);
  lines.push(`Mood : ${brief.paul.mood}`);
  lines.push(`Vision : ${brief.paul.vision}`);
  if (brief.paul.priorities.length > 0) {
    lines.push(`Priorit\u00e9s produit : ${brief.paul.priorities.slice(0, 4).join(" \u00b7 ")}`);
  }

  // Section 2 : inspiration sp\u00e9cifique (ce qui diff\u00e9rencie ce prompt)
  lines.push(``);
  lines.push(`# Inspiration : ${insp.title}`);
  lines.push(`Source : ${insp.url}`);
  if (inspStyles) lines.push(`Styles visuels extraits : ${inspStyles}`);
  if (insp.colorScheme) lines.push(`Color scheme : ${insp.colorScheme}`);
  if (inspFeatures) lines.push(`Features inspirantes : ${inspFeatures}`);
  if (inspTags) lines.push(`Tags : ${inspTags}`);
  if (insp.description) lines.push(`Description : ${insp.description.slice(0, 300)}`);

  // Section 3 : tokens extraits par Clone Architect (DIFF\u00c9RENCIATEUR)
  if (extraction.tokens) {
    lines.push(``);
    lines.push(`# Design system extrait (tokens.json)`);
    lines.push("```json");
    lines.push(extraction.tokens);
    lines.push("```");
  }
  if (extraction.designMd) {
    lines.push(``);
    lines.push(`# Analyse design de la r\u00e9f\u00e9rence (extrait DESIGN.md)`);
    lines.push(extraction.designMd);
  }
  if (extraction.layout) {
    lines.push(``);
    lines.push(`# Layout analysis`);
    lines.push(extraction.layout);
  }

  // Section 4 : brand valid\u00e9 par Paul
  lines.push(``);
  lines.push(`# Brand valid\u00e9`);
  lines.push(`Palette : primary ${brand.palette.primary} \u00b7 secondary ${brand.palette.secondary} \u00b7 accent ${brand.palette.accent}`);
  lines.push(`Background ${brand.palette.background} \u00b7 Surface ${brand.palette.surface}`);
  lines.push(`Text ${brand.palette.text} \u00b7 Text secondary ${brand.palette.textSecondary}`);
  lines.push(`Typography : heading ${brand.typography.heading} \u00b7 body ${brand.typography.body}`);
  lines.push(`Border radius : ${brand.borderRadius}`);

  // Section 5 : directive finale
  lines.push(``);
  lines.push(`# Directive`);
  lines.push(`Reproduis EXACTEMENT la structure layout de ${insp.url} (hero, sections, navigation, footer).`);
  lines.push(`Utilise STRICTEMENT la palette brand ci-dessus (pas d'autre couleur).`);
  lines.push(`Typography : ${brand.typography.heading} (headings) + ${brand.typography.body} (body).`);
  lines.push(`Respecte le mood "${brief.paul.mood}" et l'audience "${brief.paul.audience.slice(0, 100)}".`);
  lines.push(`Device prioritaire : ${brief.paul.device}.`);

  return lines.join("\n").slice(0, 3800); // Stitch limite ~4000 chars
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

    const slug = buildStitchSlug(brief, domain, insp.id);
    const projectName = buildStitchProjectName(brief, insp, domain);
    const extraction = readExtractionContext(runId, domain);
    const prompt = buildUniquePrompt(brief, brand, insp, extraction);

    try {
      // 1. Cr\u00e9er le projet Stitch avec nom riche + description unique
      const createRes = await fetch(`${STITCH_API}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: projectName,
          type: brief.project.type === "mobile" ? "mobile" : "webapp",
          sector: brief.project.sector || "design",
          targetAudience: brief.paul.audience?.slice(0, 300) || "general",
          description: prompt.slice(0, 500),
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

      results.push({
        refUrl: insp.url,
        refDomain: domain,
        stitchProjectSlug: slug,
        stitchRunId,
        stitchDashboardUrl: `${STITCH_URL}/project/${slug}?run=${stitchRunId}`,
        status: "success",
        message: `Projet "${projectName}" cr\u00e9\u00e9 dans Stitch avec prompt unique (${prompt.length} chars).`,
        promptUsed: prompt,
      });
      onProgress(insp.url, "ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        refUrl: insp.url,
        refDomain: domain,
        stitchDashboardUrl: `${STITCH_URL}/projects`,
        status: "fallback",
        message: `Stitch indisponible (${msg.slice(0, 80)}). Ouvre Stitch manuellement.`,
      });
      onProgress(insp.url, "fallback");
    }
  }

  return results;
}
