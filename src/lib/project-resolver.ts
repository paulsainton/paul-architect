import { existsSync } from "fs";
import { CONFIG } from "./config";
import { log } from "./logger";

const logger = log.scope("project-resolver");

/**
 * Aliases historiques unifiés (source unique).
 * Préférer EmpireDONE (project_path) → ces aliases sont fallback uniquement.
 */
const ALIASES: Record<string, string> = {
  miam: "/opt/dietplus",
  "ecom-dropship": "/opt/ecom-mygong",
  matthias: "/opt/matthias-website",
  dimension: "/opt/site-web-dimension-refonte",
  bench: "/opt/bench-dashboard",
  ecom: "/opt/ecom-mygong",
};

/**
 * Slugs réservés : impossible de les utiliser comme cible deploy/clone.
 * Sécurité : empêche d'auto-écraser paul-architect ou les services système.
 *
 * SOURCE DE VÉRITÉ — importé par schemas.ts (pour validation Zod) ET routes (pour vérif post-load).
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "paul-architect",
  "orchestrator",
  "orchestrator-mcp",
  "orchestrator-dashboard",
  "empiredone",
  "nginx",
  "root",
  "etc",
  "bin",
  "usr",
  "var",
  "lib",
  "boot",
  "sys",
  "proc",
  "tmp",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase().trim());
}

// Cache mémoire EmpireDONE — 5 min TTL, partagé entre toutes les requêtes
interface EmpireProject { id: string; project_path?: string }
let empireCache: { data: EmpireProject[]; expiresAt: number } | null = null;
const EMPIRE_CACHE_TTL_MS = 5 * 60_000;

async function getEmpireProjects(): Promise<EmpireProject[]> {
  if (empireCache && Date.now() < empireCache.expiresAt) return empireCache.data;
  try {
    const res = await fetch(`${CONFIG.EMPIRE_API}/api/projects`, { signal: AbortSignal.timeout(4_000) });
    if (!res.ok) return empireCache?.data || [];
    const projects = await res.json();
    if (Array.isArray(projects)) {
      empireCache = { data: projects, expiresAt: Date.now() + EMPIRE_CACHE_TTL_MS };
      return projects;
    }
  } catch { /* keep stale cache if available */ }
  return empireCache?.data || [];
}

/**
 * Résout le chemin physique d'un projet.
 * 1. EmpireDONE (source de vérité, cache 5 min)
 * 2. Convention `/opt/<slug>`, `/var/www/<slug>`, etc.
 * 3. Aliases historiques
 */
export async function resolveProjectPath(slug: string): Promise<string | null> {
  if (!slug || isReservedSlug(slug)) {
    logger.warn("reserved or empty slug refused", { slug });
    return null;
  }

  // 1. EmpireDONE (cached)
  try {
    const projects = await getEmpireProjects();
    const found = projects.find((p) => p.id === slug);
    if (found?.project_path && existsSync(found.project_path)) return found.project_path;
  } catch { /* fallback */ }

  // 2. Conventions filesystem
  const candidates = [
    `/opt/${slug}`,
    `/var/www/${slug}`,
    `/var/www/app-${slug}`,
    `/home/paul/projects/${slug}`,
    `/opt/${slug}-refonte`,
    `/opt/${slug}-dashboard`,
    `/opt/app-${slug}`,
    `/opt/${slug}-site`,
    `/opt/${slug}-website`,
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }

  // 3. Aliases historiques
  if (ALIASES[slug] && existsSync(ALIASES[slug])) return ALIASES[slug];

  return null;
}
