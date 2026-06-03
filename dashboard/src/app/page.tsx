import { readFileSync } from "fs"
import { join } from "path"
import Dashboard from "@/components/Dashboard"
import type { ReviewsData } from "@/lib/data"

export default function Home() {
  const filePath = join(process.cwd(), "data", "reviews.json")
  const raw = readFileSync(filePath, "utf-8")
  const data: ReviewsData = JSON.parse(raw)
  return <Dashboard reviews={data.reviews} />
}
