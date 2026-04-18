import { scanProject, type ProjectScan } from "./project-analyzer";
import { enrichBrief } from "./brief-enricher";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { DeviceTarget, ProjectType, Persona, ValueProp, FeatureTier, UserJourneyStep, MarketingAngle, Risk, RoadmapPhase } from "@/types/pipeline";

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
  // Donn\u00e9es enrichies
  knownCompetitors: string[];
  suggestedKeywords: string[];
  readmeExcerpt?: string;
  recentCommits: string[];
  // Brief v3 \u2014 enrichissement produit/UX/marketing complet
  enriched: {
    positioning: string;
    uniqueSellingPoint: string;
    valueProps: ValueProp[];
    personas: Persona[];
    userJourney: UserJourneyStep[];
    marketingAngles: MarketingAngle[];
    features: FeatureTier[];
    kpis: string[];
    risks: Risk[];
    roadmap: RoadmapPhase[];
  };
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

function readReadme(projectPath: string): string | undefined {
  for (const name of ["README.md", "readme.md", "Readme.md"]) {
    const p = join(projectPath, name);
    if (existsSync(p)) {
      try { return readFileSync(p, "utf-8").slice(0, 3000); } catch { /* ignore */ }
    }
  }
  return undefined;
}

function readGitLog(projectPath: string): string[] {
  const gitHead = join(projectPath, ".git", "logs", "HEAD");
  if (!existsSync(gitHead)) return [];
  try {
    const content = readFileSync(gitHead, "utf-8");
    const lines = content.trim().split("\n").slice(-10).reverse();
    return lines
      .map((l) => {
        const match = l.match(/commit(?:\s+\(initial\))?:\s+(.+)$/);
        return match ? match[1].slice(0, 100) : null;
      })
      .filter((x): x is string => !!x)
      .slice(0, 5);
  } catch {
    return [];
  }
}

// ========================================
// KNOWLEDGE BASE : concurrents connus par secteur / cas
// ========================================
const KNOWN_COMPETITORS: Record<string, { sector: string; competitors: string[]; keywords: string[] }> = {
  lifeos: {
    sector: "Productivit\u00e9 & life management",
    competitors: ["notion.so", "todoist.com", "sunsama.com", "motion.ai", "reclaim.ai", "akiflow.com", "cron.com", "rise.com", "fabric.so", "amie.so"],
    keywords: ["life organizer", "personal OS", "habit tracker", "task manager", "calendar integration", "time blocking"],
  },
  miam: {
    sector: "Cuisine & nutrition",
    competitors: ["yuka.io", "frichti.co", "marmiton.org", "kitchenstories.com", "mealime.com", "whisk.com", "paprika.app", "samsung.com/sg/apps/food", "allrecipes.com", "hellofresh.com"],
    keywords: ["recipe app", "meal planning", "grocery list", "cooking mode", "dietary tracking", "smart kitchen"],
  },
  dietplus: {
    sector: "Nutrition & di\u00e9t\u00e9tique",
    competitors: ["myfitnesspal.com", "noom.com", "lifesum.com", "cronometer.com", "lose-it.com", "yazio.com", "fatsecret.com", "yuka.io"],
    keywords: ["nutrition tracking", "calorie counter", "meal log", "dietary plan", "weight management"],
  },
  aurax: {
    sector: "Trading & crypto",
    competitors: ["3commas.io", "cryptohopper.com", "pionex.com", "bitsgap.com", "trality.com", "gunbot.com", "shrimpy.io", "tradingview.com"],
    keywords: ["trading bot", "crypto exchange", "algo trading", "backtest", "portfolio manager"],
  },
  adforge: {
    sector: "Marketing & AdTech IA",
    competitors: ["predis.ai", "adcreative.ai", "omneky.com", "copy.ai", "jasper.ai", "persado.com", "anyword.com", "peach.cash"],
    keywords: ["AI ad generator", "creative automation", "copy generation", "video ads", "performance creative"],
  },
  popon: {
    sector: "E-commerce pop-up",
    competitors: ["shopify.com", "woocommerce.com", "squarespace.com", "ecwid.com", "bigcartel.com", "gumroad.com", "payhip.com"],
    keywords: ["quick shop", "pop-up store", "mobile commerce", "one-product store", "dropshipping"],
  },
  sneaksclap: {
    sector: "Sneakers & streetwear",
    competitors: ["goat.com", "stockx.com", "sneakers.com", "flightclub.com", "snipes.com", "jdsports.com", "footlocker.com"],
    keywords: ["sneaker marketplace", "resale sneakers", "streetwear", "drop calendar", "release tracker"],
  },
  dimension: {
    sector: "Agence cr\u00e9ative",
    competitors: ["rga.com", "wieden.kennedy.com", "pentagram.com", "landor.com", "ogilvy.com", "62medialab.com", "metalab.com"],
    keywords: ["creative agency", "brand identity", "design studio", "portfolio", "case studies"],
  },
  relationsense: {
    sector: "CRM relationnel",
    competitors: ["hubspot.com", "salesforce.com", "pipedrive.com", "notion.so", "airtable.com", "monday.com", "clay.com", "attio.com"],
    keywords: ["personal CRM", "relationship intelligence", "contact management", "outreach", "network tracking"],
  },
  presta: {
    sector: "Prestataires & freelance management",
    competitors: ["malt.fr", "comet.co", "crème.io", "upwork.com", "fiverr.com", "shine.fr", "freebe.me", "abby.fr"],
    keywords: ["freelance platform", "invoicing", "client management", "contract", "timesheet"],
  },
  matthias: {
    sector: "Portfolio / site vitrine personnel",
    competitors: ["brittanychiang.com", "rauno.me", "jhey.dev", "pixelheart.io", "joshwcomeau.com", "olivierlarose.com"],
    keywords: ["personal website", "portfolio", "developer showcase", "case studies", "3D animations"],
  },
  stitch: {
    sector: "Design tools IA",
    competitors: ["figma.com", "framer.com", "uizard.io", "galileo.ai", "v0.dev", "lovable.dev", "bolt.new", "relume.io"],
    keywords: ["AI design generator", "prototyping", "design system", "wireframe", "UI kit"],
  },
};

function matchKnownCompetitors(slug: string, description: string, name: string): { sector: string; competitors: string[]; keywords: string[] } | null {
  const searchText = `${slug} ${name} ${description}`.toLowerCase();

  // Match direct par slug
  for (const [key, data] of Object.entries(KNOWN_COMPETITORS)) {
    if (searchText.includes(key) || slug === key) return data;
  }

  // Match par mots-cl\u00e9s de secteur
  if (/lifeos|life.?os|habit|productivit|task manager|organiseur/i.test(searchText)) return KNOWN_COMPETITORS.lifeos;
  if (/cuisine|recette|food|meal|kitchen/i.test(searchText)) return KNOWN_COMPETITORS.miam;
  if (/nutrition|diet|calorie|weight|fitness/i.test(searchText)) return KNOWN_COMPETITORS.dietplus;
  if (/trading|crypto|bot|exchange|bourse/i.test(searchText)) return KNOWN_COMPETITORS.aurax;
  if (/ad|pub|marketing|creative|copy/i.test(searchText)) return KNOWN_COMPETITORS.adforge;
  if (/shop|ecom|commerce|retail|store/i.test(searchText)) return KNOWN_COMPETITORS.popon;
  if (/sneaker|streetwear|drop|resale/i.test(searchText)) return KNOWN_COMPETITORS.sneaksclap;
  if (/agence|brand|identit|creative studio/i.test(searchText)) return KNOWN_COMPETITORS.dimension;
  if (/crm|contact|relation|outreach/i.test(searchText)) return KNOWN_COMPETITORS.relationsense;
  if (/freelance|presta|facture|invoice/i.test(searchText)) return KNOWN_COMPETITORS.presta;
  if (/portfolio|vitrine|personal site|developer/i.test(searchText)) return KNOWN_COMPETITORS.matthias;
  if (/design tool|ui generator|prototyp|wireframe|stitch|figma/i.test(searchText)) return KNOWN_COMPETITORS.stitch;

  return null;
}

// ========================================
// INFERENCES
// ========================================
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

function inferDevice(empire: EmpireProject | null, scan: ProjectScan): DeviceTarget {
  const type = (empire?.type || "").toLowerCase();
  if (type.includes("mobile")) return "mobile";
  const stack = (scan.stack.framework + " " + scan.stack.ui + " " + (empire?.tech_stack || "")).toLowerCase();
  if (stack.includes("react native") || stack.includes("flutter") || stack.includes("expo")) return "mobile";
  if (scan.pages.some((p) => /dashboard|admin/.test(p.toLowerCase()))) return "desktop";
  return "both";
}

// ========================================
// AUDIENCE — paragraphe d\u00e9taill\u00e9, pas une ligne g\u00e9n\u00e9rique
// ========================================
function inferAudience(empire: EmpireProject | null, sector: string, name: string): string {
  const desc = empire?.description?.toLowerCase() || "";
  const s = sector.toLowerCase();

  if (s.includes("productivit") || s.includes("life")) {
    return `${name} s'adresse aux knowledge workers et freelances 25-45 ans d\u00e9bord\u00e9s par la multiplication d'outils (Notion, Todoist, Calendar, email). Ils cherchent un OS de vie unifi\u00e9 pour capturer leurs t\u00e2ches, habitudes et objectifs dans un seul endroit, avec une vue d'ensemble quotidienne et une capacit\u00e9 de focus profond. Utilisateurs power-users mobile + desktop, sensibles au design minimaliste, pr\u00eats \u00e0 payer 5-15\u20ac/mois pour un produit qui simplifie leur stack.`;
  }
  if (s.includes("cuisine") || s.includes("food")) {
    return `Jeunes adultes 25-40 ans urbains, souvent en couple ou colocation, qui cuisinent 3-5 fois par semaine mais manquent d'inspiration et de temps. Ils veulent des recettes simples (≤30min), adapt\u00e9es \u00e0 leur frigo actuel, avec un mode cuisson plein \u00e9cran mains-libres. Ils refusent les paywalls aggressifs et les newsletters intrusives. Device principal : mobile iOS/Android, utilisation quotidienne avant les repas.`;
  }
  if (s.includes("nutrition") || s.includes("di\u00e9t")) {
    return `Adultes 28-50 ans en d\u00e9marche de perte de poids ou r\u00e9\u00e9quilibrage alimentaire, apr\u00e8s un d\u00e9clic sant\u00e9 (post-grossesse, examen m\u00e9dical, \u00e9v\u00e9nement perso). Ils veulent tracker leurs apports sans friction (scan code-barres, photo repas), comprendre leurs macros, et voir des progr\u00e8s mesurables hebdo. Refusent les r\u00e9gimes dogmatiques. Pr\u00eats \u00e0 payer 7-12\u20ac/mois si l'app simplifie VRAIMENT leur quotidien.`;
  }
  if (s.includes("trading") || s.includes("crypto") || s.includes("finance")) {
    return `Traders retail et investisseurs crypto 25-45 ans, intermediaires \u00e0 exp\u00e9riment\u00e9s, qui g\u00e8rent 5-50k\u20ac et cherchent \u00e0 automatiser leurs strat\u00e9gies sans coder. Ils suivent 3-10 paires, lisent TradingView quotidiennement, utilisent d\u00e9j\u00e0 Binance/Kraken. Crit\u00e8res d'achat : backtesting fiable, transparence des frais, s\u00e9curit\u00e9 API, communaut\u00e9 de partage de strat\u00e9gies. Budget 30-100\u20ac/mois + revenue share.`;
  }
  if (s.includes("marketing") || s.includes("adtech")) {
    return `Marketeurs performance, media buyers et agences 28-45 ans qui g\u00e8rent 10k-500k\u20ac/mois d'ad spend sur Meta/TikTok/Google. Ils cherchent \u00e0 industrialiser la production cr\u00e9ative (besoin de 50+ variantes/semaine) sans sacrifier la qualit\u00e9. Fatigu\u00e9s de Canva trop limit\u00e9 et d'agences trop lentes. Besoin : g\u00e9n\u00e9ration rapide, brand consistency, export multi-formats, A/B ready. Budget 100-500\u20ac/mois en SaaS.`;
  }
  if (s.includes("e-commerce") || s.includes("ecom")) {
    return `Acheteurs B2C 25-55 ans mobile-first, qui achetent en ligne 2-5x/mois. Parcours classique : d\u00e9couverte via r\u00e9seaux sociaux (Instagram/TikTok) → comparaison prix (Google) → reviews (Trustpilot) → achat. Sensibles au prix et aux d\u00e9lais livraison. Refusent les comptes obligatoires. Attendent un checkout 2 clics, Apple Pay / Google Pay, retours gratuits 30 jours.`;
  }
  if (s.includes("sneaker") || s.includes("streetwear")) {
    return `Sneakerheads et fans streetwear 18-35 ans, mobile-first (Instagram + TikTok), qui suivent 5-20 drops/mois. Ils ach\u00e8tent en primary (Nike/Adidas SNKRS) ET secondary (GOAT, StockX). Recherchent : calendrier de drops en temps r\u00e9el, alerts push, authentification garantie, communaut\u00e9 de collectionneurs. Panier moyen 150-400\u20ac par achat.`;
  }
  if (s.includes("portfolio") || s.includes("vitrine")) {
    return `Visiteurs : recruteurs tech (lead, CTO, HR) et prospects clients 30-55 ans qui \u00e9valuent en 30 secondes si tu mérites un entretien ou un brief. Ils regardent : hero statement clair, 3-5 cases d'\u00e9tude avec impact chiffr\u00e9, stack technique visible, contact rapide. Devices : desktop 70% (bureau) + mobile 30% (scan rapide).`;
  }
  if (s.includes("crm") || s.includes("relation")) {
    return `Founders, sales et business developers 28-45 ans qui g\u00e8rent 100-2000 contacts pro, fatigu\u00e9s de HubSpot trop complexe et d'Excel trop statique. Ils cherchent une vue unifi\u00e9e de leurs relations (historique, contexte, prochaine action), avec capture automatique depuis email/LinkedIn. Budget 15-50\u20ac/mois par user.`;
  }
  if (s.includes("freelance") || s.includes("presta")) {
    return `Freelances tech/design/marketing 25-45 ans avec 5-15 clients simultan\u00e9s, factur\u00e9s 400-1200\u20ac/jour. Ils perdent 3-5h/semaine sur admin (devis, factures, relances, time tracking). Veulent un outil tout-en-un plus simple que Shine/Abby, qui int\u00e8gre leur workflow client (Linear, Slack, Notion). Budget 20-40\u20ac/mois.`;
  }
  if (s.includes("design tool") || s.includes("ia")) {
    return `Designers produit, founders techniques et product managers 28-45 ans qui prototypent 3-10 \u00e9crans/semaine. Ils utilisent d\u00e9j\u00e0 Figma + un outil IA (v0, Lovable, Galileo). Cherchent : qualit\u00e9 des outputs, coh\u00e9rence design system, export code React clean, it\u00e9ration rapide. Pr\u00eats \u00e0 payer 20-60\u20ac/mois si gain de temps 5x.`;
  }

  return `Audience cible : ${name} vise des professionnels/particuliers dans le secteur "${sector}". Pour affiner : d\u00e9finir l'\u00e2ge, le device principal, le niveau d'expertise et la disposition \u00e0 payer.`;
}

// ========================================
// VISION — phrase riche, issue du contexte + mission implicite
// ========================================
function inferVision(empire: EmpireProject | null, name: string, sector: string): string {
  if (empire?.description && empire.description.length > 30) {
    // Enrichir la description avec un angle produit
    const desc = empire.description.replace(/^[A-Z]+\s*[\u2014-]\s*/i, "");
    return `${name} : ${desc}. Mission : simplifier et d\u00e9livrer de la valeur d\u00e8s le premier contact utilisateur dans le secteur "${sector}".`;
  }
  return `${name} \u2014 produit dans le secteur ${sector}. Vision \u00e0 pr\u00e9ciser par Paul.`;
}

// ========================================
// PRIORITIES — 5 priorit\u00e9s riches, contextuelles, business-oriented
// ========================================
function inferPriorities(empire: EmpireProject | null, scan: ProjectScan, sector: string): string[] {
  const priorities: string[] = [];
  const s = sector.toLowerCase();

  // 1. Phases bloqu\u00e9es ou actives d'EmpireDONE — priorit\u00e9 absolue
  if (empire?.phases) {
    const blocked = empire.phases.filter((p) => p.status === "blocked");
    blocked.slice(0, 2).forEach((p) => {
      priorities.push(`\ud83d\udea7 Debloquer : ${p.name}${p.description ? ` (${p.description.slice(0, 60)})` : ""}`);
    });
    const active = empire.phases.filter((p) => p.status === "active");
    active.slice(0, 1).forEach((p) => {
      priorities.push(`\ud83c\udfaf Finaliser : ${p.name}`);
    });
  }

  // 2. Priorit\u00e9s m\u00e9tier sp\u00e9cifiques au secteur
  if (s.includes("productivit") || s.includes("life")) {
    priorities.push("Daily view unifi\u00e9e : tasks + habits + calendar en 1 \u00e9cran");
    priorities.push("Capture rapide universelle (shortcut clavier + mobile share)");
    priorities.push("Sync 2-way avec Google Calendar / Apple Calendar");
  } else if (s.includes("cuisine") || s.includes("food")) {
    priorities.push("Mode cuisson plein \u00e9cran mains-libres (voix + timer)");
    priorities.push("Liste de courses auto-g\u00e9n\u00e9r\u00e9e depuis la semaine");
    priorities.push("Filtre par ingr\u00e9dients du frigo");
  } else if (s.includes("trading") || s.includes("crypto")) {
    priorities.push("Dashboard temps r\u00e9el avec P&L multi-comptes");
    priorities.push("Backtest 1-click sur 5 ans de data");
    priorities.push("Alertes push sur niveaux techniques");
  } else if (s.includes("marketing") || s.includes("adtech")) {
    priorities.push("G\u00e9n\u00e9ration batch : 50 variantes creative en 1 prompt");
    priorities.push("Brand lock : palette + fonts + logos verrouill\u00e9s");
    priorities.push("Export multi-formats (Meta, TikTok, Google Display)");
  } else if (s.includes("nutrition") || s.includes("di\u00e9t")) {
    priorities.push("Scan code-barres pour logger un produit en 3 secondes");
    priorities.push("Graphe progression poids + macros hebdo");
    priorities.push("Programme personnalis\u00e9 (d\u00e9ficit calorique, prot\u00e9ines)");
  } else if (s.includes("e-commerce") || s.includes("ecom")) {
    priorities.push("Checkout 2 clics + Apple/Google Pay");
    priorities.push("Page produit avec reviews + photos utilisateurs");
    priorities.push("Recherche instant avec filtres live");
  } else if (s.includes("portfolio") || s.includes("vitrine")) {
    priorities.push("Hero statement qui accroche en 5 secondes");
    priorities.push("3-5 cases d'\u00e9tude avec impact chiffr\u00e9");
    priorities.push("Contact CTA visible permanent (email + calendly)");
  } else if (s.includes("sneaker")) {
    priorities.push("Drop calendar temps r\u00e9el avec alertes");
    priorities.push("Scan authenticit\u00e9 par photo");
    priorities.push("Watchlist + notifications de baisse prix");
  } else if (s.includes("crm") || s.includes("relation")) {
    priorities.push("Vue contact unifi\u00e9e : email + LinkedIn + notes");
    priorities.push("Rappels intelligents de follow-up");
    priorities.push("Import vCard / LinkedIn en 1 click");
  } else if (s.includes("freelance") || s.includes("presta")) {
    priorities.push("Devis \u2192 facture automatique en 1 click");
    priorities.push("Time tracking par client/projet");
    priorities.push("Relances automatiques des impay\u00e9s");
  } else if (s.includes("design tool")) {
    priorities.push("Export code React + Tailwind clean");
    priorities.push("Design system lock (colors, fonts, spacing)");
    priorities.push("Iterate en langage naturel");
  }

  // 3. UX de pages cl\u00e9s d\u00e9tect\u00e9es
  const corePages = scan.pages.filter((p) => /dashboard|home|landing|pricing|onboarding|checkout|settings|profile/.test(p.toLowerCase()));
  if (corePages.length > 0) {
    priorities.push(`Refonte UX page ${corePages[0]}`);
  }

  // D\u00e9dupliquer et limiter
  const seen = new Set<string>();
  return priorities.filter((p) => {
    const k = p.toLowerCase().slice(0, 40);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 6);
}

// ========================================
// MOOD — riche et contextuel
// ========================================
function inferMood(empire: EmpireProject | null, scan: ProjectScan, sector: string): string {
  const s = sector.toLowerCase();
  const desc = (empire?.description || "").toLowerCase();

  if (s.includes("trading") || s.includes("crypto")) return "Tech, data-driven, sobre, confiance, dark mode";
  if (s.includes("cuisine") || s.includes("food")) return "Chaleureux, app\u00e9tissant, simple, visuel, warmth";
  if (s.includes("nutrition") || s.includes("di\u00e9t")) return "Clair, motivant, non-culpabilisant, vert nature";
  if (s.includes("productivit") || s.includes("life")) return "Calme, focus, minimaliste, dark + light modes";
  if (s.includes("marketing") || s.includes("adtech")) return "Bold, impactant, cr\u00e9atif, \u00e9nergique, color\u00e9";
  if (s.includes("e-commerce")) return "Propre, rapide, produit-first, photos grandes";
  if (s.includes("portfolio")) return "Personnel, premium, typography-first, white space";
  if (s.includes("sneaker") || s.includes("streetwear")) return "Bold, urban, grid-focused, photo premium, dark";
  if (s.includes("crm") || s.includes("relation")) return "Pro, dense information, clair, efficient";
  if (s.includes("freelance") || s.includes("presta")) return "Rassurant, simple, pro, vert/bleu tranquille";
  if (s.includes("design tool")) return "Moderne, tech, dark mode, accent vibrant";
  if (desc.includes("luxe") || desc.includes("premium")) return "\u00c9l\u00e9gant, minimaliste, premium, serif, gold accents";

  return "Moderne, efficient, lisible, dark + light modes";
}

// ========================================
// CONSTRAINTS — compl\u00e8tes (tech + business + deploy)
// ========================================
function inferConstraints(empire: EmpireProject | null, scan: ProjectScan): string {
  const parts: string[] = [];
  const stack = scan.stack.framework || empire?.tech_stack;
  if (stack) parts.push(`Stack : ${stack}`);
  if (empire?.port) parts.push(`Port : ${empire.port}`);
  if (empire?.target_url) parts.push(`Deploy : ${empire.target_url}`);
  if (empire?.notes) parts.push(`Note projet : ${empire.notes.slice(0, 200)}`);
  if (empire?.progress?.blockers && empire.progress.blockers > 0) {
    parts.push(`\u26a0\ufe0f ${empire.progress.blockers} blocker(s) actif(s) \u00e0 traiter en priorit\u00e9`);
  }
  return parts.join(". ") || "Aucune contrainte technique bloquante identifi\u00e9e";
}

// ========================================
// AUDIT NOTES — riches, avec \u00e9moji, vraiment utiles
// ========================================
function buildAuditNotes(empire: EmpireProject | null, scan: ProjectScan, readme: string | undefined, commits: string[]): string[] {
  const notes: string[] = [];

  if (empire) {
    const prog = empire.progress;
    notes.push(`\u2705 EmpireDONE : ${empire.type || "type ?"} \u00b7 status ${empire.status} \u00b7 priority P${empire.priority}`);
    if (prog) notes.push(`\ud83d\udcca Progression : ${prog.pct}% (${prog.done}/${prog.total} phases)${prog.blockers ? ` \u00b7 \u26a0\ufe0f ${prog.blockers} blockers` : ""}`);
    if (empire.phases?.length) {
      const blocked = empire.phases.filter((p) => p.status === "blocked").map((p) => p.name);
      const active = empire.phases.filter((p) => p.status === "active").map((p) => p.name);
      if (blocked.length) notes.push(`\ud83d\udea7 Phases bloqu\u00e9es : ${blocked.slice(0, 3).join(", ")}`);
      if (active.length) notes.push(`\ud83d\udd04 Phases actives : ${active.slice(0, 3).join(", ")}`);
    }
  } else {
    notes.push(`\u26a0\ufe0f Projet absent d'EmpireDONE \u2014 audit bas\u00e9 uniquement sur le code local`);
  }

  notes.push(`\ud83d\udcc4 Code : ${scan.pages.length} pages \u00b7 ${scan.components.length} composants \u00b7 ${Object.keys(scan.tokens).length} tokens CSS`);
  if (scan.envVars.length > 0) notes.push(`\ud83d\udd10 ${scan.envVars.length} variables d'environnement (${scan.envVars.slice(0, 3).join(", ")}${scan.envVars.length > 3 ? "\u2026" : ""})`);

  if (readme) {
    const firstLine = readme.split("\n").find((l) => l.trim().length > 10 && !l.startsWith("#"));
    if (firstLine) notes.push(`\ud83d\udcd6 README : ${firstLine.slice(0, 120).trim()}\u2026`);
  }

  if (commits.length > 0) {
    notes.push(`\ud83d\udcdd ${commits.length} commits r\u00e9cents : ${commits.slice(0, 2).map((c) => c.split(" ").slice(-5).join(" ")).join(" \u00b7 ")}`);
  }

  return notes;
}

// ========================================
// AUDIT PRINCIPAL
// ========================================
export async function auditProject(projectPath: string, slug: string): Promise<AuditedBrief> {
  const scan = scanProject(projectPath);
  const empireData = await fetchEmpireProject(slug);
  const readme = readReadme(projectPath);
  const recentCommits = readGitLog(projectPath);

  const type = inferProjectType(empireData, scan);
  const device = inferDevice(empireData, scan);

  // Sector + competitors en priorit\u00e9 (knowledge base)
  const kb = matchKnownCompetitors(slug, empireData?.description || "", scan.name);
  const sector = kb?.sector || inferSectorFromContent(empireData, scan);
  const knownCompetitors = kb?.competitors || [];
  const suggestedKeywords = kb?.keywords || [];

  const audience = inferAudience(empireData, sector, scan.name);
  const vision = inferVision(empireData, scan.name, sector);
  const priorities = inferPriorities(empireData, scan, sector);
  const mood = inferMood(empireData, scan, sector);
  const constraints = inferConstraints(empireData, scan);

  const auditNotes = buildAuditNotes(empireData, scan, readme, recentCommits);

  // Enrichissement produit complet (v3)
  const enriched = enrichBrief({
    name: scan.name,
    slug,
    sector,
    device,
  });

  return {
    scan,
    empireData: empireData || undefined,
    autofilled: { type, sector, audience, vision, priorities, mood, device, constraints },
    auditNotes,
    targetUrl: empireData?.target_url,
    knownCompetitors,
    suggestedKeywords,
    readmeExcerpt: readme?.slice(0, 500),
    recentCommits,
    enriched,
  };
}

function inferSectorFromContent(empire: EmpireProject | null, scan: ProjectScan): string {
  const text = ((empire?.description || "") + " " + scan.claudeMdSummary).toLowerCase();
  if (/cuisine|recette|food|diet|nutrition/.test(text)) return "Cuisine & nutrition";
  if (/trading|crypto|bourse|finance/.test(text)) return "Finance & trading";
  if (/ecom|vente|shop|retail/.test(text)) return "E-commerce";
  if (/marketing|ads|pub/.test(text)) return "Marketing & AdTech";
  if (/sant|m\u00e9dical|health|fitness/.test(text)) return "Sant\u00e9 & fitness";
  if (/\u00e9ducation|apprent|cours/.test(text)) return "\u00c9ducation";
  if (/productivit|habit|task|life.?os/.test(text)) return "Productivit\u00e9 & life management";
  if (/freelance|facture|invoice/.test(text)) return "Freelance & facturation";
  if (/portfolio|vitrine/.test(text)) return "Portfolio / site vitrine";
  return "\u00c0 d\u00e9finir avec Paul";
}
