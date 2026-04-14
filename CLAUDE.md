# PAUL-ARCHITECT — Configuration projet
> Règles globales dans ~/.claude/CLAUDE.md (chargé automatiquement)

## Projet
- **Nom** : PAUL-ARCHITECT — Pipeline design ultime orchestrant tous les skills Paul
- **CWD** : /opt/paul-architect
- **Stack** : Next.js 15, React 19, Tailwind CSS 4, Zustand, SSE, Lucide
- **PM2** : `paul-architect` — port 3014 — paul-architect.ps-tools.dev
- **GitHub** : https://github.com/paulsainton/paul-architect

## Vision
Paul Architect = le produit parent qui orchestre Bench (veille) + Stitch Architect (maquettes) + Clone Architect (extraction) + LiveLoop (preview) dans un seul pipeline frontend interactif. Aujourd'hui : maquettes. Demain : contenu statique et vidéo.

## Architecture parent/enfants
```
paul-architect (3014) ← CE PROJET — orchestrateur frontend
    ├── bench-dashboard (3010) ← API veille/inspiration (273+ items)
    │     └── bench-pipeline (3005) ← items pipeline
    ├── stitch-architect (3012) ← génération maquettes via Google Stitch SDK
    ├── clone-architect (CLI) ← extraction design via Playwright
    │     └── /home/paul/clone-architect/
    ├── liveloop (3015) ← preview live bidirectionnel
    └── empire-done (3060) ← état projets
```

## Règle absolue — R16 + R17
Claude = intégrateur, JAMAIS directeur artistique.
- Stitch SDK + Clone Architect = les SEULS producteurs de visuels
- Aucun skill design tiers (brand-forge, ux-designer, design, theme-factory, ai-feature-design)
- Pas de variante A/B/C de design générée par Claude
- Pas de code front sans extraction visuelle préalable

## Skills autorisés (exclusivement)
| Skill | Rôle |
|---|---|
| paul-architect (7 étapes) | Parent — orchestre le pipeline |
| stitch-architect | Maquettes via Stitch SDK |
| clone-architect | Extraction tokens/layouts via Playwright |
| liveloop | Preview live bidirectionnel |
| bench / veille | Inspirations (API 3010) |
| researcher | Recherche web concurrents |
| empire-audit | Sync EmpireDONE |
| orchestrator | Sync orch.ps-tools.dev |
| know-me | Mémorisation préférences |
| codex-review | Review code |
| codex-adversarial | Challenge technique |

## Pipeline — 8 Tunnels
```
T1  COLLECTE      Agent scanne projet cible → formulaire pré-rempli → Paul complète
T2A CONCURRENTS   researcher scrape 5 refs → previews + checkboxes
T2B BENCH         API 3010 filtres avancés → previews agrandissables + checkboxes
T3  CLONE         clone-architect par URL → tokens + screenshots + blocs → merge
T4  IDENTITÉ      Stitch SDK génère 3 palettes depuis tokens → Paul choisit
T5  ANALYSE       4 personas streamed (basées sur extractions réelles)
T7  MAQUETTES     1 maquette Stitch par inspiration cochée (inspirée 100% de sa ref)
T6  CODE          Claude code section/section → codex-review → liveloop
T8  QA + DEPLOY   Score /100 → PASS → git push + PM2 + EmpireDONE
```

## Routes API prévues
- POST `/api/pipeline/run` — Démarre un pipeline
- GET `/api/pipeline/stream/[runId]` — SSE temps réel
- POST `/api/pipeline/analyze` — T1: scan projet
- POST `/api/pipeline/scrape-competitors` — T2A: concurrents web
- GET `/api/pipeline/inspirations` — T2B: proxy bench
- POST `/api/pipeline/clone` — T3: lance clone-architect
- POST `/api/pipeline/brand` — T4: identité via Stitch
- POST `/api/pipeline/analysis` — T5: multi-persona
- POST `/api/pipeline/generate-code` — T6: génération code
- POST `/api/pipeline/stitch-maquettes` — T7: maquettes Stitch
- POST `/api/pipeline/review` — T8: QA
- GET/POST `/api/projects` — CRUD projets

## Deploy
- PM2: `paul-architect` via `.next/standalone/server.js`
- HTTPS: https://paul-architect.ps-tools.dev (nginx reverse proxy)
- Auth: paul.sainton / 1912 — cookie httpOnly 30j
