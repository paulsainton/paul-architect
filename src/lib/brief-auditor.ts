import { scanProject, type ProjectScan } from "./project-analyzer";
import type { DeviceTarget, ProjectType } from "@/types/pipeline";

const EMPIRE_API = "http://localhost:3060";

export interface AuditedBrief {
  scan: ProjectScan;
  empireData?: EmpireProject;
  autofilled: {
    type: ProjectType;
    sector: string;
    audience: string;
    vision: string;
    priorities: string[];
    mood: string;
    device: DeviceTarget;
    constraints: string;
  };
  auditNotes: string[];
  targetUrl?: string;
}

export interface EmpireProject {
  id: string;
  name: string;
  type: string;
  description: string;
  target_url?: string;
  tech_stack?: string;
  status: string;
  priority: number;
  project_path: string;
  port?: number;
  notes?: string;
  progress?: { pct: number; done: number; total: number; blockers: number };
  phases?: Array<{ id: string; name: string; status: string; description?: string; order_idx: number }>;
}

async function fetchEmpireProject(slug: string): Promise<EmpireProject | null> {
  try {
    const res = await fetch(`${EMPIRE_API}/api/projects`, { signal: AbortSignal.timeout(5_000) });
    if (!res.ok) return null;
    const all = await res.json();
    if (!Array.isArray(all)) return null;
    return all.find((p: EmpireProject) => p.id === slug || p.name?.toLowerCase() === slug.toLowerCase()) || null;
  } catch {
    return null;
  }
}

function inferProjectType(empire: EmpireProject | null, scan: ProjectScan): ProjectType {
  const raw = (empire?.type || "").toLowerCase();
  if (raw === "saas") return "saas";
  if (raw === "ecommerce" || raw === "ecom" || raw === "e-commerce") return "ecommerce";
  if (raw.includes("mobile") || raw.includes("app")) return "mobile";
  if (raw === "landing" || raw === "site") return "landing";
  if (raw === "dashboard") return "dashboard";

  const stack = (scan.stack.framework + " " + scan.stack.ui).toLowerCase();
  const empireStack = (empire?.tech_stack || "").toLowerCase();
  if (stack.includes("react native") || stack.includes("flutter") || stack.includes("expo")
    || empireStack.includes("react native") || empireStack.includes("expo")) return "mobile";
  if (scan.pages.length > 8) return "webapp";
  if (scan.pages.length <= 3 && scan.pages.length > 0) return "landing";
  return "webapp";
}

function inferSector(empire: EmpireProject | null, scan: ProjectScan): string {
  if (empire?.description) {
    const desc = empire.description.toLowerCase();
    if (/cuisine|recette|food|diet|nutrition/.test(desc)) return "Cuisine & nutrition";
    if (/trading|crypto|bourse|finance/.test(desc)) return "Finance & trading";
    if (/ecom|vente|shop|retail/.test(desc)) return "E-commerce";
    if (/marketing|ads|pub|publicit/.test(desc)) return "Marketing & AdTech";
    if (/sant\u00e9|m\u00e9dical|health|fitness/.test(desc)) return "Sant\u00e9 & fitness";
    if (/\u00e9ducation|apprentissage|cours|edtech/.test(desc)) return "\u00c9ducation";
    if (/travel|voyage|tourisme/.test(desc)) return "Voyage";
    if (/immobilier|real estate/.test(desc)) return "Immobilier";
    if (/design|ui|ux/.test(desc)) return "Design & UI";
    if (/ia|ai|machine learning|gpt/.test(desc)) return "Intelligence artificielle";
    if (/agence|consulting/.test(desc)) return "Services agence";
  }

  const claudeMd = scan.claudeMdSummary.toLowerCase();
  if (/cuisine|recette/.test(claudeMd)) return "Cuisine & nutrition";
  if (/trading|crypto/.test(claudeMd)) return "Finance & trading";

  return "\u00c0 d\u00e9finir";
}

function inferAudience(empire: EmpireProject | null, sector: string): string {
  const desc = empire?.description?.toLowerCase() || "";
  if (sector.includes("Cuisine")) return "Jeunes adultes 25-40 qui souhaitent cuisiner plus facilement et varier leurs repas";
  if (sector.includes("Finance") || sector.includes("trading")) return "Traders particuliers et investisseurs retail 25-45, intermediaires a experimentes";
  if (sector.includes("E-commerce")) return "Acheteurs en ligne B2C, 25-55, mobile-first, sensibles au prix et a la livraison";
  if (sector.includes("Marketing")) return "Marketeurs, media buyers et agences 28-45 qui cherchent a optimiser leurs campagnes";
  if (sector.includes("Sant\u00e9")) return "Adultes actifs 25-50 soucieux de leur bien-etre, recherche de simplicite et personnalisation";
  if (sector.includes("\u00c9ducation")) return "Etudiants et apprenants adultes 18-40 en autoformation, budget limite, mobile-first";
  if (sector.includes("Design")) return "Designers, freelances et product teams 25-45, outils collaboratifs";
  if (sector.includes("IA") || desc.includes("ai")) return "Professionnels tech et creatifs 25-45 qui veulent exploiter l'IA en production";
  return "Audience cible a preciser selon le positionnement";
}

function inferVision(empire: EmpireProject | null, scan: ProjectScan): string {
  if (empire?.description && empire.description.length > 20 && empire.description.length < 150) {
    return empire.description;
  }
  if (scan.name) {
    return `${scan.name} \u2014 ${empire?.description || "vision \u00e0 pr\u00e9ciser par Paul"}`;
  }
  return "Vision \u00e0 pr\u00e9ciser";
}

function inferPriorities(empire: EmpireProject | null, scan: ProjectScan, sector: string): string[] {
  const priorities: string[] = [];

  // 1. Features detectees dans CLAUDE.md (si non pollu\u00e9es)
  if (scan.features.length > 0) {
    priorities.push(...scan.features.slice(0, 2).map((f) => f.replace(/^[-*]\s*/, "").slice(0, 80)));
  }

  // 2. Phases EmpireDONE actives ou bloquees (priorites business)
  if (empire?.phases) {
    const active = empire.phases.filter((p) => p.status === "active" || p.status === "blocked");
    active.slice(0, 2).forEach((p) => {
      const label = p.name.slice(0, 60);
      if (!priorities.some((x) => x.toLowerCase().includes(label.toLowerCase()))) {
        priorities.push(`Finaliser : ${label}`);
      }
    });
  }

  // 3. Priorit\u00e9s UX sp\u00e9cifiques au secteur
  const sectorLower = sector.toLowerCase();
  if (sectorLower.includes("marketing") || sectorLower.includes("adtech")) {
    priorities.push("Conversion du workflow de cr\u00e9ation", "D\u00e9mo produit en 30 secondes");
  } else if (sectorLower.includes("cuisine") || sectorLower.includes("food")) {
    priorities.push("UX page recette / mode cuisson", "Onboarding sans friction");
  } else if (sectorLower.includes("trading") || sectorLower.includes("finance")) {
    priorities.push("Dashboard temps r\u00e9el lisible", "Confiance et s\u00e9curit\u00e9 visuelle");
  } else if (sectorLower.includes("ecom") || sectorLower.includes("e-commerce")) {
    priorities.push("Parcours achat 2 clics", "Preuves sociales et reviews");
  } else if (sectorLower.includes("sant") || sectorLower.includes("fitness")) {
    priorities.push("Motivation quotidienne", "Progression visible");
  } else if (sectorLower.includes("\u00e9ducation") || sectorLower.includes("edtech")) {
    priorities.push("Progression apprenant", "Micro-engagement quotidien");
  } else {
    priorities.push("UX premi\u00e8re impression", "Conversion CTA principal");
  }

  // 4. Pages cles du projet
  const corePages = scan.pages.filter((p) => /dashboard|home|landing|pricing|onboarding|checkout/.test(p.toLowerCase()));
  corePages.slice(0, 1).forEach((p) => {
    priorities.push(`UX de la page ${p}`);
  });

  // D\u00e9dupliquer
  const seen = new Set<string>();
  return priorities.filter((p) => {
    const k = p.toLowerCase().slice(0, 30);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 5);
}

function inferMood(empire: EmpireProject | null, scan: ProjectScan): string {
  const type = (empire?.type || "").toLowerCase();
  const stack = (scan.stack.framework + " " + scan.stack.ui).toLowerCase();
  const desc = (empire?.description || "").toLowerCase();

  if (/trading|crypto|finance/.test(desc)) return "Tech, data-driven, sobre et pro";
  if (/cuisine|food|recette/.test(desc)) return "Chaleureux, appetissant, simple";
  if (/marketing|ads/.test(desc)) return "Bold, impactant, creatif";
  if (/sant\u00e9|fitness/.test(desc)) return "Energique, motivant, lumineux";
  if (/\u00e9ducation|apprent/.test(desc)) return "Accessible, rassurant, clair";
  if (/luxe|premium/.test(desc)) return "\u00c9l\u00e9gant, minimaliste, premium";
  if (type === "saas") return "Professionnel, efficient, moderne";
  if (stack.includes("dark")) return "Dark, tech, minimaliste";
  return "Moderne, efficient, lisible";
}

function inferDevice(empire: EmpireProject | null, scan: ProjectScan): DeviceTarget {
  const type = (empire?.type || "").toLowerCase();
  if (type === "mobile") return "mobile";
  const stack = (scan.stack.framework + " " + scan.stack.ui).toLowerCase();
  if (stack.includes("react native") || stack.includes("flutter") || stack.includes("expo")) return "mobile";
  if (scan.pages.some((p) => /dashboard|admin/.test(p.toLowerCase()))) return "desktop";
  return "both";
}

function inferConstraints(empire: EmpireProject | null, scan: ProjectScan): string {
  const parts: string[] = [];
  if (scan.stack.framework) parts.push(`Stack impose: ${scan.stack.framework}`);
  if (empire?.port) parts.push(`Port ${empire.port}`);
  if (empire?.target_url) parts.push(`D\u00e9ploiement ${empire.target_url}`);
  if (empire?.notes) parts.push(empire.notes.slice(0, 200));
  return parts.join(". ") || "Aucune contrainte sp\u00e9cifique";
}

function buildAuditNotes(empire: EmpireProject | null, scan: ProjectScan): string[] {
  const notes: string[] = [];

  if (empire) {
    notes.push(`\u2705 Trouv\u00e9 dans EmpireDONE : ${empire.type || "type non d\u00e9fini"}, progression ${empire.progress?.pct || 0}% (${empire.progress?.done || 0}/${empire.progress?.total || 0} phases)`);
    if (empire.progress?.blockers) notes.push(`\u26a0\ufe0f ${empire.progress.blockers} blocker(s) actif(s) dans EmpireDONE`);
    if (empire.phases) {
      const active = empire.phases.filter((p) => p.status === "active");
      if (active.length > 0) notes.push(`\ud83d\udea7 Phases actives : ${active.map((p) => p.name).slice(0, 3).join(", ")}`);
    }
  } else {
    notes.push(`\u26a0\ufe0f Projet non trouv\u00e9 dans EmpireDONE \u2014 audit bas\u00e9 uniquement sur le code local`);
  }

  notes.push(`\ud83d\udcc4 ${scan.pages.length} pages d\u00e9tect\u00e9es dans src/app/`);
  notes.push(`\ud83e\udde9 ${scan.components.length} composants existants`);
  notes.push(`\ud83c\udfa8 ${Object.keys(scan.tokens).length} tokens CSS dans globals.css`);
  if (scan.envVars.length > 0) notes.push(`\ud83d\udd10 ${scan.envVars.length} variables d'environnement (API keys)`);

  return notes;
}

export async function auditProject(projectPath: string, slug: string): Promise<AuditedBrief> {
  // 1. Scan local
  const scan = scanProject(projectPath);

  // 2. Enrichissement via EmpireDONE
  const empireData = await fetchEmpireProject(slug);

  // 3. Inf\u00e9rences intelligentes
  const type = inferProjectType(empireData, scan);
  const sector = inferSector(empireData, scan);
  const audience = inferAudience(empireData, sector);
  const vision = inferVision(empireData, scan);
  const priorities = inferPriorities(empireData, scan, sector);
  const mood = inferMood(empireData, scan);
  const device = inferDevice(empireData, scan);
  const constraints = inferConstraints(empireData, scan);

  const auditNotes = buildAuditNotes(empireData, scan);

  return {
    scan,
    empireData: empireData || undefined,
    autofilled: { type, sector, audience, vision, priorities, mood, device, constraints },
    auditNotes,
    targetUrl: empireData?.target_url,
  };
}
