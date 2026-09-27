import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import {
  getStoreStatsSummary,
  getStoreStatsSeries,
  getBestSellingProducts,
  type StatsGranularity,
} from "@/lib/store-analytics-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const VALID_GRANULARITIES: StatsGranularity[] = ["day", "week", "month", "year"]

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "فروشگاهی یافت نشد" }, { status: 404 })
    }

    const granularityParam = request.nextUrl.searchParams.get("granularity")
    const granularity: StatsGranularity = VALID_GRANULARITIES.includes(granularityParam as StatsGranularity)
      ? (granularityParam as StatsGranularity)
      : "day"

    const [summary, series, bestSellers] = await Promise.all([
      getStoreStatsSummary(store.id, granularity),
      getStoreStatsSeries(store.id, granularity),
      getBestSellingProducts(store.id, granularity),
    ])

    return NextResponse.json({ summary, series, bestSellers })
  } catch (error) {
    console.error("API Error fetching store analytics:", error)
    return NextResponse.json({ error: "Failed to fetch store analytics" }, { status: 500 })
  }
}
