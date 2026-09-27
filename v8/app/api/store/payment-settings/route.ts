import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { getStorePaymentSettings, upsertStorePaymentSettings } from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ settings: null })
    }

    const settings = await getStorePaymentSettings(store.id)
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("API Error fetching payment settings:", error)
    return NextResponse.json({ error: "Failed to fetch payment settings" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "فروشگاهی یافت نشد" }, { status: 400 })
    }

    const body = await request.json()
    const settings = await upsertStorePaymentSettings(store.id, body)
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("API Error updating payment settings:", error)
    return NextResponse.json({ error: "Failed to update payment settings" }, { status: 500 })
  }
}
