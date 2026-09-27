import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getOrderByNumber, updatePaymentTransaction } from "@/lib/commerce-db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { orderNumber: string } }) {
  const store = await getStoreFromRequest(request)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
  }

  const order = await getOrderByNumber(store.id, params.orderNumber)
  if (!order || order.payment_method !== "card_to_card") {
    return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 })
  }

  const body = await request.json()
  if (!body.imageUrl) {
    return NextResponse.json({ error: "تصویر فیش الزامی است" }, { status: 400 })
  }

  await updatePaymentTransaction(order.id, "card_to_card", { receipt_image_url: body.imageUrl })
  return NextResponse.json({ success: true })
}
