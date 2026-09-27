import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId, reorderLandingBlocks } from "@/lib/store-db"

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

    const body = await request.json()
    if (!Array.isArray(body.order)) {
      return NextResponse.json({ error: "ترتیب نامعتبر است" }, { status: 400 })
    }

    await reorderLandingBlocks(store.id, body.order)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error reordering landing blocks:", error)
    return NextResponse.json({ error: "Failed to reorder landing blocks" }, { status: 500 })
  }
}
