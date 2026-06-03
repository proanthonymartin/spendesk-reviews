import { readFileSync } from "fs"
import { join } from "path"
import Dashboard from "@/components/Dashboard"
import type { ReviewsData, PainPoint } from "@/lib/data"

export default function Home() {
  let reviews: ReviewsData["reviews"] = []
  let painPoints: PainPoint[] = []
  try {
    const reviewsPath = join(process.cwd(), "data", "reviews.json")
    const raw = readFileSync(reviewsPath, "utf-8")
    reviews = JSON.parse(raw).reviews
  } catch {
    console.error("Impossible de charger reviews.json")
  }

  try {
    const llmPath = join(process.cwd(), "data", "pain-points-llm.json")
    const llmRaw = readFileSync(llmPath, "utf-8")
    const llmData = JSON.parse(llmRaw)
    if (llmData.categories) {
      painPoints = llmData.categories.map((c: any) => ({
        issue: c.issue, count: c.count, pct: c.pct
      }))
    }
  } catch {}

  return <Dashboard reviews={reviews} painPoints={painPoints} />
}
