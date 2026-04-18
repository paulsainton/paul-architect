"use client";

import { toast } from "sonner";

/**
 * Wrapper fetch qui toast les erreurs automatiquement + log console.
 * Remplace les 12+ catch() vides du projet.
 */
export async function fetchJson<T = unknown>(
  url: string,
  options: RequestInit = {},
  opts: { silent?: boolean; errorLabel?: string } = {}
): Promise<T | null> {
  const { silent = false, errorLabel } = opts;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      let errMsg = `HTTP ${res.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error) errMsg = errJson.error;
      } catch { if (errText) errMsg = errText.slice(0, 200); }
      if (!silent) {
        toast.error(errorLabel || "Erreur serveur", { description: errMsg });
      }
      console.error(`[fetchJson] ${url} \u2192 ${errMsg}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!silent) {
      toast.error(errorLabel || "Erreur r\u00e9seau", { description: msg });
    }
    console.error(`[fetchJson] ${url} \u2192 ${msg}`);
    return null;
  }
}
