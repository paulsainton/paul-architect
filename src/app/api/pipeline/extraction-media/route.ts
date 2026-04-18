import { NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import { join, extname } from "path";

const DATA_DIR = "/opt/paul-architect/data/extractions";
const CLONE_EXTRACTIONS = "/home/paul/clone-architect/extractions";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  // S\u00e9curit\u00e9 : no path traversal
  const clean = url.replace(/\.\./g, "").replace(/\/\//g, "/");

  // Chercher d'abord dans /opt/paul-architect/data, puis dans clone-architect/extractions
  const candidates = [
    join(DATA_DIR, clean),
    join(CLONE_EXTRACTIONS, clean),
  ];

  for (const path of candidates) {
    if (!path.startsWith(DATA_DIR) && !path.startsWith(CLONE_EXTRACTIONS)) continue;
    if (!existsSync(path)) continue;
    try {
      const s = await stat(path);
      if (!s.isFile()) continue;
      const ext = extname(path).toLowerCase();
      const body = await readFile(path);
      return new Response(body, {
        headers: {
          "Content-Type": MIME[ext] || "application/octet-stream",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch { /* try next */ }
  }

  return new Response("Not found", { status: 404 });
}
