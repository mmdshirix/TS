import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getOrderByNumber, getStorePaymentSettings, markOrderPaid, markOrderFailed, updatePaymentTransaction } from "@/lib/commerce-db"
import { inquireBaleTransaction } from "@/lib/payments/balepay"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
  }

  const body = await request.json()
  const order = await getOrderByNumber(store.id, body.orderNumber)
  if (!order) {
    return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 })
  }

  const settings = await getStorePaymentSettings(store.id)
  if (!settings?.balepay_bot_token) {
    return NextResponse.json({ error: "بله‌پی برای این فروشگاه تنظیم نشده است" }, { status: 400 })
  }

  const result = await inquireBaleTransaction(settings.balepay_bot_token, body.transactionId)

  if (!result.success || result.status !== "paid") {
    await markOrderFailed(order.id)
    await updatePaymentTransaction(order.id, "balepay", { status: "failed" })
    return NextResponse.json({ status: "failed" })
  }

  await markOrderPaid(order.id)
  await updatePaymentTransaction(order.id, "balepay", { status: "paid" })
  return NextResponse.json({ status: "paid" })
}
