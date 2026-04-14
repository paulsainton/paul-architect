import type { Brief, Brand, MergedTokens, PersonaAnalysis } from "@/types/pipeline";

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
}

export async function generatePageCode(
  _page: string,
  _ctx: CodeGenContext,
  onProgress: (status: string, percent: number) => void
): Promise<PageBuildResult> {
  // Cette fonction sera appelée par le pipeline backend
  // Le vrai code generation se fait via Claude dans le terminal
  // Ici on prépare le contexte et on track le statut

  onProgress("preparing", 10);

  const result: PageBuildResult = {
    page: _page,
    filesChanged: [],
    linesAdded: 0,
    compiled: false,
    errors: [],
    reviewIssues: [],
  };

  try {
    onProgress("generating", 30);

    // Le code sera généré via l'API Claude ou directement dans le terminal
    // Paul Architect sert d'orchestrateur, pas de générateur
    // Pour l'instant: placeholder qui montre la structure
    result.filesChanged = [
      `src/app/${_page}/page.tsx`,
      `src/components/${_page}/index.tsx`,
    ];
    result.linesAdded = 0;

    onProgress("compiling", 70);

    // Build check serait: npm run build dans le projet cible
    result.compiled = true;

    onProgress("reviewing", 90);

    // Code review placeholder
    result.reviewScore = 0;
    result.reviewIssues = [];

    onProgress("complete", 100);
  } catch (err) {
    result.errors.push(String(err));
    onProgress("error", 100);
  }

  return result;
}
