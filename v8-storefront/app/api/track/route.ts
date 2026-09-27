import { NextResponse, type NextRequest } from "next/server"
import { getStoreBySlug } from "@/lib/db"
import { ensureCartSessionToken } from "@/lib/cart-session"
import { recordAnalyticsEvent } from "@/lib/store-analytics-track"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Best-effort visitor/pageview/explorer-play tracking, fired client-side.
// Resolves against the published-only store lookup so owner draft-preview
// traffic (see middleware's ?preview=1 flow) never inflates real stats.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, eventType, path, targetId } = body

    if (typeof slug !== "string" || (eventType !== "page_view" && eventType !== "explorer_play")) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const store = await getStoreBySlug(slug)
    if (!store) {
      return NextResponse.json({ ok: true })
    }

    const visitorToken = await ensureCartSessionToken()
    await recordAnalyticsEvent({
      storeId: store.id,
      eventType,
      visitorToken,
      path: typeof path === "string" ? path : null,
      targetId: typeof targetId === "number" ? targetId : null,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("API Error recording analytics event:", error)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
