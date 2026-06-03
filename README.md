# Spendesk Reviews — Scraping & Analytics

Étude de cas pour Skello GTM Outbound : scraper **225 avis Capterra** de Spendesk, construire un dashboard analytics.

## Architecture

```
spendesk-reviews/
├── scraper/
│   └── live_scraper.py    # Playwright + Chrome CDP → contourne Cloudflare
├── dashboard/             # Next.js 14 + Chart.js + Tailwind
│   ├── data/
│   │   └── reviews.json   # 225 avis (scrapés)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Page dashboard
│   │   │   └── api/reviews/route.ts  # Route API → sert reviews.json
│   │   ├── components/
│   │   │   └── Dashboard.tsx      # Graphiques + KPIs
│   │   └── lib/
│   │       └── data.ts            # Types + calculs métriques
│   └── package.json
└── README.md
```

## Scraper

**Défi** : Capterra bloque les navigateurs headless (Cloudflare).

**Solution** : Connecter Playwright à une instance Chrome réelle via remote debugging (`chrome.exe --remote-debugging-port=9222`). Cloudflare fait entièrement confiance au navigateur.

**Pipeline** :
1. Naviguer pages 1–10 de `capterra.com/p/157515/Spendesk/reviews/`
2. Extraire note, titre, date, auteur, rôle, secteur, avis/contre, corps
3. Dédupliquer par (titre, auteur, date) → 225 avis uniques
4. Sauvegarder en JSON

## Dashboard

- **Framework** : Next.js 14 (App Router)
- **Graphiques** : Chart.js via react-chartjs-2
- **Style** : Tailwind CSS

### Visualisations

| Vue | Description |
|-----|-------------|
| Distribution des notes | Bar chart — 5★: 180, 4★: 38, 3★: 4, 2★: 1, 1★: 2 |
| Chronologie | Avis par année (2021–2025) |
| Par secteur | Répartition par verticale métier |
| Par taille d'entreprise | Répartition par effectif |
| Cartes KPI | Note moyenne, total avis, taux de recommandation |
| Liste des avis | Les 225 avis avec texte intégral |

### Flux de données

```
reviews.json → Route API (/api/reviews) → Composants Dashboard (client)
```

**Pourquoi JSON plutôt qu'une base de données en v1 ?** — Le jeu de données est petit (225 avis) et statique. Pas d'écritures concurrentes, pas de requêtes complexes. JSON + route API est plus simple à déployer (zéro infrastructure) et assez rapide. Une migration PostgreSQL / SQLite serait la prochaine étape pour des données dynamiques.

## Résultats

```json
{
  "total": 225,
  "average_rating": 4.72,
  "distribution": { "5": 180, "4": 38, "3": 4, "2": 1, "1": 2 }
}
```

Spendesk bénéficie d'une très haute satisfaction (80% de 5★). Les 45 avis non-5★ révèlent des points faibles concentrés.

### Analyse des points faibles

Analyse manuelle des 225 champs "cons" toutes langues confondues (EN, FR, DE) → 8 catégories sémantiques :

| Catégorie | ~Count | Exemples |
|-----------|--------|----------|
| Paiements refusés / carte bloquée | 30 | "card gets blocked", "n'acceptent pas les cartes", "refus de paiement" |
| Fonctionnalités manquantes | 20 | "missing analytics", "pas de virements", "no budget tracking", "need OCR" |
| Intégration comptable limitée | 18 | "export pas compatible", "intégration avec Sage/ERP difficile" |
| Application mobile / bugs | 10 | "app crashes", "mobile pas intuitif", "web vs app inconsistent" |
| Support client lent | 10 | "customer service slow", "manque de réactivité" |
| UI/UX perfectible | 10 | "empty UI", "pas intuitif", "aesthetics", "confusing" |
| Prix / coût élevé | 8 | "pricey", "coût élevé", "augmentation des prix" |
| Cartes virtuelles non acceptées | 8 | "virtual card declined", "prepaid not accepted" |

Les frustrations principales des utilisateurs Spendesk — échecs de paiement, fonctionnalités manquantes, intégration comptable — sont exactement là où un concurrent comme Skello peut se différencier.

## Exécution locale

```bash
# Scraper (nécessite Chrome sur le port 9222)
cd scraper
pip install playwright
python live_scraper.py

# Dashboard
cd dashboard
npm install
npm run dev   # → http://localhost:3000
```

## Déploiement

**Vercel** : [dashboard-olive-eight-35.vercel.app](https://dashboard-olive-eight-35.vercel.app)

## Prochaines étapes

- Scraping planifié (GitHub Actions cron)
- Comparaison concurrents (PayFit, Factorial…)
- Recherche / filtre des avis par mot-clé, note, date
- Nuage de mots des avis/contre
- Analyse de sentiment
- PostgreSQL pour données multi-utilisateurs / dynamiques
