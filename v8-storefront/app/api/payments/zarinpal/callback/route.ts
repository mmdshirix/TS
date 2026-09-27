import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getOrderByNumber, getStorePaymentSettings, markOrderPaid, markOrderFailed, updatePaymentTransaction } from "@/lib/commerce-db"
import { verifyZarinpalPayment } from "@/lib/payments/zarinpal"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  const { searchParams, origin } = request.nextUrl
  const orderNumber = searchParams.get("order")
  const authority = searchParams.get("Authority")
  const status = searchParams.get("Status")

  if (!store || !orderNumber) {
    return NextResponse.redirect(`${origin}/`)
  }

  const order = await getOrderByNumber(store.id, orderNumber)
  if (!order) {
    return NextResponse.redirect(`${origin}/`)
  }

  const redirectTo = (suffix = "") => NextResponse.redirect(`${origin}/order/${orderNumber}${suffix}`)

  if (status !== "OK" || !authority) {
    await markOrderFailed(order.id)
    await updatePaymentTransaction(order.id, "zarinpal", { status: "failed" })
    return redirectTo("?status=failed")
  }

  const settings = await getStorePaymentSettings(store.id)
  if (!settings?.zarinpal_merchant_id) {
    return redirectTo("?status=failed")
  }

  const result = await verifyZarinpalPayment({
    merchantId: settings.zarinpal_merchant_id,
    amountToman: Number(order.total),
    authority,
  })

  if (!result.success) {
    await markOrderFailed(order.id)
    await updatePaymentTransaction(order.id, "zarinpal", { status: "failed" })
    return redirectTo("?status=failed")
  }

  await markOrderPaid(order.id)
  await updatePaymentTransaction(order.id, "zarinpal", { status: "paid", gateway_ref: result.refId })
  return redirectTo()
}
