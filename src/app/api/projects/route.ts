import { NextResponse } from "next/server";
import { readdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

interface ProjectInfo {
  slug: string;
  name: string;
  path: string;
  hasClaudeMd: boolean;
  type?: string;
  sector?: string;
}

const OPT_DIR = "/opt";
const SKIP = ["paul-architect", "containerd", "lost+found"];

export async function GET() {
  const projects: ProjectInfo[] = [];

  try {
    const dirs = readdirSync(OPT_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !SKIP.includes(d.name));

    for (const dir of dirs) {
      const fullPath = join(OPT_DIR, dir.name);
      const claudeMd = join(fullPath, "CLAUDE.md");
      const pkgJson = join(fullPath, "package.json");
      const hasClaudeMd = existsSync(claudeMd);

      let type: string | undefined;
      let sector: string | undefined;

      if (hasClaudeMd) {
        try {
          const content = readFileSync(claudeMd, "utf-8");
          const typeMatch = content.match(/Stack\s*:\s*(.+)/i);
          if (typeMatch) type = typeMatch[1].trim();
          const sectorMatch = content.match(/Secteur\s*:\s*(.+)/i);
          if (sectorMatch) sector = sectorMatch[1].trim();
        } catch { /* ignore */ }
      }

      if (!type && existsSync(pkgJson)) {
        type = "Node.js";
      }

      projects.push({
        slug: dir.name,
        name: dir.name.toUpperCase().replace(/-/g, " "),
        path: fullPath,
        hasClaudeMd,
        type,
        sector,
      });
    }
  } catch { /* ignore fs errors */ }

  return NextResponse.json(projects);
}
