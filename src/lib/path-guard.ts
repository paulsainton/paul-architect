import { resolve, join } from "path";
import { existsSync } from "fs";

/**
 * Path traversal strict : r\u00e9sout le chemin + v\u00e9rifie qu'il est DANS le whitelist.
 * Retourne le path absolu si OK, null si tentative de traversal ou hors whitelist.
 */
export function safePath(baseDir: string, userPath: string): string | null {
  if (!userPath || typeof userPath !== "string") return null;

  // Reject null bytes (POSIX path injection)
  if (userPath.includes("\0")) return null;

  // Reject absolute paths (user doit fournir du relatif)
  if (userPath.startsWith("/") || /^[a-zA-Z]:/.test(userPath)) return null;

  const resolvedBase = resolve(baseDir);
  const resolvedTarget = resolve(join(resolvedBase, userPath));

  // V\u00e9rifie que le target est DANS la baseDir (pas ../)
  if (!resolvedTarget.startsWith(resolvedBase + "/") && resolvedTarget !== resolvedBase) {
    return null;
  }

  return resolvedTarget;
}

/**
 * Variante qui accepte plusieurs baseDirs whitelist.
 */
export function safePathMulti(baseDirs: string[], userPath: string): string | null {
  for (const base of baseDirs) {
    const resolved = safePath(base, userPath);
    if (resolved && existsSync(resolved)) return resolved;
  }
  return null;
}
