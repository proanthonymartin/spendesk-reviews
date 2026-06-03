---
project: spendesk-reviews
session: h1
date: 2026-06-03
topic: build-scraper-dashboard
tags: [scraper, dashboard, playwright, nextjs, cloudflare]
priority: high
status: completed
---

← (premier handoff) | [_index](_index.md) | [h2 i18n-case-study](spendesk-reviews_h2_i18n-case-study.md) →

## Objectif

Scraper 225 avis Capterra de Spendesk (concurrent Skello) en contournant Cloudflare, construire un dashboard analytics déployable, et produire une analyse des points faibles concurrents.

## Fichiers modifiés

| Fichier | Changement |
|---------|------------|
| `scraper/live_scraper.py` | Scraper Playwright connecté à Chrome réel (CDP) — contourne Cloudflare, pages 1-10, extraction structurée (note, titre, date, auteur, rôle, secteur, pros/cons, corps) |
| `scraper/spendesk_reviews.json` | 225 avis scrapés et dédupliqués |
| `dashboard/package.json` | Projet Next.js 14 (App Router) + Chart.js + react-chartjs-2 + Tailwind |
| `dashboard/data/reviews.json` | Données transformées pour le dashboard |
| `dashboard/data/pain-points-llm.json` | Analyse manuelle des 225 cons en 8 catégories sémantiques |
| `dashboard/scripts/analyze-cons.mjs` | Script regex d'extraction des pain points (fallback) |
| `dashboard/src/lib/data.ts` | Types TypeScript, computeAnalytics(), keyword matching |
| `dashboard/src/components/Dashboard.tsx` | Layout dashboard, KPIs, filtres (recherche, note, année, secteur), liste avis |
| `dashboard/src/components/KpiCards.tsx` | Cartes : note moyenne, total avis, taux recommandation |
| `dashboard/src/components/RatingChart.tsx` | Distribution des notes (bar chart) |
| `dashboard/src/components/TimelineChart.tsx` | Évolution temporelle (line chart) |
| `dashboard/src/components/SectorChart.tsx` | Répartition par secteur et note moyenne |
| `dashboard/src/components/PainPointsChart.tsx` | Points faibles (bar chart, échelle relative au max) |
| `dashboard/src/app/page.tsx` | Server component racine, lecture synchrone de reviews.json |
| `dashboard/src/app/api/reviews/route.ts` | Route API GET /api/reviews |
| `dashboard/src/app/layout.tsx` | Layout HTML avec Titillium Web |
| `generate_pdf.py` | Génération PDF des insights (Playwright, HTML hardcodé) |
| `spendesk_insights.pdf` | PDF livrable (1 page, français) |
| `README.md` | Documentation initiale architecture + déploiement |

## Résultats clés

| Métrique | Valeur |
|----------|--------|
| Avis scrapés | 225 (10 pages) |
| Distribution | 5★: 180, 4★: 38, 3★: 4, 2★: 1, 1★: 2 |
| Note moyenne | 4.72 / 5 |
| Taux recommandation | 80% |
| Catégories pain points | 8 (paiements refusés, fonctionnalités manquantes, intégration comptable, app mobile, support, UI, prix, cartes virtuelles) |

## ADR

### ADR-1: Chrome CDP plutôt que headless browser
**Contexte** : Capterra utilise Cloudflare pour bloquer les navigateurs headless (Playwright/headless, curl, etc.).
**Décision** : Connecter Playwright à une instance Chrome réelle via `chrome.exe --remote-debugging-port=9222`. Cloudflare voit un navigateur légitime.
**Conséquence** : Nécessite Chrome d'installé, pas automatisable en CI sans configuration. Fonctionne en local.

### ADR-2: JSON plutôt que base de données
**Contexte** : 225 avis statiques, zéro écriture concurrente, pas de requêtes complexes.
**Décision** : Fichier JSON lu à build time + route API pour le client. Aucune infrastructure.
**Conséquence** : Pas de requêtes ad-hoc, pas de mise à jour temps réel. Suffisant pour la v1.

### ADR-3: Chart.js plutôt que Recharts
**Contexte** : Dashboard vitrine, pas d'interactions complexes (zoom, brush).
**Décision** : react-chartjs-2. Plus léger, plus personnalisable, pas de SVG overhead.
**Conséquence** : Imports dynamiques avec `ssr: false` nécessaire pour éviter les erreurs SSR.

## Bugs résolus

| Priorité | Bug | Solution |
|----------|-----|----------|
| P0 | Cloudflare bloque les requêtes HTTP directes | Chrome CDP avec remote debugging |
| P0 | Pas de données réelles (prototype avec données mock) | Scraper complet 10 pages → 225 avis |
| P1 | IDs dupliqués dans reviews.json | Déduplication par (titre, auteur, date) |
| P1 | Keyword matching trop large (substring) | Passage aux regex word boundaries (itération ultérieure) |

## Prochaine session

- Traduire l'interface en français
- Ajouter une page d'étude de cas statique (GitHub Pages)
- Corriger les labels "Showing" → "Affichage de"
- Corriger parsing de date incompatible avec format Capterra
