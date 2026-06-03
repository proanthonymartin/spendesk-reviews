# Spendesk Reviews — Scraping & Analytics

Case study for Skello GTM Outbound : scrape **225 Capterra reviews** of Spendesk, build analytics dashboard.

## Architecture

```
spendesk-reviews/
├── scraper/
│   └── live_scraper.py    # Playwright + Chrome CDP → bypass Cloudflare
├── dashboard/             # Next.js 14 + Chart.js + Tailwind
│   ├── data/
│   │   └── reviews.json   # 225 reviews (scraped)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Dashboard page
│   │   │   └── api/reviews/route.ts  # API route → serves reviews.json
│   │   ├── components/
│   │   │   └── Dashboard.tsx      # Charts + KPI cards
│   │   └── lib/
│   │       └── data.ts            # Types + metrics computation
│   └── package.json
└── README.md
```

## Scraper

**Challenge** : Capterra blocks headless browsers (Cloudflare).

**Solution** : Connect Playwright to a real Chrome instance via remote debugging (`chrome.exe --remote-debugging-port=9222`). This bypasses Cloudflare entirely — the browser is fully trusted.

**Pipeline** :
1. Navigate pages 1–10 of `capterra.com/p/157515/Spendesk/reviews/`
2. Extract rating, title, date, author, role, sector, pros/cons, body
3. Deduplicate by (title, author, date) → 225 unique reviews
4. Save as JSON

## Dashboard

- **Framework** : Next.js 14 (App Router)
- **Charts** : Chart.js via react-chartjs-2
- **Styling** : Tailwind CSS

### Visualizations

| View | Description |
|------|-------------|
| Rating distribution | Bar chart — 5★: 180, 4★: 38, 3★: 4, 2★: 1, 1★: 2 |
| Timeline | Reviews per year (2021–2025) |
| By sector | Breakdown by industry vertical |
| By company size | Breakdown by employee count |
| KPI cards | Average rating, total reviews, recommendation score |
| Review list | All 225 reviews with full text |

### Data flow

```
reviews.json → API route (/api/reviews) → Dashboard components (client-side)
```

**Why JSON instead of a database for v1 ?** — The dataset is small (225 reviews) and static. No concurrent writes, no complex queries. JSON + API route is simpler to deploy (zero infrastructure) and fast enough. A PostgreSQL / SQLite migration would be the next step for dynamic data.

## Results

```json
{
  "total": 225,
  "average_rating": 4.72,
  "distribution": { "5": 180, "4": 38, "3": 4, "2": 1, "1": 2 }
}
```

Spendesk enjoys extremely high satisfaction (80% 5-star). The 45 non-5-star reviews reveal concentrated pain points.

### Pain Points Analysis

Manual analysis of all 225 cons fields across languages (EN, FR, DE) → 8 semantic categories:

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

Spendesk users' top frustrations — payment failures, feature gaps, accounting integration — are exactly where a competitor like Skello can differentiate.

## Run locally

```bash
# Scraper (requires Chrome on port 9222)
cd scraper
pip install playwright
python live_scraper.py

# Dashboard
cd dashboard
npm install
npm run dev   # → http://localhost:3000
```

## Deployed

**Vercel** : [dashboard-olive-eight-35.vercel.app](https://dashboard-olive-eight-35.vercel.app)

## Next steps

- Scheduled scraping (GitHub Actions cron)
- Competitor comparison (PayFit, Factorial…)
- Search / filter reviews by keyword, rating, date
- Word cloud of pros/cons
- Sentiment analysis
- PostgreSQL for multi-user / dynamic data
