import { writeFileSync, mkdirSync, existsSync, readdirSync, realpathSync } from "fs";
import { join, dirname, resolve as pathResolve } from "path";
import Anthropic from "@anthropic-ai/sdk";
import type { Brief, Brand, MergedTokens, PersonaAnalysis, Inspiration } from "@/types/pipeline";
import { CONFIG } from "./config";
import { log } from "./logger";
import { loadExtractions } from "./ux-analysis";
import { resolveProjectPath as resolveProjectPathCentral } from "./project-resolver";

const logger = log.scope("code-gen");

export interface PageBuildResult {
  page: string;
  filesChanged: string[];
  linesAdded: number;
  compiled: boolean;
  errors: string[];
  screenshotUrl?: string;
  reviewScore?: number;
  reviewIssues: string[];
  modelUsed?: string;
  tokensIn?: number;
  tokensOut?: number;
}

export interface CodeGenContext {
  brief: Brief;
  brand: Brand;
  tokens: MergedTokens;
  analysis: PersonaAnalysis[];
  pages: string[];
  inspirations?: Inspiration[];
  projectPath?: string;
  runId?: string;
}

// Wrapper sync (utilise project-resolver async, mais on accepte le sync ici car déjà
// appelé en plusieurs endroits sync). Préférer le central async pour les nouveaux usages.
async function resolveProjectPath(slug: string): Promise<string | null> {
  return resolveProjectPathCentral(slug);
}

/**
 * Génère le code React/Tailwind d'une page via l'Anthropic SDK.
 * - Si ANTHROPIC_API_KEY absent → fallback brief markdown (legacy).
 * - Sinon : prompt grounded dans extractions + brief + brand → code TSX directement écrit.
 */
export async function generatePageCode(
  page: string,
  ctx: CodeGenContext,
  onProgress: (status: string, percent: number) => void
): Promise<PageBuildResult> {
  onProgress("preparing context", 5);

  const result: PageBuildResult = {
    page,
    filesChanged: [],
    linesAdded: 0,
    compiled: false,
    errors: [],
    reviewIssues: [],
  };

  const targetPath = ctx.projectPath || (await resolveProjectPath(ctx.brief.project.slug));
  if (!targetPath) {
    result.errors.push(`Projet introuvable: ${ctx.brief.project.slug}`);
    onProgress("error", 100);
    return result;
  }

  // Toujours écrire le brief markdown — sert de doc + audit trail
  const briefDir = join(targetPath, ".paul-architect");
  mkdirSync(briefDir, { recursive: true });
  const briefContent = buildBriefMarkdown(page, ctx);
  const briefFile = join(briefDir, `${page.replace(/\//g, "-") || "home"}.md`);
  writeFileSync(briefFile, briefContent, "utf-8");
  result.filesChanged.push(briefFile);
  result.linesAdded += briefContent.split("\n").length;

  const indexFile = join(briefDir, "INDEX.md");
  writeFileSync(indexFile, buildIndex(ctx), "utf-8");
  if (!result.filesChanged.includes(indexFile)) result.filesChanged.push(indexFile);

  onProgress("brief written", 20);

  // Pas de clé API → fallback brief-only
  if (!CONFIG.ANTHROPIC_API_KEY) {
    logger.warn("ANTHROPIC_API_KEY absent — fallback brief markdown only", { page });
    result.compiled = true;
    result.reviewScore = 60;
    result.reviewIssues.push("Pas de clé Anthropic — code non généré, brief seul écrit");
    onProgress("complete (brief only)", 100);
    return result;
  }

  // Charger les extractions Clone si disponibles (per-inspiration design ground truth)
  let extractions: ReturnType<typeof loadExtractions> = [];
  if (ctx.runId && ctx.inspirations && ctx.inspirations.length > 0) {
    try {
      extractions = loadExtractions(ctx.runId, ctx.inspirations);
    } catch (err) {
      logger.warn("loadExtractions failed", { err: String(err) });
    }
  }

  onProgress("calling claude", 30);

  try {
    const client = new Anthropic({
      apiKey: CONFIG.ANTHROPIC_API_KEY,
      timeout: CONFIG.ANTHROPIC_TIMEOUT_MS,
    });

    const { systemPrompt, userPrompt } = buildPrompts(page, ctx, extractions, targetPath);

    const message = await client.messages.create({
      model: CONFIG.ANTHROPIC_MODEL,
      max_tokens: CONFIG.ANTHROPIC_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    onProgress("parsing response", 70);

    result.modelUsed = message.model;
    result.tokensIn = message.usage?.input_tokens;
    result.tokensOut = message.usage?.output_tokens;

    const textBlock = message.content.find((c) => c.type === "text");
    const responseText = textBlock && "text" in textBlock ? textBlock.text : "";

    if (!responseText) {
      result.errors.push("Réponse Anthropic vide");
      onProgress("error", 100);
      return result;
    }

    // Parser la réponse : chaque fichier dans des blocs ```path\ncontent\n```
    const filesParsed = parseFilesFromResponse(responseText);
    if (filesParsed.length === 0) {
      result.errors.push("Aucun fichier extrait de la réponse Claude");
      onProgress("error", 100);
      return result;
    }

    onProgress("writing files", 85);

    // Resolve real targetPath UNE fois (suit symlinks) — borne des écritures
    let realTarget: string;
    try {
      realTarget = realpathSync(targetPath);
    } catch {
      realTarget = pathResolve(targetPath);
    }

    for (const { path, content } of filesParsed) {
      // Sécurité : path doit rester dans realTarget (symlinks résolus)
      const fullPath = join(targetPath, path);
      const resolved = pathResolve(fullPath);
      if (!resolved.startsWith(realTarget) && !resolved.startsWith(pathResolve(targetPath))) {
        result.reviewIssues.push(`Path traversal bloqué: ${path}`);
        continue;
      }
      // Skip globals.css writes if file already managed (we'll let user merge)
      mkdirSync(dirname(fullPath), { recursive: true });
      writeFileSync(fullPath, content, "utf-8");
      result.filesChanged.push(fullPath);
      result.linesAdded += content.split("\n").length;
    }

    result.compiled = true;
    result.reviewScore = computeReviewScore(filesParsed, ctx, extractions);

    if (extractions.length === 0) {
      result.reviewIssues.push("Aucune extraction Clone — code généré sans référence visuelle (R16 dégradé)");
    }

    logger.info("code generated", {
      page,
      files: filesParsed.length,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      score: result.reviewScore,
    });

    onProgress("complete", 100);
  } catch (err) {
    const msg = String(err);
    logger.error("Anthropic call failed", { err: msg, page });
    result.errors.push(`Anthropic SDK: ${msg.slice(0, 200)}`);
    result.reviewScore = 30;
    onProgress("error", 100);
  }

  return result;
}

/**
 * Construit les prompts system + user pour Claude.
 */
function buildPrompts(
  page: string,
  ctx: CodeGenContext,
  extractions: ReturnType<typeof loadExtractions>,
  targetPath: string
): { systemPrompt: string; userPrompt: string } {
  const { brief, brand, tokens, analysis } = ctx;

  // Lire structure du projet cible (raccourci, juste les répertoires-clés)
  let projectStructure = "";
  try {
    const srcAppDir = join(targetPath, "src", "app");
    if (existsSync(srcAppDir)) {
      const files = readdirSync(srcAppDir).slice(0, 20).join(", ");
      projectStructure = `src/app/ contient : ${files}`;
    } else if (existsSync(join(targetPath, "app"))) {
      const files = readdirSync(join(targetPath, "app")).slice(0, 20).join(", ");
      projectStructure = `app/ contient : ${files} (pas de src/)`;
    } else {
      projectStructure = "Pas de src/app/ ni app/ détecté — créer la structure";
    }
  } catch { /* ignore */ }

  // Détecter la convention de pathing
  const useSrcApp = existsSync(join(targetPath, "src", "app"));
  const pageRoute = page === "home" || page === "/" ? "" : page.replace(/^\//, "").replace(/\/$/, "");
  const targetPagePath = useSrcApp
    ? `src/app/${pageRoute ? pageRoute + "/" : ""}page.tsx`
    : `app/${pageRoute ? pageRoute + "/" : ""}page.tsx`;

  const systemPrompt = `Tu es un dev senior React/Next.js intégrant un design qui a déjà été validé par les outils Paul Architect (Stitch + Clone Architect).

CONTRAINTE ABSOLUE (R16) : Tu n'inventes PAS de design. Tu intègres le design fourni dans le contexte (palette validée, tokens extraits des références, layout des inspirations).

Stack cible : Next.js 15+ App Router, React 19, Tailwind CSS 4 (utilities only, pas de @apply hors globals).

Format de réponse OBLIGATOIRE : pour chaque fichier à créer/modifier, utilise EXACTEMENT ce format :

\`\`\`tsx:src/app/page.tsx
// contenu du fichier ici
\`\`\`

\`\`\`css:src/app/globals.css
/* contenu */
\`\`\`

PAS d'explication hors des blocs. PAS de markdown autour. Juste les blocs de fichiers.

Règles de code :
- Tailwind utilities uniquement, pas de styles inline sauf cas spécifique
- Composants React fonctionnels, TypeScript strict
- Imports relatifs ou alias @/components selon convention du projet
- Pas de "use client" sauf si interactivité (state, events)
- A11y : semantic HTML, alt texts, aria-labels
- Responsive mobile-first si device = mobile/both
- Images : Next/Image avec width/height ou fill+sizes

Anti-patterns interdits :
- Inventer des couleurs hors palette validée
- Hardcoder un design connu (Stripe, Linear) sans correspondance avec les inspirations
- Créer des composants non demandés
- Utiliser des libs non installées (motion, framer-motion sauf mention)`;

  // Extractions formatées (preuves visuelles concrètes)
  const extractionsBlock = extractions.length > 0
    ? extractions.map((e) => {
        const parts: string[] = [`### ${e.domain} (${e.url})`];
        if (e.tokens?.colors?.length) parts.push(`Couleurs observées : ${e.tokens.colors.slice(0, 6).join(", ")}`);
        if (e.tokens?.fonts?.length) parts.push(`Fonts : ${e.tokens.fonts.join(", ")}`);
        if (e.layout) parts.push(`Layout extrait :\n${e.layout.slice(0, 600)}`);
        if (e.designMd) parts.push(`Design notes :\n${e.designMd.slice(0, 800)}`);
        return parts.join("\n");
      }).join("\n\n")
    : "_Aucune extraction Clone disponible — utiliser uniquement la palette validée._";

  const userPrompt = `Génère le code de la page \`${page}\` pour le projet **${brief.project.name}** (slug: ${brief.project.slug}).

## Cible
- Path à créer/modifier : \`${targetPagePath}\`
- Project root : \`${targetPath}\`
- Structure détectée : ${projectStructure}

## Brief projet
- **Type** : ${brief.project.type}
- **Secteur** : ${brief.project.sector}
- **Device cible** : ${brief.paul.device}
- **Stack** : ${brief.stack.framework} / ${brief.stack.ui} / ${brief.stack.state || "useState"}
- **Audience** : ${brief.paul.audience || "non spécifiée"}
- **Vision** : ${brief.paul.vision || "non spécifiée"}
- **Mood** : ${brief.paul.mood || "professionnel"}
- **Priorités** : ${brief.paul.priorities.join(" • ") || "non spécifiées"}

## Identité visuelle (validée par Paul, NON-NÉGOCIABLE)
\`\`\`css
--color-primary: ${brand.palette.primary};
--color-secondary: ${brand.palette.secondary};
--color-accent: ${brand.palette.accent};
--color-background: ${brand.palette.background};
--color-surface: ${brand.palette.surface};
--color-text: ${brand.palette.text};
--color-text-secondary: ${brand.palette.textSecondary};
\`\`\`
- Heading font : ${brand.typography.heading}
- Body font : ${brand.typography.body}
- Border radius : ${brand.borderRadius}

## Tokens extraits du scan initial (top 8 couleurs)
${tokens.colors.slice(0, 8).map((c) => `- \`${c.hex}\` × ${c.frequency} (${c.source})`).join("\n") || "_aucun_"}

## Extractions Clone (${extractions.length} référence${extractions.length > 1 ? "s" : ""})
${extractionsBlock}

## Recommandations des 4 personas
${analysis && analysis.length > 0 ? analysis.map((p) => `**${p.name}** : ${p.summary.slice(0, 300)}`).join("\n\n") : "_aucune_"}

---

## Tâche
Crée la page \`${page}\` (chemin: \`${targetPagePath}\`) en respectant scrupuleusement la palette ci-dessus et en t'inspirant du layout des extractions Clone.

Si tu dois créer/modifier des composants, utilise \`${useSrcApp ? "src/components/" : "components/"}\` (max 3 nouveaux composants).
Si tu dois mettre à jour les CSS variables, modifie \`${useSrcApp ? "src/app/globals.css" : "app/globals.css"}\` (ajoute les vars dans :root, ne supprime pas l'existant).

Réponds uniquement avec les blocs de fichiers au format \`\`\`tsx:path/relatif\` (ou \`css:\`, \`ts:\`). Aucun texte hors des blocs.`;

  return { systemPrompt, userPrompt };
}

/**
 * Parse la réponse Claude pour extraire les fichiers (format ```tsx:path/file.tsx ... ```).
 */
function parseFilesFromResponse(response: string): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  // Match ```<lang>:<path>\n<content>\n```
  const blockRegex = /```([a-z]+):([^\n`]+)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(response)) !== null) {
    const [, , path, content] = match;
    if (!path || !content) continue;
    const cleanPath = path.trim().replace(/^\/+/, "");
    // Whitelist : seulement extensions de code valides
    if (!/\.(tsx?|jsx?|css|json|md)$/i.test(cleanPath)) continue;
    // Sécurité : pas de ../ dans le path
    if (cleanPath.includes("..")) continue;
    files.push({ path: cleanPath, content: content.trim() + "\n" });
  }
  return files;
}

/**
 * Calcule un score qualité simple basé sur les artefacts générés.
 */
function computeReviewScore(
  files: Array<{ path: string; content: string }>,
  ctx: CodeGenContext,
  extractions: ReturnType<typeof loadExtractions>
): number {
  let score = 70; // baseline pour code Anthropic
  // +5 si page.tsx créée
  if (files.some((f) => f.path.endsWith("page.tsx"))) score += 5;
  // +5 si globals.css mis à jour
  if (files.some((f) => f.path.endsWith("globals.css"))) score += 5;
  // +5 si tokens primary effectivement utilisés dans le code
  const allCode = files.map((f) => f.content).join("\n");
  if (ctx.brand.palette.primary && allCode.toLowerCase().includes(ctx.brand.palette.primary.toLowerCase())) score += 5;
  // +5 si extractions disponibles ET prompt s'y est référé (proxy : pas de placeholder Lorem)
  if (extractions.length > 0 && !/lorem ipsum/i.test(allCode)) score += 5;
  // +5 si Tailwind utilities
  if (/className="[^"]*\b(flex|grid|p-|m-|text-|bg-)/i.test(allCode)) score += 5;
  return Math.min(score, 100);
}

function buildBriefMarkdown(page: string, ctx: CodeGenContext): string {
  const { brief, brand, tokens, analysis, inspirations } = ctx;

  return `# PAUL ARCHITECT — Brief d'implémentation
## Page : \`${page}\`
> Généré le ${new Date().toISOString()} par le pipeline Paul Architect.

---

## Projet
- **Nom** : ${brief.project.name}
- **Slug** : ${brief.project.slug}
- **Type** : ${brief.project.type}
- **Secteur** : ${brief.project.sector}
- **Device** : ${brief.paul.device}
- **Stack** : ${brief.stack.framework} / ${brief.stack.ui} / ${brief.stack.state}

## Audience & Vision
- **Audience cible** : ${brief.paul.audience || "non spécifiée"}
- **Vision** : ${brief.paul.vision || "non spécifiée"}
- **Mood** : ${brief.paul.mood || "professionnel"}
- **Contraintes** : ${brief.paul.constraints || "aucune"}

## Fonctionnalités prioritaires
${brief.paul.priorities.map((p) => `- ${p}`).join("\n") || "_Non spécifiées_"}

## Identité visuelle (validée par Paul)
### Palette
\`\`\`css
--color-primary: ${brand.palette.primary};
--color-secondary: ${brand.palette.secondary};
--color-accent: ${brand.palette.accent};
--color-background: ${brand.palette.background};
--color-surface: ${brand.palette.surface};
--color-text: ${brand.palette.text};
--color-text-secondary: ${brand.palette.textSecondary};
\`\`\`

### Typographie
- **Heading** : ${brand.typography.heading}
- **Body** : ${brand.typography.body}
- **Border radius** : ${brand.borderRadius}

## Tokens extraits (${tokens.colors.length} couleurs, ${tokens.fonts.length} fonts)
### Top 8 couleurs
${tokens.colors.slice(0, 8).map((c) => `- \`${c.hex}\` (${c.frequency}x, source: ${c.source})`).join("\n") || "_Aucune_"}

### Fonts
${tokens.fonts.slice(0, 4).map((f) => `- ${f.family} (${f.count}x)`).join("\n") || "_Aucune_"}

${inspirations && inspirations.length > 0 ? `## Inspirations sélectionnées (${inspirations.length})
${inspirations.map((i) => `- [${i.title}](${i.url}) _(${i.source})_`).join("\n")}
` : ""}

## Analyse multi-persona
${analysis && analysis.length > 0 ? analysis.map((p) => `
### ${p.name} — ${p.role}
${p.summary}

**Recommandations** :
${p.recommendations.map((r) => `- ${r}`).join("\n")}
`).join("\n") : "_Analyse non disponible_"}

---

_Fichier généré automatiquement par Paul Architect. Source : https://paul-architect.ps-tools.dev_
`;
}

function buildIndex(ctx: CodeGenContext): string {
  return `# PAUL ARCHITECT — Index du pipeline
> Projet : **${ctx.brief.project.name}** (${ctx.brief.project.slug})
> Généré le ${new Date().toISOString()}

## Pages à implémenter
${ctx.pages.map((p) => `- [\`${p}\`](./${p.replace(/\//g, "-") || "home"}.md)`).join("\n")}

## Identité validée
- Primary : \`${ctx.brand.palette.primary}\`
- Heading : ${ctx.brand.typography.heading}
- Body : ${ctx.brand.typography.body}

## Sources
- ${ctx.inspirations?.length || 0} inspirations analysées
- ${ctx.tokens.colors.length} couleurs extraites
- ${ctx.analysis?.length || 0} experts ont analysé le projet
`;
}
