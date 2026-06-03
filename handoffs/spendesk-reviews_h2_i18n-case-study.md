---
project: spendesk-reviews
session: h2
date: 2026-06-03
topic: i18n-case-study
tags: [i18n, github-pages, docs, case-study]
priority: high
previous: spendesk-reviews_h1_build-scraper-dashboard.md
status: completed
---

← [h1 build-scraper-dashboard](spendesk-reviews_h1_build-scraper-dashboard.md) | [_index](_index.md) | [h3 stabilisation-export](spendesk-reviews_h3_stabilisation-export.md) →

## Objectif

Traduire l'intégralité du dashboard et du README en français (langue cible Skello), ajouter une page d'étude de cas statique hébergée sur GitHub Pages, et corriger les incohérences de wording.

## Fichiers modifiés

| Fichier | Changement |
|---------|------------|
| `dashboard/src/components/Dashboard.tsx` | Traduction FR de tous les labels, placeholder, compteurs, filtres, boutons |
| `dashboard/src/components/KpiCards.tsx` | Libellés FR |
| `dashboard/src/components/RatingChart.tsx` | Libellés FR |
| `dashboard/src/components/TimelineChart.tsx` | Libellés FR |
| `dashboard/src/components/PainPointsChart.tsx` | Libellés FR |
| `dashboard/src/components/Dashboard.tsx` | Ajout lien "Étude de cas" dans le header |
| `docs/index.html` | Nouvelle page statique : étude de cas responsive, pain points table, architecture pipeline, liens Vercel |
| `README.md` | Traduction FR + badges GitHub Pages et Vercel + liens vers l'étude de cas |

## ADR

### ADR-4: GitHub Pages pour l'étude de cas, Vercel pour le dashboard
**Contexte** : Besoin d'une page vitrine légère (marketing/recrutement) et d'une app dynamique.
**Décision** : GitHub Pages sert la page statique (docs/index.html, zéro build, zéro coût). Vercel sert l'app Next.js avec revalidation possible.
**Conséquence** : Deux URLs à maintenir. La page statique n'est pas générée depuis les données — elle est hardcodée et doit être mise à jour manuellement si les données changent.

### ADR-5: Français comme langue du projet
**Contexte** : Projet destiné à un recruteur français (Skello, GTM Outbound).
**Décision** : Dashboard, README, étude de cas, PDF en français.
**Conséquence** : Le code reste en anglais (convention). Les labels UI sont traduits mais le layout HTML conserve `lang="en"` (bug identifié).

## Bugs résolus

| Priorité | Bug | Solution |
|----------|-----|----------|
| P2 | Labels "Showing X of Y reviews" en anglais | Remplacement par "Affichage de X / Y avis" | 
| P2 | README bilingue (mélange EN/FR) | Traduction complète en français |
| P2 | Pas de page d'accueil statique pour partage LinkedIn | Création docs/index.html (étude de cas responsive) |

## Prochaine session

- Corriger bugs critiques : parsing de date, try/catch manquants, graphique vide company_size
- Ajouter export CSV et MD
- Mettre à jour README (Prochaines étapes obsolètes)
