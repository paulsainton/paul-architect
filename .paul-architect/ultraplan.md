# ULTRAPLAN — PAUL ARCHITECT v2
> Produit parent : orchestre Bench + Stitch Architect + Clone Architect + LiveLoop
> Projet : /opt/paul-architect — Next.js 15 + React 19 + Tailwind 4 + Zustand + SSE
> Port : 3014 — paul-architect.ps-tools.dev

---

## VISION

Paul Architect = une webapp qui pilote un pipeline de design complet dans le navigateur. Zéro retour terminal. Le pipeline connecte les skills existants de Paul comme des micro-services, avec SSE temps réel, previews cliquables, checkboxes, progress bars. Chaque inspiration cochée produit une maquette dédiée inspirée à 100% de sa source.

**Règle absolue** : Claude = intégrateur. Stitch SDK + Clone Architect = les seuls producteurs de visuels. Aucun skill design tiers ne touche au rendu.

---

## SKILLS AUTORISÉS (exclusivement)

| Skill | Rôle dans le pipeline |
|---|---|
| paul-architect (7 étapes) | Parent — orchestre le pipeline complet |
| stitch-architect | Maquettes via Google Stitch SDK (Gemini Pro) |
| clone-architect | Extraction tokens/layouts/screenshots via Playwright |
| liveloop | Preview live + aller-retours bidirectionnels front/back |
| bench / veille | Source d'inspirations (API localhost:3010, 273+ items) |
| researcher | Recherche web concurrents (DuckDuckGo scraping) |
| empire-audit | Sync état projet EmpireDONE |
| orchestrator | Sync dashboard orch.ps-tools.dev |
| know-me | Mémorise préférences Paul |
| codex-review | Review code après chaque section |
| codex-adversarial | Challenge les choix techniques |

**EXCLUS** : ~~brand-forge~~, ~~design~~, ~~ux-designer~~, ~~ai-feature-design~~, ~~design-qa~~, ~~theme-factory~~, ~~canvas-design~~ — tout skill qui PRODUIT du design.

---

## ARCHITECTURE TECHNIQUE

```
paul-architect (3014) ─── SSE ──→ Frontend React
    │
    ├─ GET/POST bench-dashboard (3010)     ← items, inspiration, browse, search-web, process
    │    └── bench-pipeline (3005)         ← items pipeline
    │
    ├─ GET/POST stitch-architect (3012)    ← pipeline/run, stream, validate, edit, imagine
    │    └── Google Stitch SDK             ← generate, edit, getImage, getHtml
    │
    ├─ EXEC clone-architect (CLI)          ← npm run clone -- "{url}"
    │    └── Playwright headless           ← screenshots, getComputedStyle, tokens.json, DESIGN.md
    │
    ├─ WS liveloop (3015)                  ← preview live bidirectionnel
    │
    └─ GET empire-done (3060)              ← état projet, progress
```

---

## PIPELINE — 8 TUNNELS DÉTAILLÉS

---

### TUNNEL 1 — COLLECTE AUTOMATIQUE + BRIEF INTERACTIF

**But** : Aspirer TOUT ce qui existe sur le projet cible, pré-remplir un formulaire, Paul complète.

#### Backend (`src/lib/project-analyzer.ts`)

L'agent scanne le projet cible en profondeur :

```
1. package.json → nom, version, stack, dépendances
2. CLAUDE.md → vision, features, contraintes, règles
3. src/app/ → routes, pages (readdirSync récursif)
4. src/components/ → liste complète des composants
5. src/app/globals.css → tokens existants (couleurs, fonts, spacing)
6. EmpireDONE API → statut, progress %, features planned vs done
7. Orchestrator → dernière session, durée, warnings
8. Git log récent → derniers commits, activité
9. knowledge-base/ → fichiers KB disponibles
10. .env → variables (noms seulement, pas les valeurs)
```

Chaque scan émet un SSE event :
- `collect:scanning` (source: "package.json" | "CLAUDE.md" | "src/app" | ...)
- `collect:found` (source, data: { pages: 8, components: 35, tokens: 12 })
- `collect:complete` (summary)

#### Frontend (`src/app/pipeline/[runId]/brief/page.tsx`)

**Page 1** — Sélection du projet :
- Dropdown avec tous les projets PS-Tools (fetch EmpireDONE + /opt/ scan)
- Chaque option montre : nom + type + sector + progress %
- Sélection → lance le scan automatique

**Page 2** — Formulaire brief (après scan) :
- **Section "Détecté automatiquement"** (pré-rempli, modifiable) :
  - Nom du projet [input text, pré-rempli]
  - Type [select: website/webapp/mobile/landing/ecommerce/dashboard/saas]
  - Secteur [input text, pré-rempli depuis CLAUDE.md]
  - Stack technique [tags read-only]
  - Pages existantes [checkboxes — toutes cochées par défaut, Paul décoche celles à exclure]
  - Composants [tags read-only]
  - Tokens actuels [palette preview des couleurs existantes]

- **Section "Paul complète"** (vide, Paul remplit) :
  - Audience cible [textarea]
  - Vision en 1 phrase [input text]
  - Fonctionnalités prioritaires [input text, séparé par virgules]
  - Mood / ambiance souhaitée [input text]
  - Contraintes spéciales [textarea]
  - Device prioritaire [radio: Desktop / Mobile / Les deux]

- **Bouton "Valider le brief"** → sauvegarde `brief.json`

#### Output
```json
{
  "project": { "slug": "miam", "name": "MIAM", "type": "mobile", "sector": "Recettes cuisine" },
  "stack": { "framework": "Next.js 15", "ui": "Tailwind 4", "state": "Zustand" },
  "detected": {
    "pages": ["home", "recipes", "cook", "profile", "settings"],
    "components": ["RecipeCard", "CookMode", "Timer", "IngredientList"],
    "tokens": { "primary": "#FF6B35", "bg": "#FEFAE0", "text": "#1A1A1A" },
    "features": ["Recettes IA", "Mode cuisson", "Meal planning", "Liste courses"]
  },
  "paul": {
    "audience": "Jeunes adultes 25-35 qui cuisinent",
    "vision": "L'app cuisine qui donne envie de cuisiner",
    "priorities": ["UX de la page recette", "Mode cuisson plein écran"],
    "mood": "Chaleureux, appétissant, simple",
    "device": "mobile",
    "constraints": "Pas de vidéos, images statiques uniquement"
  },
  "excludedPages": [],
  "validatedAt": "2026-04-14T..."
}
```

#### Fichiers à créer
| Fichier | Lignes est. | Contenu |
|---|---|---|
| `src/app/pipeline/new/page.tsx` | ~120 | Sélection projet + lancement scan |
| `src/app/pipeline/[runId]/brief/page.tsx` | ~280 | Formulaire interactif complet |
| `src/app/api/pipeline/analyze/route.ts` | ~150 | Scan projet + SSE events |
| `src/lib/project-analyzer.ts` | ~200 | Logique de scan (fs + API calls) |
| `src/components/pipeline/brief-form.tsx` | ~180 | Composant formulaire |
| `src/components/pipeline/project-selector.tsx` | ~80 | Dropdown projets |

---

### TUNNEL 2A — INSPIRATIONS WEB (scraping concurrents)

**But** : Trouver automatiquement 5 concurrents/plateformes adaptées au projet.

#### Backend (`src/app/api/pipeline/scrape-competitors/route.ts`)

1. Construire les queries de recherche :
   - `"best {sector} {type} app design 2025 2026"`
   - `"top {sector} {type} UI inspiration"`
   - `"{sector} app like {project.name} alternatives"`
2. Scraper DuckDuckGo (3 queries, merge résultats)
3. Pour chaque résultat (top 10) :
   - Fetch OG metadata (title, description, og:image)
   - Score de pertinence : sector match (3pts) + type match (2pts) + has-image (1pt) + fresh (1pt)
4. Top 5 retournés triés par score
5. Auto-save dans Bench : `POST localhost:3010/api/process`

SSE events :
- `competitors:searching` (query)
- `competitors:found` (index, title, url, ogImage, score)
- `competitors:complete` (count)

#### Frontend (section dans `src/app/pipeline/[runId]/inspirations/page.tsx`)

**Onglet "Concurrents web"** :
- 5 cards en grid (2 colonnes mobile, 3 desktop) :
  - OG image en preview (fallback: screenshot Playwright rapide)
  - Titre + URL
  - Badge score de pertinence
  - **Checkbox** cocher/décocher (par défaut : rien coché)
  - **Bouton "Ouvrir"** → `window.open(url, '_blank')`
- Cards non cochées : opacity 50%, pas de border
- Cards cochées : border accent, opacity 100%, checkmark vert
- Compteur en bas : "X/5 sélectionnés"
- **Aucune validation requise** — Paul peut laisser 0 si le bench suffit

#### Fichiers à créer
| Fichier | Lignes est. |
|---|---|
| `src/app/api/pipeline/scrape-competitors/route.ts` | ~180 |
| `src/lib/competitor-scraper.ts` | ~120 |
| `src/components/pipeline/competitor-card.tsx` | ~90 |

---

### TUNNEL 2B — INSPIRATIONS BENCH (en parallèle de 2A)

**But** : Paul pioche dans ses 273+ items Bench avec filtres avancés et previews agrandissables.

#### Backend

Proxie vers Bench API existantes :
- `GET localhost:3010/api/inspiration?sector={s}&device={d}&style={st}&color={c}&limit=30`
- `GET localhost:3010/api/browse?smart=maquettes-with-preview&tag={t}&sector={s}&limit=30`
- `GET localhost:3010/api/items?category=BENCH+UI&search={q}&limit=50`
- Merge + déduplique par URL

#### Frontend (section dans `src/app/pipeline/[runId]/inspirations/page.tsx`)

**Onglet "Bench Veille"** (temps illimité tant que pas validé) :
- **Barre de filtres** :
  - Catégorie [select: BENCH UI, BENCH DEV, BENCH PUB, A TESTER, TOUS]
  - Sous-catégorie [select dynamique: maquette-web, maquette-mobile, ui-kit, inspiration, ...]
  - Secteur [select: finance, ecom, saas, food, ...]
  - Style visuel [select: dark, light, minimalist, glassmorphism, bold, ...]
  - Device [select: desktop, mobile, tablet, responsive]
  - Color scheme [select: dark, light, colorful]
  - Recherche libre [input text]
- **Chaque filtre met à jour la grid en temps réel** (fetch API à chaque changement)
- **Grid de cards** (3-4 colonnes) :
  - Preview image (thumbnail Bench)
  - **Clic sur la preview → Modal plein écran** (image agrandie)
  - **Bouton "Ouvrir l'original"** → lien source dans nouvel onglet
  - Tags en pills
  - Score qualité (badge couleur)
  - **Checkbox** cocher/décocher
- **Min 1 sélection requise (Bench)** avant de pouvoir valider
- **Max 5 sélections** (Bench)
- Infinite scroll ou pagination (20 items par page)
- Compteur : "X/5 sélectionnés depuis le Bench"

#### Validation commune 2A + 2B

- **Barre de résumé fixe en bas** de la page inspirations :
  - "Concurrents web : X cochés | Bench : Y cochés | Total : Z inspirations"
  - **Minimum total : 1** (que ce soit web ou bench)
  - **Maximum total : 10** (5 web + 5 bench)
  - **Bouton "Valider les inspirations"** (disabled si total = 0)
- Validation → sauvegarde `inspirations.json` → déclenche Tunnel 3

#### Fichiers à créer
| Fichier | Lignes est. |
|---|---|
| `src/app/pipeline/[runId]/inspirations/page.tsx` | ~300 |
| `src/components/pipeline/bench-explorer.tsx` | ~250 |
| `src/components/pipeline/bench-filters.tsx` | ~120 |
| `src/components/pipeline/inspiration-card.tsx` | ~100 |
| `src/components/pipeline/preview-modal.tsx` | ~80 |
| `src/app/api/pipeline/inspirations/route.ts` | ~100 |

---

### TUNNEL 3 — CLONE ARCHITECT (extraction automatique)

**But** : Extraire TOUT (tokens, layouts, screenshots, CSS, blocs fragmentés) de chaque URL cochée.

#### Backend (`src/lib/clone-runner.ts`)

Pour chaque URL (1 à 10, séquentiel pour éviter surcharge Playwright) :

```
1. Spawn: npm run clone -- "{url}"    (dans /home/paul/clone-architect/)
2. Attendre: extractions/{domain}/ créé
3. Lire: tokens.json → couleurs, typo, spacing, shadows, radius
4. Lire: DESIGN.md → narrative design system
5. Lire: layout-analysis.md → structure, sections, navigation
6. Lire: screenshots/ → desktop.png + mobile.png
7. Copier les outputs dans /opt/paul-architect/data/extractions/{runId}/{domain}/
```

Après toutes les extractions :
```
8. Merger les tokens: token-merger.ts
   - Couleurs : fréquence d'apparition → les plus communes gagnent
   - Typo : garder les 3 fonts les plus extraites
   - Spacing : calculer la moyenne
   - Shadows : garder les 4 plus utilisés
9. Sauvegarder: merged-tokens.json
10. Générer: extraction-summary.json (stats agrégées)
```

SSE events (par URL) :
- `clone:queue` (url, position, total)
- `clone:start` (url, step: "launching playwright")
- `clone:progress` (url, percent: 0→100, step: "screenshot" | "css-extraction" | "tokenize" | "analyze")
- `clone:screenshot` (url, desktopUrl, mobileUrl) — dès que screenshots dispo
- `clone:tokens` (url, colorsCount, fontsCount)
- `clone:complete` (url, tokensPath, designMdPath)
- `clone:error` (url, error, fallback: "skipped")
- `clone:merge-start` (totalSources)
- `clone:merge-complete` (mergedTokens: { colors, fonts, spacing })

#### Frontend (`src/app/pipeline/[runId]/extraction/page.tsx`)

**Vue principale** :
- **Timeline verticale** — une ligne par URL :
  - Icône statut : spinner (en cours) / check (fait) / X (erreur)
  - URL + favicon
  - **Progress bar** horizontale (0% → 100%) avec le step actuel en texte
  - **Estimation temps** : "~45s restantes" (basé sur moyenne des précédentes)
- **Panel de résultats** (s'affiche dès qu'une extraction est terminée) :
  - Screenshots desktop + mobile côte à côte (cliquable → agrandir)
  - **Palette extraite** : swatches de couleurs (hex affiché au hover)
  - **Typo détectée** : font-family + size scale
  - **Layout** : description texte de la structure (sections, nav, grid)
- **Résumé final** (après toutes les extractions) :
  - "Tokens mergés depuis {N} sources"
  - Palette consolidée (top 8 couleurs)
  - Fonts consolidées (top 3)
  - Bouton "Voir le merge complet" → affiche merged-tokens.json formaté
  - **Bouton "Continuer"** → passe au tunnel 4

#### Fallbacks
- Si une URL échoue (auth wall, captcha, timeout) :
  - Essayer WebFetch en fallback (OG image + meta CSS limité)
  - Si fallback aussi échoue : marquer "Extraction partielle" + continuer
  - L'URL reste cochée mais avec warning "tokens incomplets"

#### Fichiers à créer
| Fichier | Lignes est. |
|---|---|
| `src/app/pipeline/[runId]/extraction/page.tsx` | ~250 |
| `src/app/api/pipeline/clone/route.ts` | ~200 |
| `src/lib/clone-runner.ts` | ~250 |
| `src/lib/token-merger.ts` | ~150 |
| `src/components/pipeline/extraction-timeline.tsx` | ~180 |
| `src/components/pipeline/token-viewer.tsx` | ~120 |
| `src/components/pipeline/screenshot-viewer.tsx` | ~80 |

---

### TUNNEL 4 — IDENTITÉ VISUELLE (via Stitch SDK uniquement)

**But** : Générer palette + typo + direction visuelle. Producteur = Stitch SDK, PAS un skill design.

#### Backend (`src/lib/brand-generator.ts`)

1. Prendre `merged-tokens.json` (tunnel 3)
2. Construire 3 prompts Stitch différents :
   - **Proposition A** : "Identité basée sur la palette dominante de {ref la plus cochée}"
   - **Proposition B** : "Identité harmonisant les 3 palettes les plus extraites"
   - **Proposition C** : "Identité contrastante — complémentaire de la palette dominante"
3. Pour chaque proposition :
   - `stitch.createProject("Brand {project} — Option {A/B/C}")`
   - `project.generate(prompt, "DESKTOP")` — avec contraintes anti-patterns
   - Récupérer `getImage()` + `getHtml()`
   - Extraire les tokens réels du HTML généré (regex hex, font-family, spacing)
4. Retourner 3 mini-previews + 3 palettes extraites

**Budget Stitch** : 3 crédits (1 par proposition) — acceptable sur les 400/jour

SSE events :
- `brand:generating` (option: "A" | "B" | "C", prompt_summary)
- `brand:preview` (option, imageUrl, palette: { primary, secondary, accent, bg, text })
- `brand:complete` (3 options prêtes)

#### Frontend (`src/app/pipeline/[runId]/brand/page.tsx`)

- **3 colonnes** (desktop) / **3 cards empilées** (mobile) :
  - Preview Stitch (image générée)
  - Palette : 5-6 swatches avec hex
  - Typo : heading font + body font en sample
  - **Radio button** pour choisir (1 seul choix)
- **En bas** : "Option sélectionnée : {A/B/C}"
- **Bouton "Valider l'identité"** → sauvegarde `brand.json`

#### Output `brand.json`
```json
{
  "selectedOption": "B",
  "palette": {
    "primary": "#FF6B35",
    "secondary": "#4ECDC4",
    "accent": "#FFE66D",
    "background": "#FEFAE0",
    "surface": "#FFF8DC",
    "text": "#1A1A1A",
    "textSecondary": "#5A5A5A"
  },
  "typography": {
    "heading": "Playfair Display",
    "body": "Inter"
  },
  "borderRadius": "12px",
  "stitchProjectId": "1234567890",
  "source": "stitch-sdk",
  "validatedAt": "2026-04-14T..."
}
```

#### Fichiers à créer
| Fichier | Lignes est. |
|---|---|
| `src/app/pipeline/[runId]/brand/page.tsx` | ~200 |
| `src/app/api/pipeline/brand/route.ts` | ~180 |
| `src/lib/brand-generator.ts` | ~200 |
| `src/components/pipeline/brand-option.tsx` | ~100 |

---

### TUNNEL 5 — ANALYSE MULTI-PERSONA (paul-architect existant)

**But** : 4 experts réfléchissent en streaming sur le design à produire, EN SE BASANT SUR les extractions réelles (pas de l'abstrait).

#### Backend (`src/lib/ux-analysis.ts`)

4 agents séquentiels, chacun reçoit : brief.json + merged-tokens.json + brand.json + inspirations
- **Agent 1 — Architecte info** : "Basé sur les {N} sites analysés, voici la structure de navigation optimale..."
- **Agent 2 — Intégrateur UI** : "Les blocs extraits des refs s'organisent ainsi pour {project}..."
- **Agent 3 — Cohérence brand** : "Avec la palette {brand.palette}, chaque écran doit..."
- **Agent 4 — Dev technique** : "Composants React à créer, réutilisation possible, contraintes Next.js..."

**Important** : Ces agents ne CRÉENT pas de design. Ils ANALYSENT les extractions et RECOMMANDENT.

SSE events :
- `analysis:persona-start` (name, role)
- `analysis:persona-chunk` (text) — streaming mot par mot
- `analysis:persona-complete` (name, summary)
- `analysis:complete` (recommendations: { byPage: Record<string, string[]> })

#### Frontend (`src/app/pipeline/[runId]/analysis/page.tsx`)

- **4 panels empilés** :
  - Avatar + nom + rôle
  - Texte qui apparaît mot par mot (streaming SSE)
  - Badge "Terminé" quand l'agent finit
- **Résumé final** :
  - Recommandations par page (accordion)
  - Bouton "Valider l'analyse"

#### Fichiers à créer
| Fichier | Lignes est. |
|---|---|
| `src/app/pipeline/[runId]/analysis/page.tsx` | ~180 |
| `src/app/api/pipeline/analysis/route.ts` | ~150 |
| `src/lib/ux-analysis.ts` | ~200 |
| `src/components/pipeline/persona-panel.tsx` | ~100 |

---

### TUNNEL 6 — GÉNÉRATION CODE (Claude intégrateur + LiveLoop)

**But** : Claude code section par section basé sur TOUT le contexte accumulé. LiveLoop pour preview live.

#### Backend (`src/lib/code-generator.ts`)

Pour chaque page du sitemap (ordre : paul-architect:05-tasks) :
1. Assembler le prompt d'intégration :
   - brief.json (projet, features, audience)
   - merged-tokens.json (couleurs, typo, spacing extraits des VRAIS sites)
   - brand.json (palette validée par Paul)
   - ux-analysis.json (recommandations des 4 agents)
   - extractions/{ref}/ (blocs fragmentés de clone-architect)
   - anti-patterns (stitch-anti-patterns.ts)
2. Claude génère le code React + Tailwind
3. Écrire dans le projet cible (`/opt/{project}/src/`)
4. `npm run build` → vérifier pas d'erreur
5. Si LiveLoop dispo → capture screenshot du rendu
6. `codex-review` → review du code
7. `codex-adversarial` → challenge

SSE events :
- `build:page-start` (page, index, total)
- `build:generating` (page, progress)
- `build:code-ready` (page, filesChanged: string[], linesAdded)
- `build:compiling` (page)
- `build:compiled` (page, success: boolean, errors?: string[])
- `build:screenshot` (page, screenshotUrl)
- `build:review` (page, score, issues: string[])
- `build:waiting-validation` (page)
- `build:validated` (page, decision: "approve" | "revise", feedback?)

#### Frontend (`src/app/pipeline/[runId]/build/page.tsx`)

- **Timeline verticale** (1 block par page) :
  - Nom de la page + statut (En cours | Build OK | Build FAIL | Validé)
  - **Code preview** : syntax highlighted (Tailwind classes, JSX) — collapsible
  - **Screenshot du rendu** (si LiveLoop disponible) — cliquable → plein écran
  - **Boutons de validation** :
    - "Approuver" (checkmark vert)
    - "Retoucher" (ouvre textarea pour feedback)
  - Issues codex-review listées en pills orange
- **Panel latéral LiveLoop** (si connecté) :
  - Preview live du projet qui se met à jour
  - URL du projet (localhost:{port})

#### Fichiers à créer
| Fichier | Lignes est. |
|---|---|
| `src/app/pipeline/[runId]/build/page.tsx` | ~350 |
| `src/app/api/pipeline/generate-code/route.ts` | ~200 |
| `src/lib/code-generator.ts` | ~300 |
| `src/components/pipeline/build-timeline.tsx` | ~200 |
| `src/components/pipeline/code-preview.tsx` | ~120 |
| `src/components/pipeline/liveloop-panel.tsx` | ~100 |

---

### TUNNEL 7 — STITCH MAQUETTES (1 par inspiration)

**But** : Chaque inspiration cochée = 1 maquette Stitch dédiée, inspirée à 100% de sa source.

#### Backend (`src/lib/stitch-runner.ts`)

Pour chaque inspiration cochée (1 à 10) :
1. Prendre les tokens SPÉCIFIQUES de cette ref (pas le merge) :
   - `extractions/{domain}/tokens.json`
   - `extractions/{domain}/DESIGN.md`
   - `extractions/{domain}/screenshots/`
2. Construire un prompt Stitch ultra-ciblé :
   - "Reproduis EXACTEMENT le layout de {ref.url} pour le projet {project.name}"
   - Injecter : palette exacte de la ref, typo exacte, spacing exact
   - Injecter : brief.json features + brand.json comme overlay
   - Anti-patterns + type constraints
3. Appeler Stitch SDK :
   - `stitch.createProject("{project} — Inspired by {ref.domain}")`
   - `project.generate(prompt, device)`
   - `getImage()` + `getHtml()`
4. Sauvegarder : image + HTML + association ref→maquette

**Budget Stitch** : 1 crédit par inspiration → max 10 crédits. + 3 du tunnel 4 = 13/400 acceptable.

SSE events :
- `maquette:queue` (refUrl, position, total)
- `maquette:generating` (refUrl, status)
- `maquette:ready` (refUrl, imageUrl, stitchProjectId)
- `maquette:all-complete` (count, totalCreditsUsed)

#### Frontend (`src/app/pipeline/[runId]/maquettes/page.tsx`)

- **Grid comparative** :
  - Chaque row : [Inspiration source (screenshot)] ↔ [Maquette Stitch (image)]
  - Titre : "Inspiré de {domain}" 
  - Les deux images cliquables → plein écran
  - **Boutons** : Approuver | Rejeter + feedback | Éditer (prompt Stitch)
- **Résumé** : "{X}/{Y} maquettes approuvées"
- **Bouton "Finaliser"** → passe au tunnel 8

#### Fichiers à créer
| Fichier | Lignes est. |
|---|---|
| `src/app/pipeline/[runId]/maquettes/page.tsx` | ~250 |
| `src/app/api/pipeline/stitch-maquettes/route.ts` | ~180 |
| `src/lib/stitch-runner.ts` | ~200 |
| `src/components/pipeline/maquette-comparison.tsx` | ~150 |

---

### TUNNEL 8 — QA + DEPLOY

**But** : Review globale, score, deploy si PASS.

#### Backend (`src/lib/qa-runner.ts`)

1. `codex-review` global → score code
2. `codex-adversarial` → challenges finaux
3. `liveloop` → inspection complète du rendu déployé
4. Score composite /100 :
   - Code quality : X/25 (codex-review)
   - Technical robustness : X/25 (codex-adversarial)
   - Visual fidelity : X/25 (comparaison screenshots ref vs rendu)
   - Completeness : X/25 (toutes les pages codées + validées)
5. Verdict : PASS (≥ 70) | FAIL (< 70)

Si PASS :
- `git add + commit + push` (R13)
- PM2 restart du projet cible
- Sync EmpireDONE (progress %)
- Sync Orchestrator
- Telegram notification

SSE events :
- `qa:running` (check: "codex-review" | "codex-adversarial" | "liveloop" | "visual-compare")
- `qa:score` (check, score, maxScore, issues)
- `qa:verdict` (totalScore, verdict: "PASS" | "FAIL", breakdown)
- `qa:deployed` (projectUrl, commitHash)

#### Frontend (`src/app/pipeline/[runId]/review/page.tsx`)

- **Score card central** : X/100 avec breakdown en 4 catégories
- **Issues list** : ordonnées par sévérité, avec fichier + ligne
- **Avant/Après** : screenshot de l'état précédent vs nouveau
- **Si PASS** : bouton "Déployer" + confirmation
- **Si FAIL** : bouton "Retour au Tunnel 6" (itération)

#### Fichiers à créer
| Fichier | Lignes est. |
|---|---|
| `src/app/pipeline/[runId]/review/page.tsx` | ~200 |
| `src/app/api/pipeline/review/route.ts` | ~150 |
| `src/lib/qa-runner.ts` | ~200 |
| `src/components/pipeline/score-card.tsx` | ~100 |

---

## INFRASTRUCTURE COMMUNE

### SSE (copié et adapté de stitch-architect)
- `src/lib/pipeline-state.ts` — gestion des runs, events, clients, heartbeat 15s
- `src/app/api/pipeline/stream/[runId]/route.ts` — endpoint SSE
- `src/stores/pipeline-store.ts` — Zustand store avec EventSource

### Layout
- `src/app/layout.tsx` — sidebar + content area
- `src/components/layout/sidebar.tsx` — nav avec les étapes du pipeline actif
- `src/components/layout/header.tsx` — breadcrumb + infos run

### UI Kit (minimal, copié de stitch-architect)
- Card, Badge, Button, Input, Textarea, Select, Modal, Skeleton, Toast, Tabs, EmptyState, Checkbox, Radio, ProgressBar

### Auth
- Même middleware que stitch-architect (paul.sainton / 1912, cookie httpOnly 30j)

---

## FLUX SSE COMPLET (du début à la fin)

```
pipeline:start
  │
  ├── collect:scanning → collect:found → collect:complete
  │     (Tunnel 1 — scan projet)
  │
  ├── brief:validated
  │     (Paul valide le formulaire)
  │
  ├── competitors:searching → competitors:found → competitors:complete
  │     (Tunnel 2A — en parallèle)
  ├── bench:loading → bench:items → bench:filtered
  │     (Tunnel 2B — en parallèle)
  │
  ├── inspirations:validated (total: N)
  │
  ├── clone:queue → clone:start → clone:progress → clone:screenshot → clone:tokens → clone:complete
  │     (Tunnel 3 — par URL, séquentiel)
  ├── clone:merge-start → clone:merge-complete
  │
  ├── brand:generating → brand:preview → brand:complete
  │     (Tunnel 4)
  ├── brand:validated
  │
  ├── analysis:persona-start → analysis:persona-chunk → analysis:persona-complete
  │     (Tunnel 5 — 4 personas)
  ├── analysis:complete
  │
  ├── build:page-start → build:generating → build:code-ready → build:compiled → build:screenshot → build:review → build:validated
  │     (Tunnel 6 — par page)
  │
  ├── maquette:queue → maquette:generating → maquette:ready
  │     (Tunnel 7 — par inspiration)
  ├── maquette:all-complete
  │
  ├── qa:running → qa:score → qa:verdict
  │     (Tunnel 8)
  │
  └── pipeline:complete (totalDuration, verdict, score)
```

---

## ESTIMATION FICHIERS

| Catégorie | Fichiers | Lignes estimées |
|---|---|---|
| Pages (app/) | 12 | ~2,400 |
| API routes | 10 | ~1,500 |
| Lib (logique) | 10 | ~2,000 |
| Components | 20 | ~2,500 |
| Stores | 3 | ~300 |
| Types | 4 | ~200 |
| Config + layout | 5 | ~400 |
| **TOTAL** | **~64 fichiers** | **~9,300 lignes** |

---

## ORDRE D'EXÉCUTION (optimal)

```
1. Init projet (create-next-app + tailwind + layout + auth + SSE infra)
2. Tunnel 1 — Brief (project-analyzer + formulaire)
3. Tunnel 2A + 2B — Inspirations (scraping + bench, même page)
4. Tunnel 3 — Clone Architect (extraction + merge)
5. Tunnel 4 — Brand via Stitch (3 propositions)
6. Tunnel 5 — Analyse multi-persona
7. Tunnel 7 — Stitch maquettes (1 par inspiration)
8. Tunnel 6 — Code generation (section par section + LiveLoop)
9. Tunnel 8 — QA + Deploy
```

Note : T7 avant T6 car les maquettes Stitch donnent une direction visuelle que Claude utilise pour coder. T6 (code) utilise les maquettes comme référence supplémentaire.
