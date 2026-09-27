import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getCartSessionToken } from "@/lib/cart-session"
import {
  getOrCreateCart,
  getStorePaymentSettings,
  createOrderFromCart,
  createPaymentTransaction,
  updatePaymentTransaction,
  markOrderFailed,
} from "@/lib/commerce-db"
import { requestZarinpalPayment } from "@/lib/payments/zarinpal"
import { createBaleInvoiceLink } from "@/lib/payments/balepay"
import { getStoreSmsSettings, consumeOtpVerification } from "@/lib/otp-db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
  }

  const token = await getCartSessionToken()
  if (!token) {
    return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 })
  }

  const body = await request.json()
  const paymentMethod = body.paymentMethod as "zarinpal" | "balepay" | "card_to_card"
  const customerInfo = body.customerInfo || {}

  const smsSettings = await getStoreSmsSettings(store.id)
  if (smsSettings?.otp_enabled) {
    const phone = typeof customerInfo.phone === "string" ? customerInfo.phone.replace(/\s|-/g, "") : ""
    const verifyToken = typeof body.otpVerifyToken === "string" ? body.otpVerifyToken : ""
    const verified = phone && verifyToken && (await consumeOtpVerification(store.id, phone, verifyToken))
    if (!verified) {
      return NextResponse.json({ error: "لطفاً ابتدا شماره تلفن خود را با کد پیامکی تایید کنید" }, { status: 400 })
    }
  }

  const settings = await getStorePaymentSettings(store.id)
  const gatewayEnabled =
    (paymentMethod === "zarinpal" && settings?.zarinpal_enabled && settings.zarinpal_merchant_id) ||
    (paymentMethod === "balepay" && settings?.balepay_enabled && settings.balepay_bot_token) ||
    (paymentMethod === "card_to_card" && settings?.card_to_card_enabled && settings.card_number)

  if (!gatewayEnabled) {
    return NextResponse.json({ error: "روش پرداخت انتخاب‌شده فعال نیست" }, { status: 400 })
  }

  let order
  try {
    const cart = await getOrCreateCart(store.id, token)
    const created = await createOrderFromCart(store.id, store.slug, cart.id, customerInfo, paymentMethod)
    order = created.order
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در ثبت سفارش" }, { status: 400 })
  }

  await createPaymentTransaction(order.id, paymentMethod, order.total)

  if (paymentMethod === "zarinpal") {
    const result = await requestZarinpalPayment({
      merchantId: settings!.zarinpal_merchant_id!,
      amountToman: Number(order.total),
      description: `سفارش ${order.order_number}`,
      callbackUrl: `${request.nextUrl.origin}/api/payments/zarinpal/callback?order=${order.order_number}`,
    })

    if (!result.success) {
      await markOrderFailed(order.id)
      await updatePaymentTransaction(order.id, "zarinpal", { status: "failed" })
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    await updatePaymentTransaction(order.id, "zarinpal", { gateway_ref: result.authority })
    return NextResponse.json({ orderNumber: order.order_number, redirectUrl: result.paymentUrl })
  }

  if (paymentMethod === "balepay") {
    const result = await createBaleInvoiceLink({
      botToken: settings!.balepay_bot_token!,
      title: store.name,
      description: `سفارش ${order.order_number}`,
      payload: order.order_number,
      amountToman: Number(order.total),
    })

    if (!result.success) {
      await markOrderFailed(order.id)
      await updatePaymentTransaction(order.id, "balepay", { status: "failed" })
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    await updatePaymentTransaction(order.id, "balepay", { gateway_ref: result.invoiceLink })
    return NextResponse.json({ orderNumber: order.order_number, invoiceLink: result.invoiceLink })
  }

  // card_to_card: no external gateway call — the order status page shows the store's
  // card/IBAN and collects the receipt upload; a human on the dashboard reviews it.
  return NextResponse.json({ orderNumber: order.order_number, redirectUrl: `/order/${order.order_number}` })
}
