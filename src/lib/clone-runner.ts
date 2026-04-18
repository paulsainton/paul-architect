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
      env: {
        ...process.env,
        NODE_ENV: "production",
        // Critique : utiliser les browsers de paul (root n'a pas chromium-1217)
        PLAYWRIGHT_BROWSERS_PATH: "/home/paul/.cache/ms-playwright",
        // HOME pour que npm trouve .npmrc et cache
        HOME: "/home/paul",
      },
      timeout: 120_000,
    });

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (data) => {
      stdout += data.toString();
      if (stdout.includes("screenshot")) onProgress("screenshot", 30);
      if (stdout.includes("css-extraction") || stdout.includes("CSS EXTRACTION")) onProgress("css-extraction", 50);
      if (stdout.includes("TOKENIZATION") || stdout.includes("tokenize")) onProgress("tokenize", 70);
      if (stdout.includes("LAYOUT ANALYSIS") || stdout.includes("analyze")) onProgress("analyze", 85);
    });
    proc.stderr.on("data", (data) => { stderr += data.toString(); });

    proc.on("close", (code) => {
      if (code !== 0) {
        console.error(`[clone-runner] clone failed code=${code} url=${url}`);
        console.error(`[clone-runner] stderr: ${stderr.slice(-500)}`);
      }
      onProgress("finalizing", 95);

      // Chercher les outputs du clone
      const extractionsDir = join(CLONE_DIR, "extractions", domain);

      if (code === 0 && existsSync(extractionsDir)) {
        // Copier les outputs
        try {
          cpSync(extractionsDir, outputDir, { recursive: true });
        } catch { /* ignore */ }

        // Lire tokens.json (format clone-architect v2 : structure nested)
        const tokensPath = join(outputDir, "tokens.json");
        if (existsSync(tokensPath)) {
          try {
            const raw = JSON.parse(readFileSync(tokensPath, "utf-8"));

            // Colors : format nested {background: {...}, text: {...}, accent: {...}, border, shadow}
            const colorHexes: string[] = [];
            const flattenColors = (obj: unknown): void => {
              if (typeof obj === "string") {
                // Convertir rgb(a) en hex
                const match = obj.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (match) {
                  const hex = "#" + [match[1], match[2], match[3]]
                    .map((n) => parseInt(n).toString(16).padStart(2, "0")).join("").toUpperCase();
                  if (!colorHexes.includes(hex)) colorHexes.push(hex);
                } else if (/^#[0-9a-f]{6}$/i.test(obj)) {
                  colorHexes.push(obj.toUpperCase());
                }
              } else if (Array.isArray(obj)) {
                obj.forEach(flattenColors);
              } else if (obj && typeof obj === "object") {
                Object.values(obj).forEach(flattenColors);
              }
            };
            flattenColors(raw.colors);
            result.tokens.colors = colorHexes.map((hex) => ({ hex, frequency: 1, source: domain }));

            // Fonts : typography.fontFamily {primary, secondary, mono}
            const fonts: string[] = [];
            const ff = raw.typography?.fontFamily;
            if (ff) {
              Object.values(ff).forEach((v) => {
                if (typeof v === "string" && v.trim() && !fonts.includes(v)) fonts.push(v);
              });
            }
            if (Array.isArray(raw.fonts)) {
              raw.fonts.forEach((f: string | { family: string }) => {
                const name = typeof f === "string" ? f : f.family;
                if (name && !fonts.includes(name)) fonts.push(name);
              });
            }
            result.tokens.fonts = fonts.map((family) => ({ family, count: 1 }));

            // Spacing : dict xs/sm/base/lg...
            const spacingValues: string[] = [];
            if (raw.spacing && typeof raw.spacing === "object") {
              Object.values(raw.spacing).forEach((v) => {
                if (typeof v === "string") spacingValues.push(v);
              });
            }
            result.tokens.spacing = spacingValues.map((value) => ({ value, count: 1 }));

            // Shadows
            const shadows: string[] = [];
            if (raw.shadows) {
              if (Array.isArray(raw.shadows)) shadows.push(...raw.shadows.filter((s: unknown): s is string => typeof s === "string"));
              else if (typeof raw.shadows === "object") {
                Object.values(raw.shadows).forEach((v) => { if (typeof v === "string") shadows.push(v); });
              }
            }
            result.tokens.shadows = shadows;

            // Border radius
            const radii: string[] = [];
            if (raw.borderRadius) {
              if (Array.isArray(raw.borderRadius)) radii.push(...raw.borderRadius.filter((r: unknown): r is string => typeof r === "string"));
              else if (typeof raw.borderRadius === "object") {
                Object.values(raw.borderRadius).forEach((v) => { if (typeof v === "string") radii.push(v); });
              }
            }
            result.tokens.borderRadius = radii;
          } catch (err) {
            console.error(`[clone-runner] tokens.json parse error: ${err}`);
          }
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

        // Screenshots (clone-architect v2 : above-fold-desktop.png, full-page-desktop.png, etc.)
        const screenshotsDir = join(outputDir, "screenshots");
        if (existsSync(screenshotsDir)) {
          const candidates = [
            "above-fold-desktop.png",
            "full-page-desktop.png",
            "desktop.png",
          ];
          for (const f of candidates) {
            if (existsSync(join(screenshotsDir, f))) {
              result.screenshots.desktop = `/api/pipeline/extraction-media?url=${encodeURIComponent(`${runId}/${domain}/screenshots/${f}`)}`;
              break;
            }
          }
          const mobileOpts = ["above-fold-mobile.png", "full-page-mobile.png", "mobile.png"];
          for (const f of mobileOpts) {
            if (existsSync(join(screenshotsDir, f))) {
              result.screenshots.mobile = `/api/pipeline/extraction-media?url=${encodeURIComponent(`${runId}/${domain}/screenshots/${f}`)}`;
              break;
            }
          }
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
