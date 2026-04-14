import { spawn } from "child_process";
import { existsSync, readFileSync, mkdirSync, cpSync } from "fs";
import { join } from "path";
import type { ExtractionResult } from "@/types/pipeline";

const CLONE_DIR = "/home/paul/clone-architect";
const DATA_DIR = "/opt/paul-architect/data/extractions";

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url.replace(/[^a-z0-9.-]/gi, "_");
  }
}

export async function runCloneArchitect(
  url: string,
  runId: string,
  onProgress: (step: string, percent: number) => void
): Promise<ExtractionResult> {
  const domain = domainFromUrl(url);
  const outputDir = join(DATA_DIR, runId, domain);
  mkdirSync(outputDir, { recursive: true });

  const result: ExtractionResult = {
    url,
    domain,
    tokens: { colors: [], fonts: [], spacing: [], shadows: [], borderRadius: [] },
    screenshots: {},
    status: "failed",
  };

  // Vérifier que clone-architect existe
  if (!existsSync(CLONE_DIR)) {
    // Fallback: extraction légère via fetch
    return fallbackExtraction(url, domain, outputDir, onProgress);
  }

  return new Promise((resolve) => {
    onProgress("launching playwright", 5);

    const proc = spawn("npm", ["run", "clone", "--", url], {
      cwd: CLONE_DIR,
      env: { ...process.env, NODE_ENV: "production" },
      timeout: 120_000,
    });

    let stdout = "";
    proc.stdout.on("data", (data) => {
      stdout += data.toString();
      // Parser la progression du clone
      if (stdout.includes("screenshot")) onProgress("screenshot", 30);
      if (stdout.includes("css-extraction")) onProgress("css-extraction", 50);
      if (stdout.includes("tokenize")) onProgress("tokenize", 70);
      if (stdout.includes("analyze")) onProgress("analyze", 85);
    });

    proc.on("close", (code) => {
      onProgress("finalizing", 95);

      // Chercher les outputs du clone
      const extractionsDir = join(CLONE_DIR, "extractions", domain);

      if (code === 0 && existsSync(extractionsDir)) {
        // Copier les outputs
        try {
          cpSync(extractionsDir, outputDir, { recursive: true });
        } catch { /* ignore */ }

        // Lire tokens.json
        const tokensPath = join(outputDir, "tokens.json");
        if (existsSync(tokensPath)) {
          try {
            const raw = JSON.parse(readFileSync(tokensPath, "utf-8"));
            result.tokens = {
              colors: (raw.colors || []).map((c: string | { hex: string }) => ({
                hex: typeof c === "string" ? c : c.hex,
                frequency: 1,
                source: domain,
              })),
              fonts: (raw.fonts || raw.typography || []).map((f: string | { family: string }) => ({
                family: typeof f === "string" ? f : f.family,
                count: 1,
              })),
              spacing: (raw.spacing || []).map((s: string | { value: string }) => ({
                value: typeof s === "string" ? s : s.value,
                count: 1,
              })),
              shadows: raw.shadows || [],
              borderRadius: raw.borderRadius || [],
            };
          } catch { /* invalid json */ }
        }

        // Lire DESIGN.md
        const designPath = join(outputDir, "DESIGN.md");
        if (existsSync(designPath)) {
          result.designMd = readFileSync(designPath, "utf-8");
        }

        // Lire layout-analysis.md
        const layoutPath = join(outputDir, "layout-analysis.md");
        if (existsSync(layoutPath)) {
          result.layoutAnalysis = readFileSync(layoutPath, "utf-8");
        }

        // Screenshots
        const screenshotsDir = join(outputDir, "screenshots");
        if (existsSync(join(screenshotsDir, "desktop.png"))) {
          result.screenshots.desktop = `/data/extractions/${runId}/${domain}/screenshots/desktop.png`;
        }
        if (existsSync(join(screenshotsDir, "mobile.png"))) {
          result.screenshots.mobile = `/data/extractions/${runId}/${domain}/screenshots/mobile.png`;
        }

        result.status = "complete";
      } else {
        // Fallback
        resolve(fallbackExtraction(url, domain, outputDir, onProgress));
        return;
      }

      onProgress("done", 100);
      resolve(result);
    });

    proc.on("error", () => {
      resolve(fallbackExtraction(url, domain, outputDir, onProgress));
    });
  });
}

async function fallbackExtraction(
  url: string,
  domain: string,
  outputDir: string,
  onProgress: (step: string, percent: number) => void
): Promise<ExtractionResult> {
  onProgress("fallback-fetch", 20);

  const result: ExtractionResult = {
    url,
    domain,
    tokens: { colors: [], fonts: [], spacing: [], shadows: [], borderRadius: [] },
    screenshots: {},
    status: "partial",
  };

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PaulArchitect/1.0)" },
      signal: AbortSignal.timeout(15_000),
      redirect: "follow",
    });
    const html = await res.text();

    onProgress("parsing-html", 50);

    // Extraire les couleurs du CSS inline
    const colorMatches = html.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g);
    const colorMap = new Map<string, number>();
    for (const m of colorMatches) {
      const hex = `#${m[1].toUpperCase()}`;
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }
    result.tokens.colors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([hex, freq]) => ({ hex, frequency: freq, source: domain }));

    // Extraire les font-family
    const fontMatches = html.matchAll(/font-family:\s*["']?([^"';,}]+)/gi);
    const fontSet = new Set<string>();
    for (const m of fontMatches) fontSet.add(m[1].trim());
    result.tokens.fonts = Array.from(fontSet).map((f) => ({ family: f, count: 1 }));

    onProgress("done", 100);
  } catch {
    result.status = "failed";
    onProgress("error", 100);
  }

  return result;
}
