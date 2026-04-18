import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join, relative } from "path";

export interface ProjectScan {
  slug: string;
  name: string;
  path: string;
  stack: { framework: string; ui: string; state: string };
  pages: string[];
  components: string[];
  tokens: Record<string, string>;
  features: string[];
  envVars: string[];
  recentCommits: string[];
  claudeMdSummary: string;
}

function safeRead(path: string): string {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return "";
  }
}

function listDirRecursive(dir: string, depth = 3): string[] {
  if (depth <= 0 || !existsSync(dir)) return [];
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...listDirRecursive(full, depth - 1));
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        results.push(full);
      }
    }
  } catch { /* permission denied */ }
  return results;
}

export function scanProject(projectPath: string): ProjectScan {
  const slug = projectPath.split("/").pop() || "";
  let name = slug.toUpperCase().replace(/-/g, " ");

  // 1. package.json
  const pkgRaw = safeRead(join(projectPath, "package.json"));
  let stack = { framework: "", ui: "", state: "" };
  if (pkgRaw) {
    try {
      const pkg = JSON.parse(pkgRaw);
      if (pkg.name) name = pkg.name;
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.next) stack.framework = `Next.js ${deps.next.replace(/[\^~]/g, "")}`;
      else if (deps.react) stack.framework = `React ${deps.react.replace(/[\^~]/g, "")}`;
      else if (deps.vue) stack.framework = `Vue ${deps.vue.replace(/[\^~]/g, "")}`;
      if (deps.tailwindcss) stack.ui = `Tailwind ${deps.tailwindcss.replace(/[\^~]/g, "")}`;
      if (deps.zustand) stack.state = "Zustand";
      else if (deps.redux) stack.state = "Redux";
      else if (deps.jotai) stack.state = "Jotai";
    } catch { /* invalid json */ }
  }

  // 2. CLAUDE.md
  const claudeMd = safeRead(join(projectPath, "CLAUDE.md"));
  let claudeMdSummary = "";
  if (claudeMd) {
    const lines = claudeMd.split("\n").slice(0, 30);
    claudeMdSummary = lines.join("\n");
  }

  // 3. Pages (src/app/)
  const appDir = join(projectPath, "src", "app");
  const pages: string[] = [];
  if (existsSync(appDir)) {
    const files = listDirRecursive(appDir, 4);
    for (const f of files) {
      if (/page\.(tsx?|jsx?)$/.test(f)) {
        const rel = relative(appDir, f).replace(/\/page\.\w+$/, "").replace(/\\/g, "/");
        // Filtrer les faux positifs : fichier racine = "home", pas "page.tsx"
        if (rel.endsWith("page.tsx") || rel.endsWith("page.ts")) continue;
        pages.push(rel || "home");
      }
    }
  }

  // 4. Components
  const compDir = join(projectPath, "src", "components");
  const components: string[] = [];
  if (existsSync(compDir)) {
    const files = listDirRecursive(compDir, 3);
    for (const f of files) {
      const name = f.split("/").pop()?.replace(/\.\w+$/, "") || "";
      if (name && !name.startsWith("index")) components.push(name);
    }
  }

  // 5. CSS tokens (une seule ligne par token, pas de multi-ligne)
  const tokens: Record<string, string> = {};
  const cssPath = join(projectPath, "src", "app", "globals.css");
  const css = safeRead(cssPath);
  for (const line of css.split("\n")) {
    const m = line.match(/--color-([a-zA-Z0-9-]+):\s*([^;}{]+);/);
    if (m && m[2].trim().length < 50) {
      tokens[m[1]] = m[2].trim();
    }
  }

  // 6. Features from CLAUDE.md \u2014 chercher les sections Features/Fonctionnalit\u00e9s uniquement
  const features: string[] = [];
  const lines = claudeMd.split("\n");
  let inFeatureSection = false;
  const featureHeadingRegex = /^#{1,3}.*\b(feature|fonctionnalit|principales|vision|mission)\b/i;
  const excludeRegex = /\b(login|credentials|cookie|middleware|fichiers? cl|port|stack|auth)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (featureHeadingRegex.test(line)) {
      inFeatureSection = true;
      continue;
    }
    // Nouveau heading = fin de section
    if (inFeatureSection && /^#{1,3}\s+/.test(line) && !featureHeadingRegex.test(line)) {
      inFeatureSection = false;
      continue;
    }
    if (inFeatureSection) {
      const m = line.match(/^[-*]\s+(.{5,120})$/);
      if (m && !excludeRegex.test(m[1])) {
        features.push(m[1].trim().replace(/\*\*/g, ""));
      }
    }
  }

  // 7. .env vars (names only)
  const envVars: string[] = [];
  const envPath = join(projectPath, ".env");
  if (existsSync(envPath)) {
    const envContent = safeRead(envPath);
    const envLines = envContent.split("\n");
    for (const line of envLines) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
      if (match) envVars.push(match[1]);
    }
  }

  return {
    slug, name, path: projectPath, stack, pages, components,
    tokens, features, envVars, recentCommits: [], claudeMdSummary,
  };
}
