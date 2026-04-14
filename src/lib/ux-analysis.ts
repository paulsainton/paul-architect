import type { Brief, Brand, MergedTokens, PersonaAnalysis } from "@/types/pipeline";

interface AnalysisContext {
  brief: Brief;
  brand: Brand;
  tokens: MergedTokens;
  inspirationsCount: number;
}

const PERSONAS: { name: string; role: string; systemPrompt: (ctx: AnalysisContext) => string }[] = [
  {
    name: "Architecte Info",
    role: "Architecture de l'information",
    systemPrompt: (ctx) =>
      `Tu es un expert en architecture de l'information. Analyse le projet "${ctx.brief.project.name}" (${ctx.brief.project.type}, secteur: ${ctx.brief.project.sector}).
Pages détectées: ${ctx.brief.detected.pages.join(", ")}.
Audience: ${ctx.brief.paul.audience}.
Device: ${ctx.brief.paul.device}.
Basé sur l'analyse de ${ctx.inspirationsCount} sites de référence, recommande la structure de navigation optimale, la hiérarchie des pages, et le flux utilisateur principal.`,
  },
  {
    name: "Intégrateur UI",
    role: "Organisation des blocs UI",
    systemPrompt: (ctx) =>
      `Tu es un expert en intégration UI. Pour le projet "${ctx.brief.project.name}", organise les blocs extraits des ${ctx.inspirationsCount} références.
Composants existants: ${ctx.brief.detected.components.slice(0, 10).join(", ")}.
Fonctionnalités: ${ctx.brief.paul.priorities.join(", ")}.
Mood: ${ctx.brief.paul.mood}.
Recommande comment structurer chaque page avec les blocs extraits.`,
  },
  {
    name: "Cohérence Brand",
    role: "Cohérence de la marque",
    systemPrompt: (ctx) =>
      `Tu es un expert en cohérence de marque. Le projet "${ctx.brief.project.name}" utilise la palette: primary ${ctx.brand.palette.primary}, secondary ${ctx.brand.palette.secondary}, accent ${ctx.brand.palette.accent}.
Typo: heading ${ctx.brand.typography.heading}, body ${ctx.brand.typography.body}.
Pour chaque page (${ctx.brief.detected.pages.join(", ")}), recommande comment appliquer ces tokens de manière cohérente.`,
  },
  {
    name: "Dev Technique",
    role: "Architecture technique React",
    systemPrompt: (ctx) =>
      `Tu es un expert React/Next.js. Pour "${ctx.brief.project.name}" (${ctx.brief.stack.framework}, ${ctx.brief.stack.ui}):
Pages: ${ctx.brief.detected.pages.join(", ")}.
Composants existants: ${ctx.brief.detected.components.slice(0, 15).join(", ")}.
Recommande les composants React à créer, les patterns de réutilisation, et les contraintes techniques Next.js à respecter.`,
  },
];

export async function runAnalysis(
  ctx: AnalysisContext,
  onPersonaStart: (name: string, role: string) => void,
  onPersonaChunk: (name: string, text: string) => void,
  onPersonaComplete: (name: string, summary: string) => void
): Promise<PersonaAnalysis[]> {
  const results: PersonaAnalysis[] = [];

  for (const persona of PERSONAS) {
    onPersonaStart(persona.name, persona.role);

    const prompt = persona.systemPrompt(ctx);
    // L'analyse est générée localement — pas d'appel API Claude ici
    // car c'est Paul Architect qui orchestre, le contenu vient du contexte
    const analysis = generateLocalAnalysis(persona.name, ctx);

    // Simuler le streaming mot par mot
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
    results.push({
      name: persona.name,
      role: persona.role,
      summary: analysis,
      recommendations,
    });

    onPersonaComplete(persona.name, analysis.slice(0, 200));
  }

  return results;
}

function generateLocalAnalysis(personaName: string, ctx: AnalysisContext): string {
  const { brief, brand } = ctx;
  const pages = brief.detected.pages;
  const project = brief.project.name;

  switch (personaName) {
    case "Architecte Info":
      return `Pour ${project}, la navigation doit prioriser le device ${brief.paul.device}. Structure recommandée: ${pages.map((p, i) => `${i + 1}. ${p}`).join(", ")}. Le flux principal doit partir de la home vers les features prioritaires: ${brief.paul.priorities.join(", ")}. La sidebar est recommandée pour les dashboards, bottom nav pour le mobile. L'audience ${brief.paul.audience} attend un onboarding progressif.`;

    case "Intégrateur UI":
      return `Les ${ctx.inspirationsCount} références analysées montrent des patterns communs: hero section avec CTA, grille de features en 3 colonnes, testimonials, et footer riche. Pour ${project}, chaque page doit inclure: header avec navigation, zone de contenu structurée en sections, et footer. Composants réutilisables: ${brief.detected.components.slice(0, 5).join(", ")}. Mood "${brief.paul.mood}" implique des espaces généreux et des transitions douces.`;

    case "Cohérence Brand":
      return `Avec la palette primary ${brand.palette.primary} et secondary ${brand.palette.secondary}, chaque page doit utiliser: primary pour les CTAs et éléments d'action, secondary pour les accents et hover states, accent ${brand.palette.accent} pour les highlights. Background ${brand.palette.background} partout, surface ${brand.palette.surface} pour les cards. Typo heading ${brand.typography.heading} en bold pour les titres, ${brand.typography.body} regular pour le corps. Border-radius ${brand.borderRadius} pour la cohérence.`;

    case "Dev Technique":
      return `Architecture Next.js App Router recommandée. Composants à créer: Layout (shared), ${pages.map((p) => `${p}Page`).join(", ")}. State management: Zustand pour l'état global, React state pour le local. Optimisations: Image component pour les médias, dynamic imports pour les composants lourds, SSR pour le SEO. Contraintes: toutes les pages doivent être responsive (${brief.paul.device}), Tailwind utilities pour le styling, pas de CSS-in-JS.`;

    default:
      return `Analyse complète pour ${project}.`;
  }
}

function extractRecommendations(text: string): string[] {
  const sentences = text.split(/[.!]\s+/);
  return sentences.filter((s) => s.length > 20).slice(0, 5).map((s) => s.trim() + ".");
}
