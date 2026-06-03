export interface Review {
  id: number
  rating: number
  title: string
  body: string
  date: string
  author: string
  role: string
  company_size: string
  sector: string
  cons: string
  pros: string
  recommended: boolean
}

export interface ReviewsData {
  reviews: Review[]
  total: number
}

export interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}

export interface MonthlyStats {
  month: string
  avg_rating: number
  count: number
}

export interface SectorStats {
  sector: string
  avg_rating: number
  count: number
}

export interface PainPoint {
  issue: string
  count: number
  pct: number
}

export interface Analytics {
  total_reviews: number
  avg_rating: number
  recommendation_rate: number
  rating_distribution: RatingDistribution[]
  monthly_timeline: MonthlyStats[]
  by_sector: SectorStats[]
  by_company_size: SectorStats[]
  pain_points: PainPoint[]
}

export function computeAnalytics(reviews: Review[], painPointsOverride?: PainPoint[]): Analytics {
  const total = reviews.length
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / total
  const recommended = reviews.filter((r) => r.recommended).length

  // Rating distribution
  const distMap: Record<number, number> = {}
  for (let i = 1; i <= 5; i++) distMap[i] = 0
  reviews.forEach((r) => { distMap[r.rating] = (distMap[r.rating] || 0) + 1 })
  const ratingDistribution = Object.entries(distMap).map(([rating, count]) => ({
    rating: Number(rating),
    count,
    percentage: Math.round((count / total) * 100),
  }))

  // Monthly timeline
  const monthlyMap: Record<string, { sum: number; count: number }> = {}
  reviews.forEach((r) => {
    const d = new Date(r.date)
    const month = isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 7)
    if (!month) return
    if (!monthlyMap[month]) monthlyMap[month] = { sum: 0, count: 0 }
    monthlyMap[month].sum += r.rating
    monthlyMap[month].count += 1
  })
  const monthlyTimeline = Object.entries(monthlyMap)
    .map(([month, data]) => ({
      month,
      avg_rating: Math.round((data.sum / data.count) * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // By sector
  const sectorMap: Record<string, { sum: number; count: number }> = {}
  reviews.forEach((r) => {
    if (!sectorMap[r.sector]) sectorMap[r.sector] = { sum: 0, count: 0 }
    sectorMap[r.sector].sum += r.rating
    sectorMap[r.sector].count += 1
  })
  const bySector = Object.entries(sectorMap)
    .map(([sector, data]) => ({
      sector,
      avg_rating: Math.round((data.sum / data.count) * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)

  // By company size
  const sizeMap: Record<string, { sum: number; count: number }> = {}
  reviews.forEach((r) => {
    if (!sizeMap[r.company_size]) sizeMap[r.company_size] = { sum: 0, count: 0 }
    sizeMap[r.company_size].sum += r.rating
    sizeMap[r.company_size].count += 1
  })
  const byCompanySize = Object.entries(sizeMap)
    .map(([size, data]) => ({
      sector: size,
      avg_rating: Math.round((data.sum / data.count) * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)

  // Pain points — use override from LLM analysis if provided, else keyword matching
  const painPoints: PainPoint[] = painPointsOverride && painPointsOverride.length > 0
    ? painPointsOverride
    : computeKeywordPainPoints(reviews, total)

  return {
    total_reviews: total,
    avg_rating: Math.round(avgRating * 100) / 100,
    recommendation_rate: Math.round((recommended / total) * 100),
    rating_distribution: ratingDistribution,
    monthly_timeline: monthlyTimeline,
    by_sector: bySector,
    by_company_size: byCompanySize,
    pain_points: painPoints,
  }
}

function computeKeywordPainPoints(reviews: Review[], total: number): PainPoint[] {
  const keywords = [
    "support", "customer service", "slow", "sync", "integration",
    "card", "payment", "limit", "mobile", "app",
    "export", "accounting", "receipt", "bug", "glitch",
    "price", "cost", "expensive", "feature", "missing",
    "contract", "holiday", "leave", "pto", "hr"
  ]
  const consTexts = reviews.map((r) => (r.cons || "").toLowerCase())
  return keywords
    .map((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = kw.includes(' ')
        ? new RegExp(escaped)
        : new RegExp(`\\b${escaped}s?\\b`)
      const count = consTexts.filter((t) => regex.test(t)).length
      return { issue: kw, count, pct: Math.round((count / total) * 100) }
    })
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}
