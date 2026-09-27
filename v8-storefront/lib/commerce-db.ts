import { getSql } from "@/lib/db"

// Write layer for cart/checkout/orders. Unlike lib/db.ts (read-only catalog data),
// this app owns these tables operationally even though the platform app (v8) also
// reads/manages orders + payment settings from its dashboard.

export interface CartItemWithProduct {
  id: number
  cart_id: number
  product_id: number
  variant_id: number | null
  quantity: number
  product_name: string
  product_slug: string
  price: number
  image_url: string | null
  variant_name: string | null
}

export interface StorePaymentSettings {
  zarinpal_enabled: boolean
  zarinpal_merchant_id: string | null
  balepay_enabled: boolean
  balepay_bot_token: string | null
  card_to_card_enabled: boolean
  card_number: string | null
  card_iban: string | null
  card_holder_name: string | null
}

export interface Order {
  id: number
  store_id: number
  order_number: string
  customer_info: Record<string, any>
  subtotal: number
  total: number
  status: string
  payment_method: string | null
  payment_status: string
  created_at: string
}

export interface OrderItemRow {
  id: number
  product_name: string
  variant_name: string | null
  price: number
  quantity: number
}

export async function getOrCreateCart(storeId: number, sessionToken: string): Promise<{ id: number }> {
  const sql = getSql()
  const existing = await sql`
    SELECT id FROM carts WHERE store_id = ${storeId} AND session_token = ${sessionToken} AND status = 'open'
  `
  if (existing.length > 0) return { id: existing[0].id }

  const created = await sql`
    INSERT INTO carts (store_id, session_token, status) VALUES (${storeId}, ${sessionToken}, 'open') RETURNING id
  `
  return { id: created[0].id }
}

export async function addCartItem(
  cartId: number,
  productId: number,
  variantId: number | null,
  quantity: number,
): Promise<void> {
  const sql = getSql()
  await sql`
    INSERT INTO cart_items (cart_id, product_id, variant_id, quantity)
    VALUES (${cartId}, ${productId}, ${variantId}, ${quantity})
    ON CONFLICT (cart_id, product_id, variant_id)
    DO UPDATE SET quantity = cart_items.quantity + ${quantity}, updated_at = NOW()
  `
}

export async function updateCartItemQuantity(itemId: number, quantity: number): Promise<void> {
  const sql = getSql()
  if (quantity <= 0) {
    await sql`DELETE FROM cart_items WHERE id = ${itemId}`
    return
  }
  await sql`UPDATE cart_items SET quantity = ${quantity}, updated_at = NOW() WHERE id = ${itemId}`
}

export async function removeCartItem(itemId: number): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM cart_items WHERE id = ${itemId}`
}

export async function getCartItemSessionToken(itemId: number): Promise<string | null> {
  const sql = getSql()
  const result = await sql`
    SELECT c.session_token FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    WHERE ci.id = ${itemId}
  `
  return result.length > 0 ? result[0].session_token : null
}

export async function getCartWithItems(cartId: number): Promise<CartItemWithProduct[]> {
  const sql = getSql()
  const result = await sql`
    SELECT
      ci.id, ci.cart_id, ci.product_id, ci.variant_id, ci.quantity,
      p.name as product_name, p.slug as product_slug,
      COALESCE(pv.price_override, p.price) as price,
      pv.name as variant_name,
      (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) as image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_variants pv ON ci.variant_id = pv.id
    WHERE ci.cart_id = ${cartId}
    ORDER BY ci.created_at ASC
  `
  return result as unknown as CartItemWithProduct[]
}

export async function getStorePaymentSettings(storeId: number): Promise<StorePaymentSettings | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM store_payment_settings WHERE store_id = ${storeId}`
  return result.length > 0 ? (result[0] as unknown as StorePaymentSettings) : null
}

function generateOrderNumber(storeSlug: string): string {
  const prefix = storeSlug.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "ORD"
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

export async function createOrderFromCart(
  storeId: number,
  storeSlug: string,
  cartId: number,
  customerInfo: Record<string, any>,
  paymentMethod: string,
): Promise<{ order: Order; items: OrderItemRow[] }> {
  const sql = getSql()
  const cartItems = await getCartWithItems(cartId)
  if (cartItems.length === 0) {
    throw new Error("سبد خرید خالی است")
  }

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const orderNumber = generateOrderNumber(storeSlug)

  const orderResult = await sql`
    INSERT INTO orders (store_id, cart_id, order_number, customer_info, subtotal, total, status, payment_method, payment_status)
    VALUES (${storeId}, ${cartId}, ${orderNumber}, ${JSON.stringify(customerInfo)}, ${subtotal}, ${subtotal}, 'pending_payment', ${paymentMethod}, 'pending')
    RETURNING *
  `
  const order = orderResult[0] as unknown as Order

  const items: OrderItemRow[] = []
  for (const item of cartItems) {
    const itemResult = await sql`
      INSERT INTO order_items (order_id, product_id, product_name, variant_name, price, quantity)
      VALUES (${order.id}, ${item.product_id}, ${item.product_name}, ${item.variant_name}, ${item.price}, ${item.quantity})
      RETURNING *
    `
    items.push(itemResult[0] as unknown as OrderItemRow)
  }

  await sql`UPDATE carts SET status = 'converted', updated_at = NOW() WHERE id = ${cartId}`

  return { order, items }
}

export async function createPaymentTransaction(orderId: number, gateway: string, amount: number): Promise<{ id: number }> {
  const sql = getSql()
  const result = await sql`
    INSERT INTO payment_transactions (order_id, gateway, amount, status)
    VALUES (${orderId}, ${gateway}, ${amount}, 'initiated')
    RETURNING id
  `
  return { id: result[0].id }
}

export async function updatePaymentTransaction(
  orderId: number,
  gateway: string,
  updates: { status?: string; gateway_ref?: string; receipt_image_url?: string },
): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE payment_transactions SET
      status = COALESCE(${updates.status}, status),
      gateway_ref = COALESCE(${updates.gateway_ref}, gateway_ref),
      receipt_image_url = COALESCE(${updates.receipt_image_url}, receipt_image_url),
      updated_at = NOW()
    WHERE order_id = ${orderId} AND gateway = ${gateway}
  `
}

export async function markOrderPaid(orderId: number): Promise<void> {
  const sql = getSql()
  await sql`UPDATE orders SET payment_status = 'paid', status = 'processing', updated_at = NOW() WHERE id = ${orderId}`
}

export async function markOrderFailed(orderId: number): Promise<void> {
  const sql = getSql()
  await sql`UPDATE orders SET payment_status = 'failed', updated_at = NOW() WHERE id = ${orderId}`
}

export async function getOrderByNumber(storeId: number, orderNumber: string): Promise<Order | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM orders WHERE store_id = ${storeId} AND order_number = ${orderNumber}`
  return result.length > 0 ? (result[0] as unknown as Order) : null
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM orders WHERE id = ${orderId}`
  return result.length > 0 ? (result[0] as unknown as Order) : null
}

export async function getCardToCardInfo(
  storeId: number,
): Promise<{ card_number: string; card_iban: string; card_holder_name: string } | null> {
  const sql = getSql()
  const result = await sql`
    SELECT card_number, card_iban, card_holder_name FROM store_payment_settings
    WHERE store_id = ${storeId} AND card_to_card_enabled = TRUE
  `
  return result.length > 0 ? (result[0] as any) : null
}

export async function getOrderItemsByOrderId(orderId: number): Promise<OrderItemRow[]> {
  const sql = getSql()
  const result = await sql`SELECT * FROM order_items WHERE order_id = ${orderId} ORDER BY id ASC`
  return result as unknown as OrderItemRow[]
}
