import type {
  Persona, ValueProp, FeatureTier, UserJourneyStep, MarketingAngle, Risk, RoadmapPhase,
} from "@/types/pipeline";

type SectorKey = "lifeos" | "miam" | "dietplus" | "aurax" | "adforge" | "popon" | "sneaksclap"
  | "dimension" | "relationsense" | "presta" | "matthias" | "stitch" | "default";

function detectSectorKey(sector: string, slug: string): SectorKey {
  const s = (sector + " " + slug).toLowerCase();
  if (/productivit|life.?os|habit|task|personal os/.test(s)) return "lifeos";
  if (/cuisine|food|recette|meal/.test(s) && !/nutrition|diet/.test(s)) return "miam";
  if (/nutrition|diet|calorie/.test(s)) return "dietplus";
  if (/trading|crypto|finance|bourse/.test(s)) return "aurax";
  if (/marketing|adtech|ad |creative/.test(s)) return "adforge";
  if (/e-?commerce|ecom|shop|retail/.test(s)) return "popon";
  if (/sneaker|streetwear|drop/.test(s)) return "sneaksclap";
  if (/agence|brand|creative studio/.test(s)) return "dimension";
  if (/crm|relation|contact/.test(s)) return "relationsense";
  if (/freelance|facture|invoice/.test(s)) return "presta";
  if (/portfolio|vitrine|personal site/.test(s)) return "matthias";
  if (/design tool|stitch|figma|ui generator/.test(s)) return "stitch";
  return "default";
}

// ========================================
// PERSONAS (2-3 par secteur, ultra-détaillés)
// ========================================
const PERSONAS: Record<SectorKey, Persona[]> = {
  lifeos: [
    {
      name: "Léa",
      role: "Product Manager freelance",
      age: "32 ans",
      painPoints: [
        "3 outils différents pour tasks/habits/calendar, rien ne communique",
        "Notion trop flexible → elle passe plus de temps à organiser qu'à exécuter",
        "Loupe ses habitudes quand elle est en déplacement client",
      ],
      budget: "12€/mois (paye déjà Notion + Todoist)",
      discoveryChannel: "Twitter/X (suit Julian Lehr, Linus Lee)",
      quote: "Je veux UN endroit qui me dit quoi faire maintenant, sans que je réfléchisse.",
    },
    {
      name: "Maxime",
      role: "CTO startup early-stage",
      age: "38 ans",
      painPoints: [
        "Sunsama est trop léger, Motion est trop prescriptif",
        "Ses deep work blocks sont interrompus par des tasks ops non planifiées",
        "Calendrier éclaté entre Google Workspace et Apple Calendar perso",
      ],
      budget: "25€/mois si l'outil lui rend 5h/semaine",
      discoveryChannel: "Product Hunt + recommandation peer founders",
      quote: "Je cherche l'outil que je garderai 5 ans, pas un énième wrapper au-dessus de Notion.",
    },
  ],
  miam: [
    {
      name: "Camille",
      role: "Chargée de marketing, maman de 1 enfant",
      age: "33 ans",
      painPoints: [
        "Panne d'inspiration chaque soir à 18h pour le dîner",
        "Marmiton a des pubs partout, recettes inégales",
        "Les ingrédients du frigo vont à la poubelle car pas de suggestion adaptée",
      ],
      budget: "6€/mois si ça évite le gaspillage alimentaire",
      discoveryChannel: "Instagram food creators + TikTok",
      quote: "Dis-moi quoi cuisiner en 30 min avec ce que j'ai, c'est tout ce que je veux.",
    },
    {
      name: "Thomas",
      role: "Dev fullstack, vit seul",
      age: "28 ans",
      painPoints: [
        "Mange souvent au resto par flemme de cuisiner",
        "Cherche à maîtriser les bases (pas de gastronomie)",
        "Mode cuisson avec les mains sales = galère sur un iPhone",
      ],
      budget: "Gratuit d'abord, freemium OK, 5€/mois max",
      discoveryChannel: "Apple App Store (featured) + YouTube food explainers",
      quote: "Une app cuisine simple qui m'apprend 20 plats pour toute ma vie.",
    },
  ],
  dietplus: [
    {
      name: "Sarah",
      role: "Commerciale B2B, post-grossesse",
      age: "34 ans",
      painPoints: [
        "MyFitnessPal intimidant + UI datée",
        "Tracker le midi au resto d'entreprise = impossible sans scan",
        "Culpabilisation des apps rigides quand elle craque le weekend",
      ],
      budget: "8€/mois sans hésiter si ça marche",
      discoveryChannel: "Recommandation coach sportif + Instagram wellness",
      quote: "Je veux comprendre ce que je mange, pas me faire engueuler par une app.",
    },
  ],
  aurax: [
    {
      name: "Antoine",
      role: "Développeur senior, trader retail weekend",
      age: "34 ans",
      painPoints: [
        "3commas trop cher et abonnement par stratégie",
        "Pas confiance dans les bots qui demandent les API keys clear",
        "Backtest TradingView limité + coûte 60€/mois additional",
      ],
      budget: "30-80€/mois + revenue share sur gains",
      discoveryChannel: "Reddit r/algotrading + YouTube Nick Sias",
      quote: "Montre-moi le backtest sur 5 ans, pas un screenshot marketing.",
    },
  ],
  adforge: [
    {
      name: "Marine",
      role: "Performance Marketing Manager, scale-up B2C",
      age: "29 ans",
      painPoints: [
        "50 variants de creative/semaine manuellement = burn out",
        "Agence = 3 semaines de délai + factures 15k€",
        "Canva = pas brand consistency, Figma = pas de scale",
      ],
      budget: "200-500€/mois + CPM optimization",
      discoveryChannel: "LinkedIn (thought leaders CMO) + CMO Summit",
      quote: "Je veux générer 100 variantes dans ma brand, pas repartir de 0 à chaque campagne.",
    },
  ],
  popon: [
    {
      name: "Julie",
      role: "Créatrice contenu, micro-entrepreneuse",
      age: "27 ans",
      painPoints: [
        "Shopify = trop technique + 29€/mois min",
        "Instagram Shopping = pas de contrôle",
        "Besoin de vendre 1-3 produits, pas une boutique de 100 SKUs",
      ],
      budget: "10-20€/mois, pas plus",
      discoveryChannel: "TikTok creators + Instagram Reels",
      quote: "Juste une page propre où je vends mon produit, pas besoin d'une boutique complète.",
    },
  ],
  sneaksclap: [
    {
      name: "Kylian",
      role: "Étudiant en école de commerce, sneakerhead",
      age: "22 ans",
      painPoints: [
        "GOAT et StockX = délais longs + frais cachés",
        "Rate les drops Nike SNKRS à cause du timing EU",
        "Pas de communauté française de collectionneurs",
      ],
      budget: "Panier 200€ moyen, 3-5 achats/mois",
      discoveryChannel: "TikTok sneakers + Instagram reselling accounts",
      quote: "Je veux les drops avant tout le monde et acheter sans me faire arnaquer.",
    },
  ],
  dimension: [
    {
      name: "Cédric",
      role: "CTO fintech Series A",
      age: "40 ans",
      painPoints: [
        "Les agences classiques livrent des templates, pas du sur-mesure",
        "Design générique ne reflète pas la complexité du produit",
        "Besoin de conversion + crédibilité enterprise",
      ],
      budget: "30-80k€ projet refonte site vitrine",
      discoveryChannel: "Recommandation peers founders + portfolio Awwwards",
      quote: "Je cherche une agence qui comprend la tech, pas des faiseurs de pages Wix.",
    },
  ],
  relationsense: [
    {
      name: "Nathan",
      role: "Business Developer, scale-up SaaS",
      age: "31 ans",
      painPoints: [
        "HubSpot = 80€/mois + 3 heures de setup par deal",
        "Excel de contacts = cimetière de leads oubliés",
        "Pas de contexte quand il reprend contact 6 mois plus tard",
      ],
      budget: "25-50€/mois par user",
      discoveryChannel: "LinkedIn (growth communities) + podcasts B2B",
      quote: "Je veux savoir qui relancer aujourd'hui, avec le bon contexte, en 3 clics.",
    },
  ],
  presta: [
    {
      name: "Aurélien",
      role: "Freelance développeur, 800€/jour",
      age: "33 ans",
      painPoints: [
        "Shine = bancaire seul, pas de gestion de projet",
        "Abby = correct mais UX datée",
        "3-5h/semaine sur admin (devis, relances, factures)",
      ],
      budget: "20-30€/mois all-in",
      discoveryChannel: "Malt communauté + Indie Hackers",
      quote: "Je veux factuer en 30 secondes depuis mon mobile entre 2 meetings.",
    },
  ],
  matthias: [
    {
      name: "Nina",
      role: "Head of Engineering, scale-up fintech",
      age: "42 ans",
      painPoints: [
        "Évalue 20 candidats/semaine → décision en 30 sec par portfolio",
        "Portfolios génériques Wix/Webflow = red flag",
        "Cherche des profils techniques seniors rares",
      ],
      budget: "N/A — visiteur (recruteur)",
      discoveryChannel: "LinkedIn + référent technique",
      quote: "Montre-moi 3 projets avec leur impact chiffré, sinon next.",
    },
  ],
  stitch: [
    {
      name: "Paul",
      role: "Founder solo, designer + dev",
      age: "33 ans",
      painPoints: [
        "Figma + 1 designer externe = 2 semaines pour 3 écrans",
        "v0.dev génère du générique sans ma brand",
        "Itérer demande de réexpliquer tout le contexte à chaque fois",
      ],
      budget: "40-80€/mois si 5x gain de temps",
      discoveryChannel: "Twitter/X dev + Product Hunt launches",
      quote: "Je veux 20 maquettes dans ma brand en 1h, pas 2 semaines.",
    },
  ],
  default: [
    {
      name: "Utilisateur type",
      role: "À préciser selon positionnement",
      age: "25-45 ans",
      painPoints: ["Pain point principal à identifier", "Friction UX actuelle", "Coût ou délai trop élevé"],
      budget: "À définir selon modèle (freemium, abonnement, one-shot)",
      discoveryChannel: "Canal principal à identifier",
      quote: "Citation représentative à préciser avec Paul",
    },
  ],
};

// ========================================
// POSITIONING + USP
// ========================================
function buildPositioning(key: SectorKey, name: string): { positioning: string; usp: string } {
  const map: Record<SectorKey, { positioning: string; usp: string }> = {
    lifeos: {
      positioning: `${name} est l'OS de vie des knowledge workers français. Entre Notion (trop flexible) et Motion (trop prescriptif), ${name} unifie tasks, habits et calendar dans une daily view actionnable — pour arrêter de gérer son système et commencer à exécuter.`,
      usp: "La daily view qui remplace 3 outils : tout ce qui compte aujourd'hui, dans l'ordre, sans setup.",
    },
    miam: {
      positioning: `${name} réconcilie les Français avec la cuisine quotidienne. Face à Marmiton (pubs + recettes inégales) et HelloFresh (abonnement contraignant), ${name} propose des recettes adaptées à ton frigo, en 30 min, avec un mode cuisson plein écran mains-libres.`,
      usp: "Dis-moi ce que j'ai dans le frigo, je te dis quoi cuisiner en 30 min.",
    },
    dietplus: {
      positioning: `${name} est le tracker nutrition bienveillant. Face à MyFitnessPal (intimidant) et Noom (coaching cher), ${name} aide les adultes à comprendre leur alimentation sans culpabilisation, avec scan code-barres et progression hebdo claire.`,
      usp: "Comprendre ce que tu manges en 3 secondes par jour, sans régime dogmatique.",
    },
    aurax: {
      positioning: `${name} est la plateforme de trading algorithmique pour retail sérieux. Face à 3commas (cher, fragmenté) et TradingView (pas d'exécution), ${name} permet de backtester, déployer et monitorer des stratégies en un endroit, avec sécurité API garantie.`,
      usp: "Du backtest 5 ans au trading live, sans quitter la plateforme.",
    },
    adforge: {
      positioning: `${name} industrialise la production de creatives publicitaires IA. Face à Canva (pas de scale) et agences (trop lentes), ${name} génère 50 variantes par campagne dans la brand, exportables en 1 click sur Meta/TikTok/Google.`,
      usp: "50 variants dans ta brand en 5 minutes, pas 5 jours.",
    },
    popon: {
      positioning: `${name} est la boutique minute pour créateurs. Face à Shopify (trop complexe) et Instagram Shopping (pas de contrôle), ${name} permet de vendre 1-3 produits en 5 minutes avec paiement Stripe intégré.`,
      usp: "De l'idée produit au premier paiement en 5 minutes.",
    },
    sneaksclap: {
      positioning: `${name} est la marketplace sneakers française transparente. Face à GOAT (délais) et StockX (frais cachés), ${name} offre drops en temps réel, authentification garantie et communauté française active.`,
      usp: "Les drops avant tout le monde, authentifiés, sans frais cachés.",
    },
    dimension: {
      positioning: `${name} est l'agence design & dev pour scale-ups tech. Face aux agences classiques (templates génériques) et freelances seniors (scope limité), ${name} livre du sur-mesure qui comprend la tech.`,
      usp: "L'agence qui comprend votre produit avant de faire votre design.",
    },
    relationsense: {
      positioning: `${name} est le CRM relationnel pour solos et petites équipes. Face à HubSpot (usine à gaz) et Excel (statique), ${name} donne une vue unifiée des relations avec rappels intelligents et capture auto depuis email/LinkedIn.`,
      usp: "Savoir qui relancer aujourd'hui, avec le bon contexte, en 3 clics.",
    },
    presta: {
      positioning: `${name} est l'outil all-in-one des freelances premium. Face à Shine (bancaire seul) et Abby (UX datée), ${name} automatise devis → facture → relances avec time tracking intégré.`,
      usp: "Factuer en 30 secondes depuis mon mobile entre deux meetings.",
    },
    matthias: {
      positioning: `${name} est un portfolio de senior engineer qui convertit en 30 secondes. Face aux templates Webflow génériques, ${name} met l'impact chiffré en avant avec un design premium qui signale le niveau.`,
      usp: "3 projets chiffrés, 30 secondes, un entretien booké.",
    },
    stitch: {
      positioning: `${name} est le générateur de maquettes IA pour founders et designers. Face à Figma (manuel) et v0.dev (générique), ${name} produit 20 maquettes dans ta brand en 1h avec code React exportable.`,
      usp: "20 maquettes dans ta brand en 1 heure, avec le code en bonus.",
    },
    default: {
      positioning: `${name} se positionne sur le secteur indiqué avec une approche à définir avec Paul.`,
      usp: "À définir avec Paul",
    },
  };
  return map[key];
}

// ========================================
// VALUE PROPS (3-5 par secteur)
// ========================================
function buildValueProps(key: SectorKey): ValueProp[] {
  const map: Record<SectorKey, ValueProp[]> = {
    lifeos: [
      { title: "Daily view unifiée", description: "Une seule page qui répond à 'qu'est-ce que je fais maintenant ?'" },
      { title: "Capture universelle", description: "Ajouter une task/note en 2 secondes depuis mobile, desktop, ou share sheet" },
      { title: "Sync 2-way calendar", description: "Google Calendar et Apple Calendar restent la source de vérité" },
      { title: "Focus mode", description: "Blocage distractions + minuteur Pomodoro intégré" },
      { title: "Review hebdo automatisée", description: "Récap des habitudes, tasks complétées, heures de focus" },
    ],
    miam: [
      { title: "Recettes depuis ton frigo", description: "Photo du frigo → 3 recettes adaptées en 30 min max" },
      { title: "Mode cuisson mains-libres", description: "Plein écran, voix, timer intégré, zéro interaction nécessaire" },
      { title: "Liste courses auto-générée", description: "Planif de la semaine → liste groupée par rayon supermarché" },
      { title: "Adaptation régime + allergies", description: "Filtre véggie, sans gluten, sans lactose, calorique" },
      { title: "Apprentissage progressif", description: "20 techniques de base maîtrisées en 30 jours" },
    ],
    dietplus: [
      { title: "Scan code-barres 3 sec", description: "Photo d'un produit → log automatique avec macros détaillées" },
      { title: "Tracking bienveillant", description: "Pas de honte, pas de limite stricte, juste comprendre" },
      { title: "Progression hebdomadaire", description: "Graphe poids + macros + compliance, pas journalière" },
      { title: "Personnalisé après-J7", description: "Déficit, protéines, fibres calibrés sur les données perso" },
    ],
    aurax: [
      { title: "Backtest 5 ans en 1 click", description: "Stratégie → résultat historique + drawdown max" },
      { title: "Sécurité API verrouillée", description: "Read-only trading, 2FA, IP whitelist, pas de withdrawal" },
      { title: "Dashboard temps réel multi-exchanges", description: "Binance + Kraken + OKX dans une même vue P&L" },
      { title: "Alertes intelligentes", description: "RSI, moving average, volume spike — push + email + SMS" },
      { title: "Marketplace stratégies", description: "Copy trading depuis traders vérifiés, revenue share" },
    ],
    adforge: [
      { title: "Brand lock", description: "Palette, fonts, logos verrouillés, aucune dérive possible" },
      { title: "Batch 50 variants", description: "1 prompt → 50 variants en parallèle, review en grille" },
      { title: "Export multi-plateformes", description: "Meta, TikTok, Google Display avec les bons ratios automatiques" },
      { title: "A/B test ready", description: "Export direct dans Meta Ads Manager, tracking auto" },
    ],
    popon: [
      { title: "Boutique en 5 minutes", description: "Photo + description + prix → URL shoppable" },
      { title: "Checkout 2 clics", description: "Apple Pay / Google Pay, pas de compte obligatoire" },
      { title: "Zero config Stripe", description: "On-boarding Stripe intégré, premier paiement J+1" },
      { title: "Mobile-first", description: "99% des acheteurs mobile, optimisé TikTok + Instagram" },
    ],
    sneaksclap: [
      { title: "Drop calendar temps réel", description: "Toutes les sorties EU avec alertes 1h avant" },
      { title: "Authentification garantie", description: "Remboursement intégral si contrefaçon détectée" },
      { title: "Communauté française", description: "Chat par modèle, reviews, conseils entre collectionneurs" },
      { title: "Prix transparent", description: "Frais affichés avant paiement, pas de surprise" },
    ],
    dimension: [
      { title: "Compréhension tech", description: "L'équipe a codé, pas juste designé" },
      { title: "Design system scalable", description: "Livrable Figma + tokens + documentation, pas juste PNG" },
      { title: "Conversion first", description: "Chaque décision design justifiée par impact business" },
      { title: "Livraison garantie", description: "Planning respecté ou pénalités, 15 ans d'expérience" },
    ],
    relationsense: [
      { title: "Vue relation 360", description: "Emails + LinkedIn + meetings + notes dans un timeline" },
      { title: "Rappel intelligent", description: "Score fraîcheur, suggestion de next action" },
      { title: "Capture auto", description: "Extension Chrome qui sauve depuis LinkedIn et Gmail" },
      { title: "Setup 5 minutes", description: "Import CSV/Google Contacts → prêt à utiliser" },
    ],
    presta: [
      { title: "Devis → facture en 1 click", description: "Pas de ressaisie, branding perso, envoi email auto" },
      { title: "Time tracking par client", description: "Démarre/stop depuis menu bar, facturation au temps passé" },
      { title: "Relances auto impayés", description: "J+7, J+15, J+30 avec ton personnalisable" },
      { title: "Export compta", description: "FEC, Shine, Qonto, ou PDF pour ton expert-comptable" },
    ],
    matthias: [
      { title: "Impact chiffré", description: "Chaque projet avec métriques (users, revenue, équipe scalée)" },
      { title: "Stack visible", description: "Tech choisie, pourquoi, résultats — pas juste le logo" },
      { title: "Premium feel", description: "Typography editorial, white space, transitions fluides" },
      { title: "Contact low-friction", description: "Calendly + email visible, réponse en 24h garantie" },
    ],
    stitch: [
      { title: "Génération dans ta brand", description: "Upload une fois, verrouille couleurs + fonts pour toutes les maquettes" },
      { title: "Iteration conversationnelle", description: "'Rends la hero plus bold' → régénération instantanée" },
      { title: "Export code React", description: "Next.js + Tailwind clean, pas du Figma dev mode" },
      { title: "Prototypage rapide", description: "20 écrans en 1h, du wireframe à la validation" },
    ],
    default: [
      { title: "Proposition 1", description: "À définir avec Paul" },
      { title: "Proposition 2", description: "À définir avec Paul" },
      { title: "Proposition 3", description: "À définir avec Paul" },
    ],
  };
  return map[key];
}

// ========================================
// USER JOURNEY (parcours découverte → rétention)
// ========================================
function buildUserJourney(key: SectorKey): UserJourneyStep[] {
  const map: Record<SectorKey, UserJourneyStep[]> = {
    lifeos: [
      { stage: "discovery", label: "Découverte", description: "Tweet d'un power-user ou article comparatif Notion vs alternatives" },
      { stage: "onboarding", label: "Onboarding", description: "Connexion Google Calendar + import des tasks Todoist en 2 minutes" },
      { stage: "activation", label: "Activation (J1)", description: "Première daily view complète : 3 tasks + 2 habits + 4 events bien alignés" },
      { stage: "retention", label: "Rétention", description: "Ouverture quotidienne matin + soir pendant 14 jours consécutifs" },
      { stage: "referral", label: "Referral", description: "Invite un peer founder après 30j car gain de temps mesurable" },
    ],
    miam: [
      { stage: "discovery", label: "Découverte", description: "Reel Instagram / TikTok 'recette rapide frigo vide'" },
      { stage: "onboarding", label: "Onboarding", description: "Indiquer régime alimentaire + équipement cuisine (5 questions)" },
      { stage: "activation", label: "Activation", description: "Première recette cuisinée jusqu'au bout avec mode cuisson" },
      { stage: "retention", label: "Rétention", description: "3-5 recettes cuisinées/semaine, utilisation quotidienne 18h-20h" },
      { stage: "referral", label: "Referral", description: "Partage de recette réussie sur Instagram ou à un ami" },
    ],
    dietplus: [
      { stage: "discovery", label: "Découverte", description: "Instagram wellness influenceur ou recommandation coach sportif" },
      { stage: "onboarding", label: "Onboarding", description: "Objectif (perte/maintien/prise), poids actuel, calcul BMR en 3 questions" },
      { stage: "activation", label: "Activation (J3)", description: "Première semaine loggée complète avec graphe progression" },
      { stage: "retention", label: "Rétention", description: "Scan code-barres quotidien pendant 30j, moyenne 2-3 repas loggés" },
      { stage: "referral", label: "Referral", description: "Partage progression perso (challenge amis, transformation)" },
    ],
    aurax: [
      { stage: "discovery", label: "Découverte", description: "Post Reddit /r/algotrading ou YouTube tutoriel bot trading" },
      { stage: "onboarding", label: "Onboarding", description: "Connexion Binance en read-only + premier backtest strategy templatée" },
      { stage: "activation", label: "Activation", description: "Déploiement premier bot live avec capital test (100€)" },
      { stage: "retention", label: "Rétention", description: "Ajustements strategy hebdo, ajout paires, montée capital graduelle" },
      { stage: "referral", label: "Referral", description: "Partage stratégie sur marketplace, génération revenue share" },
    ],
    adforge: [
      { stage: "discovery", label: "Découverte", description: "LinkedIn post d'un growth marketer + démo Product Hunt" },
      { stage: "onboarding", label: "Onboarding", description: "Upload brand kit (logo + palette + fonts) + connexion Meta Ads" },
      { stage: "activation", label: "Activation (semaine 1)", description: "Génération 50 variantes + lancement première campagne" },
      { stage: "retention", label: "Rétention", description: "3-5 campagnes/mois, ajustement prompts selon performance CPM" },
      { stage: "referral", label: "Referral", description: "CMO recommande à peer dans CMO community" },
    ],
    popon: [
      { stage: "discovery", label: "Découverte", description: "TikTok creator qui vend via popon en story" },
      { stage: "onboarding", label: "Onboarding", description: "Ajout produit (photo + prix + description) en 3 min + Stripe connect" },
      { stage: "activation", label: "Activation", description: "Première vente (J1-J3) depuis partage Instagram" },
      { stage: "retention", label: "Rétention", description: "Ajout nouveau produit toutes les 2 semaines" },
      { stage: "referral", label: "Referral", description: "Partage entre créatrices communauté (code parrainage)" },
    ],
    sneaksclap: [
      { stage: "discovery", label: "Découverte", description: "TikTok sneakers community + Instagram drops alerts" },
      { stage: "onboarding", label: "Onboarding", description: "Taille + modèles suivis + notifs drops activées" },
      { stage: "activation", label: "Activation", description: "Premier achat sécurisé authentifié" },
      { stage: "retention", label: "Rétention", description: "3-5 achats/mois, watchlist active, participation communauté" },
      { stage: "referral", label: "Referral", description: "Code parrainage partagé entre sneakerheads" },
    ],
    dimension: [
      { stage: "discovery", label: "Découverte", description: "Recommandation peer founder ou portfolio Awwwards" },
      { stage: "onboarding", label: "Onboarding", description: "Brief call 1h + proposition commerciale J+3" },
      { stage: "activation", label: "Activation", description: "Signature contrat + kick-off meeting" },
      { stage: "retention", label: "Rétention (post-livraison)", description: "Maintenance + évolutions + autres projets" },
      { stage: "referral", label: "Referral", description: "Témoignage client + recommandation peer" },
    ],
    relationsense: [
      { stage: "discovery", label: "Découverte", description: "LinkedIn post growth community ou podcast B2B" },
      { stage: "onboarding", label: "Onboarding", description: "Import CSV contacts + connexion Gmail/LinkedIn" },
      { stage: "activation", label: "Activation (J7)", description: "Premier follow-up envoyé depuis l'app avec contexte" },
      { stage: "retention", label: "Rétention", description: "Usage quotidien pour pipeline management" },
      { stage: "referral", label: "Referral", description: "Invitation collègues sales, expansion équipe" },
    ],
    presta: [
      { stage: "discovery", label: "Découverte", description: "Malt communauté ou Indie Hackers thread" },
      { stage: "onboarding", label: "Onboarding", description: "Profil pro + SIRET + premier devis (5 min)" },
      { stage: "activation", label: "Activation", description: "Première facture payée par un client" },
      { stage: "retention", label: "Rétention", description: "3-5 factures/mois, time tracking actif" },
      { stage: "referral", label: "Referral", description: "Communauté freelance, recommandation entre pairs" },
    ],
    matthias: [
      { stage: "discovery", label: "Découverte", description: "LinkedIn profile click ou lien depuis email" },
      { stage: "onboarding", label: "Onboarding", description: "N/A (site vitrine)" },
      { stage: "activation", label: "Activation", description: "Scroll jusqu'à 3+ projets + click contact" },
      { stage: "retention", label: "Retention (recruteur)", description: "Bookmark pour partager à l'équipe" },
      { stage: "referral", label: "Referral", description: "Partage en interne équipe recrutement" },
    ],
    stitch: [
      { stage: "discovery", label: "Découverte", description: "Twitter/X design community ou Product Hunt launch" },
      { stage: "onboarding", label: "Onboarding", description: "Upload brand guidelines + première maquette hero" },
      { stage: "activation", label: "Activation (J1)", description: "5 maquettes générées dans la brand" },
      { stage: "retention", label: "Rétention", description: "Utilisation hebdomadaire pour nouveaux projets" },
      { stage: "referral", label: "Referral", description: "Partage sur Twitter ou LinkedIn avec before/after" },
    ],
    default: [
      { stage: "discovery", label: "Découverte", description: "Canal principal à identifier" },
      { stage: "onboarding", label: "Onboarding", description: "Flow à concevoir" },
      { stage: "activation", label: "Activation", description: "Moment 'aha' à identifier" },
      { stage: "retention", label: "Rétention", description: "Habitude à créer" },
      { stage: "referral", label: "Referral", description: "Mécanisme viral à imaginer" },
    ],
  };
  return map[key];
}

// ========================================
// MARKETING ANGLES (3 angles différenciés)
// ========================================
function buildMarketingAngles(key: SectorKey): MarketingAngle[] {
  const map: Record<SectorKey, MarketingAngle[]> = {
    lifeos: [
      { angle: "Remplace 3 outils", hook: "Notion + Todoist + Calendar = 180€/an. Remplace-les par un seul pour 60€/an.", channel: "Twitter/X founders" },
      { angle: "Daily view magique", hook: "'Qu'est-ce que je fais maintenant ?' → 1 réponse, pas 10 onglets.", channel: "Product Hunt + YouTube demos" },
      { angle: "Built for deep work", hook: "L'OS des makers qui veulent exécuter, pas gérer leur système.", channel: "Indie Hackers + Hacker News" },
    ],
    miam: [
      { angle: "Anti-gaspillage", hook: "Ton frigo sait quoi cuisiner. Photo → recette en 30 min.", channel: "Instagram Reels food" },
      { angle: "Cuisiner en couple", hook: "Le dîner en 30 min, sans débat, même quand t'es crevé.", channel: "Facebook groupes parents" },
      { angle: "Apprendre les bases", hook: "20 plats pour toute ta vie. Ta grand-mère serait fière.", channel: "TikTok cooking creators" },
    ],
    dietplus: [
      { angle: "Sans culpabilité", hook: "Comprendre ce que tu manges, sans te faire engueuler par une app.", channel: "Instagram wellness" },
      { angle: "3 secondes par repas", hook: "Scan code-barres, log auto. C'est tout.", channel: "TikTok fitness" },
      { angle: "Progression visible", hook: "Graphe clair chaque semaine. Pas de daily guilt trip.", channel: "Instagram transformations" },
    ],
    aurax: [
      { angle: "Backtest-first", hook: "Montre-moi le backtest 5 ans avant de me vendre ton bot.", channel: "Reddit /r/algotrading" },
      { angle: "Sécurité garantie", hook: "Read-only trading. 2FA. Pas de withdrawal. Ton capital reste chez toi.", channel: "Twitter crypto communities" },
      { angle: "Revenue share créateurs", hook: "Partage tes stratégies, gagne sur chaque abonné.", channel: "YouTube tutoriels trading" },
    ],
    adforge: [
      { angle: "50 variants en 5 min", hook: "La production d'une semaine d'agence en 5 minutes.", channel: "LinkedIn CMOs" },
      { angle: "Brand consistency locked", hook: "Verrouille ta brand une fois. Jamais de dérive.", channel: "Product Hunt + YouTube" },
      { angle: "ROI calculé", hook: "Un seul winning creative identifié = 500€/mois amortis.", channel: "CMO Summit + webinars growth" },
    ],
    popon: [
      { angle: "En 5 minutes", hook: "Photo, prix, vendu. La boutique créatrice minimaliste.", channel: "TikTok creators" },
      { angle: "Anti-Shopify", hook: "Shopify = 30€/mois pour vendre 1 produit ? Non merci.", channel: "Instagram Reels creators" },
      { angle: "Checkout 2 clics", hook: "Apple Pay. Google Pay. Pas de compte. Point.", channel: "TikTok ads" },
    ],
    sneaksclap: [
      { angle: "Drops avant tout le monde", hook: "Les sorties EU 1h avant, avec notifs. Sois premier.", channel: "TikTok sneakers community" },
      { angle: "Zero fake", hook: "100% authentifiées. Garantie rembourséée. Pas de doute.", channel: "Instagram sneakers influenceurs" },
      { angle: "Communauté FR", hook: "La 1ère communauté française de collectionneurs sneakers.", channel: "Discord + Twitter/X" },
    ],
    dimension: [
      { angle: "Agence tech-first", hook: "On code + on designe. Vous avez une équipe qui comprend votre produit.", channel: "LinkedIn CTOs" },
      { angle: "Case studies chiffrées", hook: "+42% de conversion pour [client X] en 3 mois. On peut montrer.", channel: "Portfolio + Awwwards submission" },
      { angle: "Livraison garantie", hook: "Planning respecté ou pénalités. 15 ans d'expérience.", channel: "Recommandations peers founders" },
    ],
    relationsense: [
      { angle: "Anti-HubSpot", hook: "HubSpot, c'est 3h de setup par deal. Nous : 3 clics, c'est tout.", channel: "LinkedIn BDR community" },
      { angle: "Vue relation 360", hook: "Emails + LinkedIn + meetings en un timeline. Jamais perdre le contexte.", channel: "Podcast B2B + Indie Hackers" },
      { angle: "Capture automatique", hook: "Extension Chrome. 0 ressaisie. 0 oubli.", channel: "Product Hunt + Twitter B2B" },
    ],
    presta: [
      { angle: "Mobile-first facturation", hook: "Factuer en 30 secondes entre 2 meetings, depuis ton téléphone.", channel: "Malt + LinkedIn freelance" },
      { angle: "3-5h gagnées/semaine", hook: "Le temps que tu passais sur admin = 3-5h. Reprends-les.", channel: "Indie Hackers threads" },
      { angle: "All-in-one freelance", hook: "Devis → facture → relance → compta. Un seul outil.", channel: "YouTube freelance tips" },
    ],
    matthias: [
      { angle: "Impact chiffré", hook: "Senior engineer. 3 projets, +20M users touched. Prouvable.", channel: "LinkedIn + Twitter/X dev" },
      { angle: "Stack visible", hook: "React, Node, PostgreSQL, AWS. Pourquoi, comment, résultats.", channel: "Partage entre dev communities" },
      { angle: "Contact 24h", hook: "Tu écris, je réponds en 24h. Pas de bullshit.", channel: "LinkedIn profile + email signature" },
    ],
    stitch: [
      { angle: "Brand-locked generation", hook: "Upload ta brand une fois. Génère 20 maquettes qui matchent. Zéro dérive.", channel: "Twitter/X design community" },
      { angle: "Code React bonus", hook: "Pas juste du Figma. Tu récupères du React + Tailwind clean.", channel: "Product Hunt launch" },
      { angle: "Iteration conversationnelle", hook: "'Rends-le plus bold' → instant régénération. Pas de redesign manual.", channel: "Threads design Twitter" },
    ],
    default: [
      { angle: "Angle 1", hook: "Hook principal à définir avec Paul", channel: "Canal prioritaire" },
      { angle: "Angle 2", hook: "Hook alternatif", channel: "Canal secondaire" },
      { angle: "Angle 3", hook: "Hook de niche", channel: "Canal de niche" },
    ],
  };
  return map[key];
}

// ========================================
// FEATURE TIERS (P0 / P1 / P2)
// ========================================
function buildFeatures(key: SectorKey): FeatureTier[] {
  const commonP0: Record<SectorKey, string[]> = {
    lifeos: ["Daily view (tasks + habits + calendar)", "Capture rapide mobile + desktop", "Sync Google Calendar 2-way", "Auth + session persistante"],
    miam: ["Recherche recette par ingrédients", "Mode cuisson plein écran", "Liste courses", "Favoris + historique", "Auth (Apple/Google)"],
    dietplus: ["Scan code-barres", "Log repas manuel", "Graphe progression poids", "Onboarding objectif (perte/maintien/prise)"],
    aurax: ["Connexion exchange read-only", "Backtest stratégie templatée", "Dashboard P&L multi-comptes", "Alertes push"],
    adforge: ["Upload brand kit (logo + palette + fonts)", "Génération 10 variants par prompt", "Export PNG multi-ratios", "Preview side-by-side"],
    popon: ["Ajout produit (photo + prix + desc)", "Stripe connect + checkout", "URL shoppable unique", "Paiement Apple/Google Pay"],
    sneaksclap: ["Drop calendar EU", "Alerts drops (push)", "Watchlist modèles", "Auth + profil pointures"],
    dimension: ["Hero + 3 cases d'étude", "Page services", "Contact form + Calendly", "SEO + Open Graph"],
    relationsense: ["Import CSV/Google Contacts", "Timeline par contact", "Rappel next action", "Extension Chrome LinkedIn"],
    presta: ["Création devis + facture", "Signature électronique", "Envoi email auto", "Export comptable PDF"],
    matthias: ["Hero + 3-5 case studies", "Stack/services", "Contact CTA visible", "Mobile responsive"],
    stitch: ["Upload brand", "Prompt → 5 maquettes", "Preview + download PNG", "Auth + projets sauvés"],
    default: ["Feature P0 principale à définir"],
  };
  const commonP1: Record<SectorKey, string[]> = {
    lifeos: ["Focus mode + Pomodoro", "Review hebdo automatisée", "Tags + recherche", "Export markdown", "Theme dark/light"],
    miam: ["Scanner frigo (photo → ingrédients)", "Adaptation régime (végé/gluten)", "Partage recette", "Historique nutrition", "Intégration Yuka"],
    dietplus: ["Programme personnalisé", "Intégration trackers (Fitbit, Apple Health)", "Communauté + challenges"],
    aurax: ["Marketplace stratégies + copy trading", "Alertes TradingView-like", "Mobile app", "Paper trading mode"],
    adforge: ["Batch 50 variants", "Intégration Meta Ads Manager", "A/B test tracking", "Brand voice AI"],
    popon: ["Multi-produits (jusqu'à 10)", "Email marketing basic", "Analytics visiteurs", "Custom domain"],
    sneaksclap: ["Authentification photo", "Chat communauté", "Scroll feed drops", "Stats collection"],
    dimension: ["Blog articles insights", "Page équipe", "Testimonials vidéo"],
    relationsense: ["Sync Gmail/Outlook", "Team workspace", "Workflows automation", "Export CRM (HubSpot, Salesforce)"],
    presta: ["Time tracking par projet", "Relances auto", "Multi-devises", "Export Shine/Qonto/FEC"],
    matthias: ["Blog posts", "Témoignages clients", "Stats live (GitHub)", "Animations scroll"],
    stitch: ["Batch 20 maquettes", "Export code React", "Iteration conversationnelle", "Collaboration équipe"],
    default: ["Feature P1 enrichissement"],
  };
  const commonP2: Record<SectorKey, string[]> = {
    lifeos: ["AI-assisted planning", "Integrations (Slack, Notion, Linear)", "Shared workspaces", "Mobile-only mode"],
    miam: ["AI recette personnalisée", "Partenariats livraison (Monop', Carrefour)", "Abonnement premium"],
    dietplus: ["AI coach nutrition", "Intégration médecin/diététicien"],
    aurax: ["Portfolio autopilot (rebalance)", "API publique pour devs", "Institutional features"],
    adforge: ["Video ads generation", "Motion design templates", "Multi-brand management"],
    popon: ["Marketplace multi-vendeurs", "Dropshipping intégré", "Crowdfunding"],
    sneaksclap: ["Échange peer-to-peer", "Coffre-fort digital collection", "Marketplace vintage"],
    dimension: ["Service managé post-livraison", "Agency partnerships"],
    relationsense: ["Revenue intelligence", "AI outreach drafts", "Calling + voice memos"],
    presta: ["Gestion équipe (co-freelance)", "Marketplace clients", "IA proposition commerciale"],
    matthias: ["Dashboard stats (views, clicks)", "Newsletter"],
    stitch: ["Animations prototyping", "Multi-device preview", "Design system auto-généré"],
    default: ["Feature P2 long terme"],
  };
  return [
    { tier: "P0", label: "MVP — Must have avant launch", features: commonP0[key] },
    { tier: "P1", label: "V2 — Enrichissement 3 mois post-launch", features: commonP1[key] },
    { tier: "P2", label: "V3+ — Vision long terme", features: commonP2[key] },
  ];
}

// ========================================
// KPIs à suivre
// ========================================
function buildKpis(key: SectorKey): string[] {
  const map: Record<SectorKey, string[]> = {
    lifeos: ["DAU/MAU ratio ≥ 50%", "Tasks créées/user/jour ≥ 5", "Rétention J30 ≥ 40%", "NPS ≥ 40", "Churn mensuel ≤ 5%"],
    miam: ["Recettes cuisinées/user/semaine ≥ 3", "Rétention J7 ≥ 60%", "Conversion free→premium ≥ 5%", "Activation J1 ≥ 70%"],
    dietplus: ["Repas loggés/user/jour ≥ 2", "Rétention J30 ≥ 45%", "Conversion premium ≥ 8%", "NPS ≥ 35"],
    aurax: ["Capital deployé par user ≥ 500€", "Rétention J90 ≥ 55%", "Churn mensuel ≤ 3%", "LTV/CAC ≥ 4"],
    adforge: ["Variants générés/user/mois ≥ 100", "Rétention J60 ≥ 65%", "Expansion revenue ≥ 20%/an", "NPS ≥ 50"],
    popon: ["Boutiques activées (1ère vente) ≥ 40%", "GMV/user/mois ≥ 500€", "Rétention J60 ≥ 55%"],
    sneaksclap: ["Transactions/user/mois ≥ 1.5", "Rétention J90 ≥ 45%", "Taux fraude ≤ 0.5%", "NPS ≥ 40"],
    dimension: ["Projets signés/mois ≥ 3", "Panier moyen ≥ 50k€", "Taux renouvellement ≥ 60%", "Délai réponse ≤ 24h"],
    relationsense: ["Contacts/user ≥ 500", "Rappels honorés ≥ 70%", "Rétention J90 ≥ 50%", "Seats/team ≥ 3"],
    presta: ["Factures envoyées/user/mois ≥ 5", "Rétention J180 ≥ 60%", "Churn ≤ 3%"],
    matthias: ["Scroll depth ≥ 70%", "Click CTA contact ≥ 8%", "Temps moyen ≥ 90s"],
    stitch: ["Maquettes générées/user/mois ≥ 30", "Rétention J30 ≥ 55%", "Conversion trial→paid ≥ 15%"],
    default: ["KPI nord star à définir", "Retention J30 target", "Conversion target"],
  };
  return map[key];
}

// ========================================
// RISQUES
// ========================================
function buildRisks(key: SectorKey, device: string): Risk[] {
  const base: Risk[] = [
    { category: "tech", description: "Performance mobile sur devices anciens", mitigation: "Budget 16MB RAM test, lazy loading, code splitting" },
    { category: "tech", description: "Scalabilité si croissance soudaine", mitigation: "Cache CDN, DB indexes, load testing pré-launch" },
  ];
  const perSector: Record<SectorKey, Risk[]> = {
    lifeos: [
      { category: "market", description: "Concurrence saturée (Notion, Todoist)", mitigation: "Différenciation par daily view + capture rapide" },
      { category: "business", description: "Acquisition coûteuse en SaaS B2C", mitigation: "Content marketing + PLG + referral mécanisme" },
    ],
    miam: [
      { category: "market", description: "Marmiton a 15M+ MAU = fort moat", mitigation: "Mobile-first + mode cuisson unique + curation qualité" },
      { category: "business", description: "Pricing power limité (concurrent gratuit)", mitigation: "Freemium avec value layer premium clair" },
    ],
    dietplus: [
      { category: "legal", description: "Claims santé régulés (DGCCRF)", mitigation: "Review légale features + disclaimer + pas de dosage médical" },
      { category: "market", description: "MyFitnessPal dominant depuis 10+ ans", mitigation: "UX bienveillante + localization FR + scan fiable" },
    ],
    aurax: [
      { category: "legal", description: "Réglementation MiFID/AMF sur trading automatisé", mitigation: "Review juridique + disclaimer + KYC si applicable" },
      { category: "tech", description: "Risque sécurité API exchange", mitigation: "Read-only forcé, IP whitelist, audit sécurité tiers" },
    ],
    adforge: [
      { category: "legal", description: "Droits sur génération IA d'images", mitigation: "Modèles licensed (Stable Diffusion commercial, Flux Pro)" },
      { category: "market", description: "Compétition Canva + Adobe Firefly", mitigation: "Focus brand lock + batch generation + export direct Meta" },
    ],
    popon: [
      { category: "legal", description: "Conformité RGPD + TVA e-commerce", mitigation: "Stripe Tax + consent management + CGV générées" },
      { category: "market", description: "Barrière low mais Shopify domine enterprise", mitigation: "Positionnement créateurs solo clair" },
    ],
    sneaksclap: [
      { category: "legal", description: "Lutte contre contrefaçons (obligation d'authentification)", mitigation: "Process auth rigoureux + insurance" },
      { category: "business", description: "GMV faible au début = coûts fixes élevés", mitigation: "Lancement volontairement limité + communauté invite-only" },
    ],
    dimension: [
      { category: "business", description: "Dépendance sur quelques gros clients", mitigation: "Diversification + rétention services récurrents" },
      { category: "market", description: "Agences concurrentes avec brand reconnue", mitigation: "Portfolio public + Awwwards + case studies chiffrées" },
    ],
    relationsense: [
      { category: "tech", description: "Capture LinkedIn sans violer ToS", mitigation: "Extension user-initiated, pas scraping automatique" },
      { category: "market", description: "HubSpot/Salesforce massifs", mitigation: "Segment solos + petites équipes < 10 users" },
    ],
    presta: [
      { category: "legal", description: "Conformité facturation électronique 2026 (FEC, certificat)", mitigation: "Certification PDP + formats XML/Factur-X" },
      { category: "market", description: "Shine/Abby bien ancrés", mitigation: "Focus UX mobile-first + intégration bancaire premium" },
    ],
    matthias: [
      { category: "business", description: "Personal branding demande du contenu constant", mitigation: "Plan éditorial 1 article/mois minimum + stats visibles" },
    ],
    stitch: [
      { category: "tech", description: "Coût API LLM élevé si volume", mitigation: "Cache + tiers pricing agressif + model optimization" },
      { category: "market", description: "v0.dev, Galileo, Uizard très actifs", mitigation: "Brand-locked + code export = différenciateur clé" },
    ],
    default: [
      { category: "market", description: "Concurrence à identifier précisément", mitigation: "Mapping concurrent détaillé avant launch" },
    ],
  };
  if (device === "mobile") base.push({ category: "tech", description: "Review Apple App Store (délais + rejets)", mitigation: "Guidelines respect strict + TestFlight early feedback" });
  return [...base, ...(perSector[key] || [])];
}

// ========================================
// ROADMAP (3/6/12 mois)
// ========================================
function buildRoadmap(key: SectorKey): RoadmapPhase[] {
  const map: Record<SectorKey, RoadmapPhase[]> = {
    lifeos: [
      { horizon: "3mo", goals: ["MVP launch (P0 features)", "100 beta users knowledge workers", "Product-Market Fit survey ≥ 40% very disappointed"] },
      { horizon: "6mo", goals: ["Rollout P1 (focus mode, review hebdo)", "1K paying users à 12€/mois", "Integration Notion + Slack"] },
      { horizon: "12mo", goals: ["10K MRR ≥ 100K€", "P2 AI planning + mobile app native", "Expansion équipe (1 product + 1 eng)"] },
    ],
    miam: [
      { horizon: "3mo", goals: ["App mobile live iOS+Android", "500 beta testers", "50 recettes curated + mode cuisson"] },
      { horizon: "6mo", goals: ["Freemium live à 6€/mois", "5K MAU", "Partenariat Monoprix ou équivalent"] },
      { horizon: "12mo", goals: ["50K MAU", "Scanner frigo avec AI", "30K€ MRR"] },
    ],
    dietplus: [
      { horizon: "3mo", goals: ["Scan code-barres 1M produits FR", "MVP live + 1K beta users"] },
      { horizon: "6mo", goals: ["Programme personnalisé post-J7", "10K MAU, 500 paying à 8€/mois"] },
      { horizon: "12mo", goals: ["Partenariat mutuelles/assurances", "50K MAU"] },
    ],
    aurax: [
      { horizon: "3mo", goals: ["MVP backtest + dashboard", "100 users avec capital test", "Audit sécurité externe"] },
      { horizon: "6mo", goals: ["Marketplace stratégies live", "500 users actifs, 50K€ sous gestion"] },
      { horizon: "12mo", goals: ["10K users, 5M€ AUM", "Mobile app native", "Équipe 5 pers"] },
    ],
    adforge: [
      { horizon: "3mo", goals: ["MVP launch + 20 early customers B2B", "Brand lock + 10 variants/prompt"] },
      { horizon: "6mo", goals: ["50 paying customers à 300€/mois", "Intégration Meta Ads direct"] },
      { horizon: "12mo", goals: ["200 customers, 60K€ MRR", "Video ads + multi-brand"] },
    ],
    popon: [
      { horizon: "3mo", goals: ["MVP + Stripe connect", "500 boutiques créées"] },
      { horizon: "6mo", goals: ["1K boutiques actives (≥ 1 vente)", "GMV 100K€/mois"] },
      { horizon: "12mo", goals: ["5K boutiques actives, GMV 1M€/mois", "Multi-produits + email"] },
    ],
    sneaksclap: [
      { horizon: "3mo", goals: ["Launch marketplace invite-only 100 users", "Drop calendar live"] },
      { horizon: "6mo", goals: ["1K users, GMV 200K€/mois", "Chat communauté"] },
      { horizon: "12mo", goals: ["10K users, 3M€ GMV, break-even"] },
    ],
    dimension: [
      { horizon: "3mo", goals: ["Portfolio online + 3 case studies chiffrées", "Pipeline 5 prospects qualifiés"] },
      { horizon: "6mo", goals: ["6 projets signés, 300K€ booked"] },
      { horizon: "12mo", goals: ["600K€ revenue, équipe 4 pers, expansion international"] },
    ],
    relationsense: [
      { horizon: "3mo", goals: ["MVP + Extension Chrome", "200 beta users B2B"] },
      { horizon: "6mo", goals: ["1K paying à 30€/mois", "Team workspace"] },
      { horizon: "12mo", goals: ["5K paying, 150K€ MRR", "Intégrations CRM majeurs"] },
    ],
    presta: [
      { horizon: "3mo", goals: ["MVP + devis/facture + signature électro"] },
      { horizon: "6mo", goals: ["500 freelances paying à 25€/mois"] },
      { horizon: "12mo", goals: ["3K freelances, 75K€ MRR, conformité facturation 2026"] },
    ],
    matthias: [
      { horizon: "3mo", goals: ["Site vitrine online", "3 case studies publiées"] },
      { horizon: "6mo", goals: ["1-2 opportunités conversion / mois"] },
      { horizon: "12mo", goals: ["5+ opportunités/mois, SEO positionné"] },
    ],
    stitch: [
      { horizon: "3mo", goals: ["MVP brand upload + 5 maquettes/prompt", "100 designers beta"] },
      { horizon: "6mo", goals: ["Export code React", "500 paying à 40€/mois"] },
      { horizon: "12mo", goals: ["5K paying, 200K€ MRR", "Collaboration équipe"] },
    ],
    default: [
      { horizon: "3mo", goals: ["MVP avec features P0", "Pré-beta 50 users"] },
      { horizon: "6mo", goals: ["Launch public", "Premiers revenus"] },
      { horizon: "12mo", goals: ["Product-Market Fit confirmé", "Scaling"] },
    ],
  };
  return map[key];
}

// ========================================
// ENRICHISSEMENT PRINCIPAL
// ========================================
export function enrichBrief(params: {
  name: string;
  slug: string;
  sector: string;
  device: string;
}) {
  const key = detectSectorKey(params.sector, params.slug);
  const { positioning, usp } = buildPositioning(key, params.name);

  return {
    positioning,
    uniqueSellingPoint: usp,
    valueProps: buildValueProps(key),
    personas: PERSONAS[key],
    userJourney: buildUserJourney(key),
    marketingAngles: buildMarketingAngles(key),
    features: buildFeatures(key),
    kpis: buildKpis(key),
    risks: buildRisks(key, params.device),
    roadmap: buildRoadmap(key),
  };
}
