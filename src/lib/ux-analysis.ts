import type { Brief, Brand, MergedTokens, PersonaAnalysis, Inspiration } from "@/types/pipeline";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { CONFIG } from "./config";

interface ExtractionData {
  domain: string;
  designMd?: string;
  layout?: string;
  tokens?: { colors?: string[]; fonts?: string[]; spacing?: string[] };
  url: string;
}

interface AnalysisContext {
  brief: Brief;
  brand: Brand;
  tokens: MergedTokens;
  inspirationsCount: number;
  inspirations?: Inspiration[];
  extractions?: ExtractionData[];
  runId?: string;
}

const PA_DATA = `${CONFIG.PA_DATA_DIR}/extractions`;
const CLONE_EXTRACTIONS = `${CONFIG.CLONE_ARCHITECT_DIR}/extractions`;

/**
 * Charger les extractions Clone par inspiration depuis disk.
 * Lit DESIGN.md, layout-analysis.md, tokens.json pour chaque domain.
 */
export function loadExtractions(runId: string, inspirations: Inspiration[]): ExtractionData[] {
  const results: ExtractionData[] = [];
  for (const insp of inspirations) {
    let domain = "unknown";
    try {
      const u = insp.cloneUrl || insp.url;
      domain = new URL(u).hostname.replace(/^www\./, "");
    } catch { /* ignore */ }

    const candidates = [join(PA_DATA, runId, domain), join(CLONE_EXTRACTIONS, domain)];
    const data: ExtractionData = { domain, url: insp.url };

    for (const base of candidates) {
      if (!existsSync(base)) continue;
      try {
        const designPath = join(base, "DESIGN.md");
        if (existsSync(designPath)) data.designMd = readFileSync(designPath, "utf-8").slice(0, 1500);

        const layoutPath = join(base, "layout-analysis.md");
        if (existsSync(layoutPath)) data.layout = readFileSync(layoutPath, "utf-8").slice(0, 1000);

        const tokensPath = join(base, "tokens.json");
        if (existsSync(tokensPath)) {
          try {
            const raw = JSON.parse(readFileSync(tokensPath, "utf-8"));
            const colors: string[] = [];
            const flatten = (o: unknown): void => {
              if (typeof o === "string" && /^(#|rgb)/.test(o)) colors.push(o);
              else if (Array.isArray(o)) o.forEach(flatten);
              else if (o && typeof o === "object") Object.values(o).forEach(flatten);
            };
            flatten(raw.colors);
            const fonts: string[] = [];
            if (raw.typography?.fontFamily) fonts.push(...Object.values(raw.typography.fontFamily).filter((v): v is string => typeof v === "string"));
            const spacing: string[] = [];
            if (raw.spacing && typeof raw.spacing === "object") {
              spacing.push(...Object.values(raw.spacing).filter((v): v is string => typeof v === "string"));
            }
            data.tokens = { colors: colors.slice(0, 8), fonts: fonts.slice(0, 4), spacing: spacing.slice(0, 6) };
          } catch { /* invalid JSON */ }
        }
        break;
      } catch { /* permission denied */ }
    }
    results.push(data);
  }
  return results;
}

const PERSONAS = [
  { name: "Architecte Info", role: "Architecture de l'information" },
  { name: "Intégrateur UI", role: "Organisation des blocs UI" },
  { name: "Cohérence Brand", role: "Cohérence de la marque" },
  { name: "Dev Technique", role: "Architecture technique React" },
];

export async function runAnalysis(
  ctx: AnalysisContext,
  onPersonaStart: (name: string, role: string) => void,
  onPersonaChunk: (name: string, text: string) => void,
  onPersonaComplete: (name: string, summary: string) => void
): Promise<PersonaAnalysis[]> {
  const results: PersonaAnalysis[] = [];

  // Charger extractions si pas déjà fait + runId fourni
  if (!ctx.extractions && ctx.runId && ctx.inspirations) {
    ctx.extractions = loadExtractions(ctx.runId, ctx.inspirations);
  }

  for (const persona of PERSONAS) {
    onPersonaStart(persona.name, persona.role);
    const analysis = generateGroundedAnalysis(persona.name, ctx);

    const words = analysis.split(" ");
    let accumulated = "";
    for (let i = 0; i < words.length; i++) {
      accumulated += (i > 0 ? " " : "") + words[i];
      if (i % 5 === 0) {
        onPersonaChunk(persona.name, accumulated);
        await new Promise((r) => setTimeout(r, 30));
      }
    }
    onPersonaChunk(persona.name, accumulated);

    const recommendations = extractRecommendations(analysis);
    results.push({ name: persona.name, role: persona.role, summary: analysis, recommendations });
    onPersonaComplete(persona.name, analysis.slice(0, 200));
  }

  return results;
}

/**
 * Analyse GROUNDED : utilise les vraies extractions Clone comme base, pas du template.
 */
function generateGroundedAnalysis(personaName: string, ctx: AnalysisContext): string {
  const { brief, brand, extractions = [] } = ctx;
  const pages = brief.detected.pages;
  const project = brief.project.name;
  const refs = extractions.filter((e) => e.designMd || e.layout || e.tokens);
  const refDomains = refs.map((e) => e.domain);
  const refsLine = refDomains.length > 0 ? `Références extraites : ${refDomains.join(", ")}.` : "Aucune référence extraite analysable.";

  switch (personaName) {
    case "Architecte Info": {
      // Analyse layout patterns observés dans les extractions
      const layoutInsights: string[] = [];
      for (const ref of refs) {
        if (ref.layout) {
          const sectionsCount = (ref.layout.match(/section|nav|header|footer/gi) || []).length;
          if (sectionsCount > 0) layoutInsights.push(`${ref.domain} : ${sectionsCount} blocs structurels détectés`);
        }
      }
      const insights = layoutInsights.length > 0 ? `Patterns observés : ${layoutInsights.join(" ; ")}.` : "";
      return `Pour ${project}, la navigation doit prioriser le device ${brief.paul.device}. ${refsLine} Structure recommandée basée sur les ${pages.length} pages : ${pages.slice(0, 5).map((p, i) => `${i + 1}. ${p}`).join(", ")}. ${insights} Le flux principal doit partir de la home vers les features prioritaires : ${brief.paul.priorities.slice(0, 3).join(", ")}. ${brief.paul.device === "mobile" ? "Bottom nav préférée (5 onglets max)." : "Sidebar recommandée pour les dashboards."} L'audience "${brief.paul.audience.slice(0, 80)}" attend un onboarding progressif (3 étapes max).`;
    }

    case "Intégrateur UI": {
      // Patterns de composants concrets extraits des refs
      const observedPatterns: string[] = [];
      for (const ref of refs) {
        if (ref.designMd) {
          const heroMatch = ref.designMd.match(/hero|héros|landing/i);
          const cardsMatch = ref.designMd.match(/card|carte|grid/i);
          const ctaMatch = ref.designMd.match(/cta|button|bouton/i);
          const matched: string[] = [];
          if (heroMatch) matched.push("hero");
          if (cardsMatch) matched.push("cards");
          if (ctaMatch) matched.push("CTA");
          if (matched.length > 0) observedPatterns.push(`${ref.domain}: ${matched.join("+")}`);
        }
      }
      const patternsLine = observedPatterns.length > 0 ? `Patterns concrets : ${observedPatterns.join(" ; ")}.` : "";
      return `Les ${refs.length} références extraites de ${project} montrent : ${refsLine} ${patternsLine} Pour ${project}, chaque page doit inclure header navigation + zone contenu sections + footer. Composants réutilisables détectés : ${brief.detected.components.slice(0, 5).join(", ") || "à créer"}. Mood "${brief.paul.mood}" implique espaces généreux ${/calme|focus|minimal/i.test(brief.paul.mood) ? "(padding 24-32px)" : "(padding 16-24px)"} et transitions douces (200-300ms).`;
    }

    case "Cohérence Brand": {
      // Comparer brand.palette aux palettes extraites
      const paletteDeltas: string[] = [];
      for (const ref of refs) {
        if (ref.tokens?.colors && ref.tokens.colors.length > 0) {
          paletteDeltas.push(`${ref.domain} (${ref.tokens.colors.slice(0, 3).join(", ")})`);
        }
      }
      const deltaLine = paletteDeltas.length > 0 ? `Palettes des références : ${paletteDeltas.join(" ; ")}.` : "";
      return `Avec la palette validée primary ${brand.palette.primary} / secondary ${brand.palette.secondary} / accent ${brand.palette.accent}, chaque page doit : (1) primary pour CTAs et liens actifs, (2) secondary pour hover/focus states, (3) accent ${brand.palette.accent} réservé highlights critiques (max 3 par page). ${deltaLine} Background ${brand.palette.background} fond default, surface ${brand.palette.surface} pour cards/modals. Typography heading ${brand.typography.heading} (700/600), body ${brand.typography.body} (400-500). Border-radius ${brand.borderRadius} uniforme partout, shadows max 2 niveaux.`;
    }

    case "Dev Technique": {
      // Stack-aware : recommandations en fonction du framework détecté
      const isMobile = brief.paul.device === "mobile" || brief.project.type === "mobile";
      const isExpo = brief.stack.framework.toLowerCase().includes("expo") || brief.stack.framework.toLowerCase().includes("react native");
      const stackTips = isExpo
        ? "Expo Router : organise les pages dans app/(tabs)/. NativeWind pour Tailwind. expo-image pour les images optimisées."
        : isMobile
          ? "React Native + Tailwind via NativeWind. Stack Navigation."
          : "Next.js App Router (server components default). Tailwind utilities. Next/Image obligatoire.";
      return `Pour ${project} (${brief.stack.framework} + ${brief.stack.ui}) : ${stackTips} Composants à créer : Layout shared + ${pages.slice(0, 4).map((p) => `${p.charAt(0).toUpperCase() + p.slice(1)}Page`).join(", ")}. State : ${brief.stack.state || "Zustand"} pour global, useState pour local. Optimisations : lazy loading composants > 50KB, suspense boundaries, debounce search (300ms). Contraintes responsive : ${brief.paul.device}. ${refsLine}`;
    }

    default:
      return `Analyse complète pour ${project} basée sur ${refs.length} références extraites.`;
  }
}

function extractRecommendations(text: string): string[] {
  const sentences = text.split(/[.!]\s+/);
  return sentences.filter((s) => s.length > 20).slice(0, 5).map((s) => s.trim() + ".");
}
