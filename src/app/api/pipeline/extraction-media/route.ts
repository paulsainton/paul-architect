import { NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import { extname } from "path";
import { CONFIG } from "@/lib/config";
import { safePathMulti } from "@/lib/path-guard";

const DATA_DIR = `${CONFIG.PA_DATA_DIR}/extractions`;
const CLONE_EXTRACTIONS = `${CONFIG.CLONE_ARCHITECT_DIR}/extractions`;

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  // Path traversal strict avec whitelist
  const resolved = safePathMulti([DATA_DIR, CLONE_EXTRACTIONS], url);
  if (!resolved) return new Response("Invalid path", { status: 403 });

  // Extension whitelist (pas de lecture de .json/.md)
  const ext = extname(resolved).toLowerCase();
  if (!MIME[ext]) return new Response("Unsupported", { status: 415 });

  try {
    const s = await stat(resolved);
    if (!s.isFile()) return new Response("Not a file", { status: 404 });
    const body = await readFile(resolved);
    return new Response(body, {
      headers: {
        "Content-Type": MIME[ext],
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
