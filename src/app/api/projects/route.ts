import { NextResponse } from "next/server";
import { readdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

export interface ProjectInfo {
  slug: string;
  name: string;
  path: string;
  hasClaudeMd: boolean;
  description?: string;
  type?: string;
  sector?: string;
  stack?: string;
  port?: number;
  url?: string;
  lastCommit?: string;
  keywords: string[];
  progressPct?: number;
  status?: string;
}

interface EmpireProject {
  id: string;
  name: string;
  type?: string;
  description?: string;
  target_url?: string;
  tech_stack?: string;
  status?: string;
  priority?: number;
  project_path?: string | null;
  port?: number;
  progress?: { pct: number; done: number; total: number };
}

import { CONFIG } from "@/lib/config";
const EMPIRE_API = CONFIG.EMPIRE_API;
const SCAN_DIRS = ["/opt", "/var/www", "/home/paul/projects"];
const SKIP = new Set([
  "paul-architect", "containerd", "lost+found", "backups", "html", "sites",
  "node_modules", ".git", ".next",
]);

function safeRead(path: string): string {
  try { return readFileSync(path, "utf-8"); } catch { return ""; }
}

function parseClaudeMd(content: string): Partial<ProjectInfo> {
  const info: Partial<ProjectInfo> = {};
  const nameMatch = content.match(/\*\*Nom\*\*\s*:?\s*([^\n]+)/i);
  if (nameMatch) info.name = nameMatch[1].replace(/[\u2014-]\s*.*/, "").trim();
  const descMatch = content.match(/\*\*Nom\*\*\s*:?\s*[^\u2014\n]*(?:\u2014|-)\s*([^\n]+)/i);
  if (descMatch) info.description = descMatch[1].trim();
  const stackMatch = content.match(/\*\*Stack\*\*\s*:?\s*([^\n]+)/i);
  if (stackMatch) info.stack = stackMatch[1].trim();
  const portMatch = content.match(/\*\*Port\*\*\s*:?\s*(\d+)/i);
  if (portMatch) info.port = parseInt(portMatch[1]);
  const urlMatch = content.match(/https?:\/\/([a-z0-9-]+\.ps-(tools|apps)\.dev)/i);
  if (urlMatch) info.url = `https://${urlMatch[1]}`;
  const sectorMatch = content.match(/\*\*Secteur\*\*\s*:?\s*([^\n]+)/i);
  if (sectorMatch) info.sector = sectorMatch[1].trim();
  return info;
}

function extractKeywords(content: string, name: string, slug: string): string[] {
  const text = (content + " " + name + " " + slug).toLowerCase();
  const kw = new Set<string>([slug.toLowerCase()]);
  name.split(/[\s\u2014-]+/).forEach((w) => { if (w.length > 2) kw.add(w.toLowerCase()); });
  const commonKeywords = [
    "trading", "crypto", "bot", "dashboard", "ecommerce", "landing", "saas", "mobile",
    "cuisine", "recette", "food", "fitness", "sante", "voyage", "mode", "retail", "nutrition",
    "finance", "edtech", "ai", "ia", "design", "marketing", "sales", "crm", "automation",
    "react native", "expo", "nextjs", "vue", "supabase", "workflow", "habit", "productivity",
  ];
  commonKeywords.forEach((k) => { if (text.includes(k)) kw.add(k); });
  return Array.from(kw).slice(0, 15);
}

function getLastCommit(path: string): string | undefined {
  try {
    const gitLog = join(path, ".git", "logs", "HEAD");
    if (!existsSync(gitLog)) return undefined;
    const content = safeRead(gitLog).trim().split("\n").pop();
    if (!content) return undefined;
    const match = content.match(/\s(\d{10})\s/);
    if (match) {
      const date = new Date(parseInt(match[1]) * 1000);
      const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      return days === 0 ? "aujourd'hui" : days === 1 ? "hier" : `il y a ${days}j`;
    }
  } catch { /* ignore */ }
  return undefined;
}

function isValidProject(path: string): boolean {
  if (!existsSync(path)) return false;
  return existsSync(join(path, "package.json"))
    || existsSync(join(path, "CLAUDE.md"))
    || existsSync(join(path, "requirements.txt"))
    || existsSync(join(path, "Cargo.toml"))
    || existsSync(join(path, "go.mod"))
    || existsSync(join(path, "app.json")); // Expo
}

function inferType(stack: string, description: string): string | undefined {
  const text = (stack + " " + description).toLowerCase();
  if (/react native|expo|flutter|ios.*android/.test(text)) return "mobile";
  if (/next\.js|react|vue/.test(text)) return "webapp";
  if (/dashboard|admin/.test(text)) return "dashboard";
  if (/bot|discord|slack|telegram/.test(text)) return "bot";
  if (/trading|crypto|exchange/.test(text)) return "trading";
  if (/landing|vitrine/.test(text)) return "landing";
  if (/ecommerce|ecom|shop/.test(text)) return "ecommerce";
  return undefined;
}

function scanLocalProject(path: string, slug: string): Partial<ProjectInfo> {
  const info: Partial<ProjectInfo> = {};
  if (!existsSync(path)) return info;

  const claudeMd = join(path, "CLAUDE.md");
  info.hasClaudeMd = existsSync(claudeMd);
  if (info.hasClaudeMd) {
    const content = safeRead(claudeMd);
    Object.assign(info, parseClaudeMd(content));
    info.keywords = extractKeywords(content, info.name || slug, slug);
  }

  // package.json fallback
  const pkgJson = join(path, "package.json");
  if (!info.name && existsSync(pkgJson)) {
    try {
      const pkg = JSON.parse(safeRead(pkgJson));
      if (pkg.name) info.name = pkg.name;
      if (pkg.description) info.description ||= pkg.description;
    } catch { /* ignore */ }
  }

  info.lastCommit = getLastCommit(path);
  if (!info.keywords) info.keywords = extractKeywords("", info.name || slug, slug);
  return info;
}

async function fetchEmpireProjects(): Promise<EmpireProject[]> {
  try {
    const res = await fetch(`${EMPIRE_API}/api/projects`, { signal: AbortSignal.timeout(5_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function scanDirsForProjects(): Array<{ slug: string; path: string }> {
  const found: Array<{ slug: string; path: string }> = [];
  for (const dir of SCAN_DIRS) {
    if (!existsSync(dir)) continue;
    try {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.startsWith(".") || SKIP.has(entry.name)) continue;
        const fullPath = join(dir, entry.name);
        if (isValidProject(fullPath)) {
          found.push({ slug: entry.name, path: fullPath });
        }
      }
    } catch { /* permission errors */ }
  }
  return found;
}

export async function GET() {
  const projects = new Map<string, ProjectInfo>();

  // 1. Source principale : EmpireDONE
  const empireProjects = await fetchEmpireProjects();

  for (const ep of empireProjects) {
    const slug = ep.id;
    const path = ep.project_path || "";
    const pathExists = path && existsSync(path);

    const local = pathExists ? scanLocalProject(path, slug) : {};

    const info: ProjectInfo = {
      slug,
      name: local.name || ep.name || slug.toUpperCase().replace(/-/g, " "),
      path: pathExists ? path : "",
      hasClaudeMd: !!local.hasClaudeMd,
      description: local.description || ep.description,
      type: local.type || ep.type || inferType(ep.tech_stack || "", ep.description || ""),
      sector: local.sector,
      stack: local.stack || ep.tech_stack,
      port: local.port || ep.port,
      url: local.url || ep.target_url,
      lastCommit: local.lastCommit,
      keywords: local.keywords || extractKeywords(ep.description || "", ep.name || "", slug),
      progressPct: ep.progress?.pct,
      status: ep.status,
    };

    projects.set(slug, info);
  }

  // 2. Scan local pour d\u00e9couvrir projets non list\u00e9s dans EmpireDONE
  const localProjects = scanDirsForProjects();
  for (const { slug, path } of localProjects) {
    if (projects.has(slug) || SKIP.has(slug)) continue;
    const local = scanLocalProject(path, slug);
    projects.set(slug, {
      slug,
      name: local.name || slug.toUpperCase().replace(/-/g, " "),
      path,
      hasClaudeMd: !!local.hasClaudeMd,
      description: local.description,
      type: local.type,
      sector: local.sector,
      stack: local.stack,
      port: local.port,
      url: local.url,
      lastCommit: local.lastCommit,
      keywords: local.keywords || extractKeywords("", local.name || slug, slug),
    });
  }

  const result = Array.from(projects.values());

  // Trier : actifs en premier, puis path existant, puis par nom
  result.sort((a, b) => {
    const aActive = a.status === "active" ? 1 : 0;
    const bActive = b.status === "active" ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;
    const aPath = a.path ? 1 : 0;
    const bPath = b.path ? 1 : 0;
    if (aPath !== bPath) return bPath - aPath;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json(result);
}
