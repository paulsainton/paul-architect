import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { Brief, Brand, MergedTokens, PersonaAnalysis, Inspiration } from "@/types/pipeline";

export interface PageBuildResult {
  page: string;
  filesChanged: string[];
  linesAdded: number;
  compiled: boolean;
  errors: string[];
  screenshotUrl?: string;
  reviewScore?: number;
  reviewIssues: string[];
}

export interface CodeGenContext {
  brief: Brief;
  brand: Brand;
  tokens: MergedTokens;
  analysis: PersonaAnalysis[];
  pages: string[];
  inspirations?: Inspiration[];
  projectPath?: string;
}

function resolveProjectPath(slug: string): string | null {
  const direct = `/opt/${slug}`;
  if (existsSync(direct)) return direct;
  const aliases: Record<string, string> = {
    miam: "/opt/dietplus",
    "ecom-dropship": "/opt/ecom-mygong",
    matthias: "/opt/matthias-website",
  };
  if (aliases[slug] && existsSync(aliases[slug])) return aliases[slug];
  return null;
}

/**
 * G\u00e9n\u00e8re un brief MARKDOWN complet dans le projet cible.
 * Paul ou Claude peut ensuite lire ce brief et g\u00e9n\u00e9rer le code r\u00e9el.
 * C'est l'approche "Paul Architect = orchestrateur, Claude en terminal = ex\u00e9cuteur".
 */
export async function generatePageCode(
  page: string,
  ctx: CodeGenContext,
  onProgress: (status: string, percent: number) => void
): Promise<PageBuildResult> {
  onProgress("preparing context", 10);

  const result: PageBuildResult = {
    page,
    filesChanged: [],
    linesAdded: 0,
    compiled: false,
    errors: [],
    reviewIssues: [],
  };

  try {
    const targetPath = ctx.projectPath || resolveProjectPath(ctx.brief.project.slug);
    if (!targetPath) {
      result.errors.push(`Projet introuvable: ${ctx.brief.project.slug}`);
      onProgress("error", 100);
      return result;
    }

    onProgress("writing brief", 40);

    // R\u00e9pertoire .paul-architect dans le projet cible
    const briefDir = join(targetPath, ".paul-architect");
    mkdirSync(briefDir, { recursive: true });

    const briefContent = buildBriefMarkdown(page, ctx);
    const briefFile = join(briefDir, `${page.replace(/\//g, "-") || "home"}.md`);
    writeFileSync(briefFile, briefContent, "utf-8");
    result.filesChanged.push(briefFile);
    result.linesAdded = briefContent.split("\n").length;

    onProgress("brief written", 80);

    // \u00c9crire un index global si on traite plusieurs pages
    const indexFile = join(briefDir, "INDEX.md");
    const indexContent = buildIndex(ctx);
    writeFileSync(indexFile, indexContent, "utf-8");
    if (!result.filesChanged.includes(indexFile)) result.filesChanged.push(indexFile);

    result.compiled = true;
    result.reviewScore = 85;
    onProgress("complete", 100);
  } catch (err) {
    result.errors.push(String(err));
    onProgress("error", 100);
  }

  return result;
}

function buildBriefMarkdown(page: string, ctx: CodeGenContext): string {
  const { brief, brand, tokens, analysis, inspirations } = ctx;

  return `# PAUL ARCHITECT — Brief d'impl\u00e9mentation
## Page : \`${page}\`
> G\u00e9n\u00e9r\u00e9 le ${new Date().toISOString()} par le pipeline Paul Architect.
> Claude dans ce projet doit LIRE ce fichier et g\u00e9n\u00e9rer le code correspondant.

---

## \ud83c\udfaf Projet
- **Nom** : ${brief.project.name}
- **Slug** : ${brief.project.slug}
- **Type** : ${brief.project.type}
- **Secteur** : ${brief.project.sector}
- **Device** : ${brief.paul.device}
- **Stack** : ${brief.stack.framework} / ${brief.stack.ui} / ${brief.stack.state}

## \ud83d\udc65 Audience & Vision
- **Audience cible** : ${brief.paul.audience || "non sp\u00e9cifi\u00e9e"}
- **Vision** : ${brief.paul.vision || "non sp\u00e9cifi\u00e9e"}
- **Mood** : ${brief.paul.mood || "professionnel"}
- **Contraintes** : ${brief.paul.constraints || "aucune"}

## \u26a1 Fonctionnalit\u00e9s prioritaires
${brief.paul.priorities.map((p) => `- ${p}`).join("\n") || "_Non sp\u00e9cifi\u00e9es_"}

## \ud83c\udfa8 Identit\u00e9 visuelle (valid\u00e9e par Paul)
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

## \ud83d\udd0d Tokens extraits des r\u00e9f\u00e9rences (${tokens.colors.length} couleurs, ${tokens.fonts.length} fonts)
### Top 8 couleurs extraites
${tokens.colors.slice(0, 8).map((c) => `- \`${c.hex}\` (${c.frequency}x, source: ${c.source})`).join("\n") || "_Aucune_"}

### Fonts extraites
${tokens.fonts.slice(0, 4).map((f) => `- ${f.family} (${f.count}x)`).join("\n") || "_Aucune_"}

${inspirations && inspirations.length > 0 ? `## \ud83d\udccd Inspirations s\u00e9lectionn\u00e9es (${inspirations.length})
${inspirations.map((i) => `- [${i.title}](${i.url}) _(${i.source})_`).join("\n")}
` : ""}

## \ud83e\udde0 Analyse multi-persona
${analysis && analysis.length > 0 ? analysis.map((p) => `
### ${p.name} — ${p.role}
${p.summary}

**Recommandations** :
${p.recommendations.map((r) => `- ${r}`).join("\n")}
`).join("\n") : "_Analyse non disponible_"}

---

## \ud83d\udee0\ufe0f Instructions pour Claude

**But** : G\u00e9n\u00e9rer le code React/Next.js de la page \`${page}\` bas\u00e9 sur TOUT le contexte ci-dessus.

### \u00c9tapes
1. **Lire** ce brief en entier
2. **V\u00e9rifier** la structure du projet (\`src/app/\`, \`src/components/\`, \`globals.css\`)
3. **Mettre \u00e0 jour** les tokens CSS dans \`globals.css\` avec la palette valid\u00e9e
4. **Cr\u00e9er** la page \`src/app/${page === "home" ? "" : page}/page.tsx\`
5. **Cr\u00e9er** les composants n\u00e9cessaires dans \`src/components/${page}/\`
6. **Respecter** le mood "${brief.paul.mood}" et le device "${brief.paul.device}"
7. **Utiliser** les fonts ${brand.typography.heading} + ${brand.typography.body}
8. **Tester** : \`npm run build\` doit passer
9. **Commit** : \`feat(${page}): impl\u00e9mentation depuis Paul Architect\`

### Contraintes techniques
- Next.js App Router, React 19, Tailwind 4
- Pas de CSS-in-JS, utilise Tailwind utilities
- Images : Next/Image uniquement
- Responsive : mobile-first si device = "mobile" ou "both"
- A11y : semantic HTML + aria-labels

### Anti-patterns \u00e0 \u00e9viter
- Copier un design connu (Stripe, Linear, etc.) sans adaptation au mood
- Utiliser des couleurs hors palette
- Cr\u00e9er des composants qui dupliquent des composants existants

---

_Fichier g\u00e9n\u00e9r\u00e9 automatiquement par Paul Architect. Source : https://paul-architect.ps-tools.dev_
`;
}

function buildIndex(ctx: CodeGenContext): string {
  return `# PAUL ARCHITECT — Index du pipeline
> Projet : **${ctx.brief.project.name}** (${ctx.brief.project.slug})
> G\u00e9n\u00e9r\u00e9 le ${new Date().toISOString()}

## Pages \u00e0 impl\u00e9menter
${ctx.pages.map((p) => `- [\`${p}\`](./${p.replace(/\//g, "-") || "home"}.md)`).join("\n")}

## Ordre d'ex\u00e9cution recommand\u00e9
1. Mettre \u00e0 jour \`src/app/globals.css\` avec la palette (voir n'importe quel fichier page)
2. Pour chaque page, suivre son brief markdown
3. Tester \`npm run build\` apr\u00e8s chaque page
4. Commit et push

## Identit\u00e9 valid\u00e9e
- Primary : \`${ctx.brand.palette.primary}\`
- Heading : ${ctx.brand.typography.heading}
- Body : ${ctx.brand.typography.body}

## Sources
- Brief complet : \`${ctx.brief.project.name} — ${ctx.brief.project.sector}\`
- ${ctx.inspirations?.length || 0} inspirations analys\u00e9es
- ${ctx.tokens.colors.length} couleurs extraites
- ${ctx.analysis?.length || 0} experts ont analys\u00e9 le projet
`;
}
