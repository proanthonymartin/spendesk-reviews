import { readFileSync } from "fs"
import { join } from "path"
import Dashboard from "@/components/Dashboard"
import type { ReviewsData, PainPoint } from "@/lib/data"

export default function Home() {
  const reviewsPath = join(process.cwd(), "data", "reviews.json")
  const raw = readFileSync(reviewsPath, "utf-8")
  const data: ReviewsData = JSON.parse(raw)

  let painPoints: PainPoint[] = []
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

  return <Dashboard reviews={data.reviews} painPoints={painPoints} />
}
