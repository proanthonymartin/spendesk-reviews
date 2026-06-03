"use client"

import { useMemo } from "react"
import type { Review } from "@/lib/data"
import { computeAnalytics } from "@/lib/data"
import KpiCards from "./KpiCards"
import dynamic from "next/dynamic"

const RatingChart = dynamic(() => import("./RatingChart"), { ssr: false })
const TimelineChart = dynamic(() => import("./TimelineChart"), { ssr: false })
const SectorChart = dynamic(() => import("./SectorChart"), { ssr: false })

export default function Dashboard({ reviews }: { reviews: Review[] }) {
  const analytics = useMemo(() => computeAnalytics(reviews), [reviews])

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Spendesk Reviews Analytics</h1>
        <p className="text-gray-500 mt-1">
          Analysis of {analytics.total_reviews} reviews from Capterra
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
        <SectorChart data={analytics.by_sector} title="Avg Rating by Sector" />
        <SectorChart data={analytics.by_company_size} title="Avg Rating by Company Size" />
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">All Reviews</h2>
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900">{review.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 font-bold">{review.rating}/5</span>
                  {review.recommended && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{review.body}</p>
              <div className="text-xs text-gray-400 flex flex-wrap gap-3">
                <span>{review.author}</span>
                <span>{review.role}</span>
                <span>{review.sector}</span>
                <span>{review.company_size} employees</span>
                <span>{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
