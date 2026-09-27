import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId, resetLandingBlocksToDefault, listLandingBlocks } from "@/lib/store-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "فروشگاهی یافت نشد" }, { status: 404 })
    }

    const page = new URL(request.url).searchParams.get("page") || "home"
    await resetLandingBlocksToDefault(store.id, page)
    const blocks = await listLandingBlocks(store.id, page)
    return NextResponse.json({ blocks })
  } catch (error) {
    console.error("API Error resetting landing blocks:", error)
    return NextResponse.json({ error: "Failed to reset landing blocks" }, { status: 500 })
  }
}
