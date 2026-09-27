import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getCartSessionToken, ensureCartSessionToken } from "@/lib/cart-session"
import { getOrCreateCart, addCartItem, getCartWithItems } from "@/lib/commerce-db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
  }

  const token = await getCartSessionToken()
  if (!token) {
    return NextResponse.json({ items: [] })
  }

  const cart = await getOrCreateCart(store.id, token)
  const items = await getCartWithItems(cart.id)
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
  }

  const body = await request.json()
  const productId = Number(body.product_id)
  const variantId = body.variant_id ? Number(body.variant_id) : null
  const quantity = Math.max(1, Number(body.quantity) || 1)

  if (!productId) {
    return NextResponse.json({ error: "محصول نامعتبر است" }, { status: 400 })
  }

  const token = await ensureCartSessionToken()
  const cart = await getOrCreateCart(store.id, token)
  await addCartItem(cart.id, productId, variantId, quantity)
  const items = await getCartWithItems(cart.id)

  return NextResponse.json({ items }, { status: 201 })
}
