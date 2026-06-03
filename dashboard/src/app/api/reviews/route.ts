import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import type { ReviewsData } from "@/lib/data"

export async function GET() {
  try {
    const filePath = join(process.cwd(), "data", "reviews.json")
    const raw = readFileSync(filePath, "utf-8")
    const data: ReviewsData = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 })
  }
}
