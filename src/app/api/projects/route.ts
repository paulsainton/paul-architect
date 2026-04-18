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
}

const OPT_DIR = "/opt";
const SKIP = ["paul-architect", "containerd", "lost+found", "backups"];
const SCRIPT_EXT = [".sh", ".py", ".js"];

function safeRead(path: string): string {
  try { return readFileSync(path, "utf-8"); } catch { return ""; }
}

function parseClaudeMd(content: string): Partial<ProjectInfo> {
  const info: Partial<ProjectInfo> = {};

  // Nom
  const nameMatch = content.match(/\*\*Nom\*\*\s*:?\s*([^\n]+)/i);
  if (nameMatch) info.name = nameMatch[1].replace(/[—-]\s*.*/, "").trim();

  // Description apr\u00e8s "Nom"
  const descMatch = content.match(/\*\*Nom\*\*\s*:?\s*[^—\n]*(?:—|-)\s*([^\n]+)/i);
  if (descMatch) info.description = descMatch[1].trim();

  // Stack
  const stackMatch = content.match(/\*\*Stack\*\*\s*:?\s*([^\n]+)/i);
  if (stackMatch) info.stack = stackMatch[1].trim();

  // Port
  const portMatch = content.match(/\*\*Port\*\*\s*:?\s*(\d+)/i) || content.match(/port\s*[:=]?\s*(\d{4,5})/i);
  if (portMatch) info.port = parseInt(portMatch[1]);

  // URL
  const urlMatch = content.match(/https?:\/\/([a-z0-9-]+\.ps-(tools|apps)\.dev)/i);
  if (urlMatch) info.url = `https://${urlMatch[1]}`;

  // Secteur
  const sectorMatch = content.match(/\*\*Secteur\*\*\s*:?\s*([^\n]+)/i);
  if (sectorMatch) info.sector = sectorMatch[1].trim();

  // Type (inf\u00e9r\u00e9 depuis stack ou description)
  const lower = (info.stack + " " + info.description + " " + content.slice(0, 1000)).toLowerCase();
  if (/next\.js|react|vite|web/.test(lower)) info.type = "webapp";
  if (/mobile|ios|android|flutter|react native/.test(lower)) info.type = "mobile";
  if (/landing|site vitrine/.test(lower)) info.type = "landing";
  if (/dashboard|admin/.test(lower)) info.type = "dashboard";
  if (/bot|discord|slack|telegram/.test(lower)) info.type = "bot";
  if (/trading|crypto|exchange/.test(lower)) info.type = "trading";

  return info;
}

function extractKeywords(content: string, name: string, slug: string): string[] {
  const text = (content + " " + name + " " + slug).toLowerCase();
  const kw = new Set<string>([slug.toLowerCase()]);

  // Ajouter les mots de plus de 3 lettres du nom
  name.split(/[\s—-]+/).forEach((w) => { if (w.length > 2) kw.add(w.toLowerCase()); });

  // Keywords m\u00e9tier courants
  const commonKeywords = [
    "trading", "crypto", "bot", "dashboard", "ecommerce", "landing", "saas", "mobile",
    "cuisine", "recette", "food", "fitness", "sante", "voyage", "mode", "retail",
    "finance", "edtech", "ai", "ia", "design", "marketing", "sales", "crm",
  ];
  commonKeywords.forEach((k) => { if (text.includes(k)) kw.add(k); });

  return Array.from(kw).slice(0, 12);
}

function isValidProject(name: string, path: string): boolean {
  if (SKIP.includes(name) || name.startsWith(".")) return false;
  if (SCRIPT_EXT.some((e) => name.endsWith(e))) return false;
  // Doit avoir au moins package.json OU CLAUDE.md OU requirements.txt
  if (existsSync(join(path, "package.json"))) return true;
  if (existsSync(join(path, "CLAUDE.md"))) return true;
  if (existsSync(join(path, "requirements.txt"))) return true;
  if (existsSync(join(path, "Cargo.toml"))) return true;
  if (existsSync(join(path, "go.mod"))) return true;
  return false;
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

export async function GET() {
  const projects: ProjectInfo[] = [];

  try {
    const entries = readdirSync(OPT_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && isValidProject(d.name, join(OPT_DIR, d.name)));

    for (const dir of entries) {
      const fullPath = join(OPT_DIR, dir.name);
      const claudeMd = join(fullPath, "CLAUDE.md");
      const pkgJson = join(fullPath, "package.json");
      const hasClaudeMd = existsSync(claudeMd);

      const claudeContent = hasClaudeMd ? safeRead(claudeMd) : "";
      const parsed = parseClaudeMd(claudeContent);

      // Nom par d\u00e9faut : package.json puis slug en uppercase
      let name = parsed.name || dir.name.toUpperCase().replace(/-/g, " ");
      if (!parsed.name && existsSync(pkgJson)) {
        const pkg = safeRead(pkgJson);
        try {
          const j = JSON.parse(pkg);
          if (j.name) name = j.name;
        } catch { /* ignore */ }
      }

      projects.push({
        slug: dir.name,
        name,
        path: fullPath,
        hasClaudeMd,
        description: parsed.description,
        type: parsed.type,
        sector: parsed.sector,
        stack: parsed.stack,
        port: parsed.port,
        url: parsed.url,
        lastCommit: getLastCommit(fullPath),
        keywords: extractKeywords(claudeContent, name, dir.name),
      });
    }
  } catch { /* fs errors */ }

  // Trier : projets avec CLAUDE.md d'abord, puis par nom
  projects.sort((a, b) => {
    if (a.hasClaudeMd !== b.hasClaudeMd) return a.hasClaudeMd ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json(projects);
}
