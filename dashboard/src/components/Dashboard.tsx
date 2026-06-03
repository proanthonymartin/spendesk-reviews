"use client"

import { useMemo, useState } from "react"
import type { Review, PainPoint } from "@/lib/data"
import { computeAnalytics } from "@/lib/data"
import KpiCards from "./KpiCards"
import dynamic from "next/dynamic"

const RatingChart = dynamic(() => import("./RatingChart"), { ssr: false })
const TimelineChart = dynamic(() => import("./TimelineChart"), { ssr: false })
const SectorChart = dynamic(() => import("./SectorChart"), { ssr: false })
const PainPointsChart = dynamic(() => import("./PainPointsChart"), { ssr: false })

export default function Dashboard({ reviews, painPoints }: { reviews: Review[], painPoints?: PainPoint[] }) {
  const analytics = useMemo(() => computeAnalytics(reviews, painPoints), [reviews, painPoints])

  const [search, setSearch] = useState("")
  const [filterRating, setFilterRating] = useState(0)
  const [filterYear, setFilterYear] = useState("")
  const [filterSector, setFilterSector] = useState("")

  const years = useMemo(() => {
    const set = new Set<string>()
    reviews.forEach((r) => {
      const d = new Date(r.date)
      if (!isNaN(d.getTime())) set.add(d.getFullYear().toString())
    })
    return Array.from(set).sort().reverse()
  }, [reviews])

  const sectors = useMemo(() => {
    const set = new Set<string>()
    reviews.forEach((r) => { if (r.sector) set.add(r.sector) })
    return Array.from(set).sort()
  }, [reviews])

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (search) {
        const q = search.toLowerCase()
        if (!r.title?.toLowerCase().includes(q) &&
            !r.body?.toLowerCase().includes(q) &&
            !r.author?.toLowerCase().includes(q)) return false
      }
      if (filterRating && r.rating !== filterRating) return false
      if (filterYear) {
        const d = new Date(r.date)
        const year = isNaN(d.getTime()) ? "" : d.getFullYear().toString()
        if (year !== filterYear) return false
      }
      if (filterSector && r.sector !== filterSector) return false
      return true
    })
  }, [reviews, search, filterRating, filterYear, filterSector])

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics des avis Spendesk</h1>
        <p className="text-gray-500 mt-1">
          Analyse de {analytics.total_reviews} avis Capterra
          <a
            href="https://proanthonymartin.github.io/spendesk-reviews"
            target="_blank"
            className="ml-3 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Étude de cas ↗
          </a>
        </p>
      </header>

      <KpiCards
        avgRating={analytics.avg_rating}
        totalReviews={analytics.total_reviews}
        recommendationRate={analytics.recommendation_rate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <RatingChart data={analytics.rating_distribution} />
        <TimelineChart data={analytics.monthly_timeline} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <SectorChart data={analytics.by_sector} title="Note moyenne par secteur" />
        <PainPointsChart painPoints={analytics.pain_points} />
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Avis</h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Rechercher par titre, auteur, contenu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value={0}>Toutes les notes</option>
            <option value={5}>5★</option>
            <option value={4}>4★</option>
            <option value={3}>3★</option>
            <option value={2}>2★</option>
            <option value={1}>1★</option>
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">Toutes les années</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">Tous les secteurs</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-400 mb-3">
          Affichage de {filteredReviews.length} / {analytics.total_reviews} avis
        </p>

        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900">{review.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 font-bold">{review.rating}/5</span>
                  {review.recommended && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Recommandé
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{review.body}</p>
              <div className="text-xs text-gray-400 flex flex-wrap gap-3">
                <span>{review.author}</span>
                <span>{review.role}</span>
                <span>{review.sector}</span>

                <span>{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
