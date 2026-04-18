import type { BrandOption, MergedTokens, Brief } from "@/types/pipeline";

const STITCH_API = "http://localhost:3012";

interface StitchGenerateResult {
  projectId: string;
  imageUrl: string;
  html: string;
}

async function callStitch(prompt: string, projectName: string): Promise<StitchGenerateResult | null> {
  try {
    // 1. Créer ou récupérer un projet Stitch
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

    const createProjRes = await fetch(`${STITCH_API}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        name: projectName,
        type: "webapp",
        sector: "design",
        targetAudience: "general",
        description: prompt.slice(0, 500),
        features: ["hero", "features", "footer"],
      }),
      signal: AbortSignal.timeout(10_000),
    });

    // 409 = déjà existe, on peut continuer
    if (!createProjRes.ok && createProjRes.status !== 409) return null;

    // 2. Lancer le pipeline avec le slug
    const runRes = await fetch(`${STITCH_API}/api/pipeline/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!runRes.ok) return null;
    const { runId } = await runRes.json();
    if (!runId) return null;

    // 3. Attendre la fin via stream (max 90s)
    const deadline = Date.now() + 90_000;
    let imageUrl = "";
    let html = "";

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(`${STITCH_API}/api/pipeline/list?runId=${runId}`, {
        signal: AbortSignal.timeout(5_000),
      }).catch(() => null);
      if (!statusRes?.ok) continue;
      const status = await statusRes.json().catch(() => null);
      if (status?.imageUrl || status?.preview) {
        imageUrl = status.imageUrl || status.preview;
        html = status.html || "";
        break;
      }
      if (status?.status === "completed" || status?.status === "failed") break;
    }

    return { projectId: slug, imageUrl, html };
  } catch {
    return null;
  }
}

function extractTokensFromHtml(html: string): { palette: BrandOption["palette"]; typography: BrandOption["typography"] } {
  const colors = Array.from(html.matchAll(/#([0-9a-fA-F]{6})\b/g)).map((m) => `#${m[1]}`);
  const fonts = Array.from(html.matchAll(/font-family:\s*["']?([^"';,}]+)/gi)).map((m) => m[1].trim());
  const uniqueColors = [...new Set(colors)];

  return {
    palette: {
      primary: uniqueColors[0] || "#6366F1",
      secondary: uniqueColors[1] || "#4ECDC4",
      accent: uniqueColors[2] || "#FFE66D",
      background: uniqueColors[3] || "#FEFAE0",
      surface: uniqueColors[4] || "#FFFFFF",
      text: uniqueColors[5] || "#1A1A1A",
      textSecondary: uniqueColors[6] || "#5A5A5A",
    },
    typography: {
      heading: fonts[0] || "Inter",
      body: fonts[1] || fonts[0] || "Inter",
    },
  };
}

export async function generateBrandOptions(
  tokens: MergedTokens,
  brief: Brief,
  onProgress: (option: string, status: string) => void
): Promise<BrandOption[]> {
  const dominantColors = tokens.colors.slice(0, 5).map((c) => c.hex);
  const dominantFonts = tokens.fonts.slice(0, 3).map((f) => f.family);

  const prompts: { option: "A" | "B" | "C"; prompt: string }[] = [
    {
      option: "A",
      prompt: `Cr\u00e9e une identit\u00e9 visuelle pour "${brief.project.name}" (${brief.project.type}, secteur: ${brief.project.sector}).
Ambiance: ${brief.paul.mood || "moderne et professionnel"}.
Base-toi sur la palette dominante: ${dominantColors.join(", ")}.
Typographie inspir\u00e9e de: ${dominantFonts.join(", ")}.
Audience: ${brief.paul.audience || "grand public"}.
G\u00e9n\u00e8re un design complet avec header, hero, features, footer.`,
    },
    {
      option: "B",
      prompt: `Cr\u00e9e une identit\u00e9 visuelle harmonieuse pour "${brief.project.name}" (${brief.project.type}).
Harmonise les palettes extraites: ${dominantColors.join(", ")}.
Style: ${brief.paul.mood || "minimaliste et \u00e9l\u00e9gant"}.
Device: ${brief.paul.device}.
G\u00e9n\u00e8re un design qui unifie toutes les inspirations en un style coh\u00e9rent.`,
    },
    {
      option: "C",
      prompt: `Cr\u00e9e une identit\u00e9 visuelle contrastante pour "${brief.project.name}" (${brief.project.type}).
Utilise des couleurs compl\u00e9mentaires de: ${dominantColors[0] || "#6366F1"}.
Style audacieux et diff\u00e9renci\u00e9. Secteur: ${brief.project.sector}.
G\u00e9n\u00e8re un design qui se d\u00e9marque des concurrents tout en restant professionnel.`,
    },
  ];

  const results: BrandOption[] = [];

  for (const { option, prompt } of prompts) {
    onProgress(option, "generating");

    const stitch = await callStitch(prompt, `${brief.project.name} - Option ${option}`);

    let palette: BrandOption["palette"];
    let typography: BrandOption["typography"];

    if (stitch?.html) {
      const extracted = extractTokensFromHtml(stitch.html);
      palette = extracted.palette;
      typography = extracted.typography;
    } else {
      // Fallback avec les tokens extraits
      const offset = results.length * 2;
      palette = {
        primary: dominantColors[offset] || "#6366F1",
        secondary: dominantColors[offset + 1] || "#4ECDC4",
        accent: dominantColors[offset + 2] || "#FFE66D",
        background: "#FEFAE0",
        surface: "#FFFFFF",
        text: "#1A1A1A",
        textSecondary: "#5A5A5A",
      };
      typography = {
        heading: dominantFonts[0] || "Inter",
        body: dominantFonts[1] || "Inter",
      };
    }

    results.push({
      option,
      palette,
      typography,
      borderRadius: "12px",
      imageUrl: stitch?.imageUrl,
      stitchProjectId: stitch?.projectId,
    });

    onProgress(option, "ready");
  }

  return results;
}
