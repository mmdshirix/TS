import { notFound, redirect } from "next/navigation"
import { getStoreBySlug, listEnabledCheckoutFields } from "@/lib/db"
import { getCartSessionToken } from "@/lib/cart-session"
import { getOrCreateCart, getCartWithItems, getStorePaymentSettings } from "@/lib/commerce-db"
import { getStoreSmsSettings } from "@/lib/otp-db"
import CheckoutForm from "@/components/checkout-form"

export default async function CheckoutPage({ params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) {
    notFound()
  }

  const token = await getCartSessionToken()
  const cart = token ? await getOrCreateCart(store.id, token) : null
  const items = cart ? await getCartWithItems(cart.id) : []

  if (items.length === 0) {
    redirect("/cart")
  }

  const [fields, settings, smsSettings] = await Promise.all([
    listEnabledCheckoutFields(store.id),
    getStorePaymentSettings(store.id),
    getStoreSmsSettings(store.id),
  ])

  const availableGateways = {
    zarinpal: !!(settings?.zarinpal_enabled && settings.zarinpal_merchant_id),
    balepay: !!(settings?.balepay_enabled && settings.balepay_bot_token),
    card_to_card: !!(settings?.card_to_card_enabled && settings.card_number),
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  return (
    <CheckoutForm
      items={items.map((i) => ({ id: i.id, product_name: i.product_name, price: i.price, quantity: i.quantity }))}
      subtotal={subtotal}
      fields={fields}
      availableGateways={availableGateways}
      otpEnabled={Boolean(smsSettings?.otp_enabled)}
    />
  )
}
