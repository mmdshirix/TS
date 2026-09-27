import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import {
  getOrderById,
  getOrderItems,
  getOrderPaymentTransactions,
  updateOrderStatus,
  reviewCardToCardPayment,
} from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function assertOwnership(userId: number, orderId: number) {
  const order = await getOrderById(orderId)
  if (!order) return null
  const store = await getStoreByUserId(userId)
  if (!store || store.id !== order.store_id) return null
  return order
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await assertOwnership(user.id, Number(params.id))
    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 })
    }

    const [items, transactions] = await Promise.all([getOrderItems(order.id), getOrderPaymentTransactions(order.id)])
    return NextResponse.json({ order, items, transactions })
  } catch (error) {
    console.error("API Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await assertOwnership(user.id, Number(params.id))
    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 })
    }

    const body = await request.json()

    if (body.cardToCardReview === "approve" || body.cardToCardReview === "reject") {
      const updated = await reviewCardToCardPayment(order.id, body.cardToCardReview === "approve")
      return NextResponse.json({ order: updated })
    }

    if (body.status) {
      const updated = await updateOrderStatus(order.id, body.status)
      return NextResponse.json({ order: updated })
    }

    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 })
  } catch (error) {
    console.error("API Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
