import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { listOrdersByStore } from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ orders: [] })
    }

    const status = new URL(request.url).searchParams.get("status") || undefined
    const orders = await listOrdersByStore(store.id, status)
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("API Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
