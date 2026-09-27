import { getSql } from "@/lib/db"

// Orders/payments data layer for the admin dashboard (Phase 4). Order/cart writes
// during checkout happen from the separate storefront app against the same tables;
// this file only covers what platform-talksell.ir needs: gateway settings management
// and order visibility/status updates.

export interface StorePaymentSettings {
  id: number
  store_id: number
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
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number | null
  product_name: string
  variant_name: string | null
  price: number
  quantity: number
}

export interface PaymentTransaction {
  id: number
  order_id: number
  gateway: string
  amount: number
  status: string
  gateway_ref: string | null
  receipt_image_url: string | null
  created_at: string
}

// --- PAYMENT SETTINGS ---

export async function getStorePaymentSettings(storeId: number): Promise<StorePaymentSettings | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM store_payment_settings WHERE store_id = ${storeId}`
  return result.length > 0 ? (result[0] as unknown as StorePaymentSettings) : null
}

export async function upsertStorePaymentSettings(
  storeId: number,
  updates: Partial<
    Pick<
      StorePaymentSettings,
      | "zarinpal_enabled"
      | "zarinpal_merchant_id"
      | "balepay_enabled"
      | "balepay_bot_token"
      | "card_to_card_enabled"
      | "card_number"
      | "card_iban"
      | "card_holder_name"
    >
  >,
): Promise<StorePaymentSettings> {
  const sql = getSql()
  const existing = await getStorePaymentSettings(storeId)

  if (!existing) {
    const result = await sql`
      INSERT INTO store_payment_settings (
        store_id, zarinpal_enabled, zarinpal_merchant_id, balepay_enabled, balepay_bot_token,
        card_to_card_enabled, card_number, card_iban, card_holder_name
      ) VALUES (
        ${storeId}, ${updates.zarinpal_enabled ?? false}, ${updates.zarinpal_merchant_id ?? null},
        ${updates.balepay_enabled ?? false}, ${updates.balepay_bot_token ?? null},
        ${updates.card_to_card_enabled ?? false}, ${updates.card_number ?? null},
        ${updates.card_iban ?? null}, ${updates.card_holder_name ?? null}
      )
      RETURNING *
    `
    return result[0] as unknown as StorePaymentSettings
  }

  const result = await sql`
    UPDATE store_payment_settings SET
      zarinpal_enabled = ${updates.zarinpal_enabled ?? existing.zarinpal_enabled},
      zarinpal_merchant_id = ${updates.zarinpal_merchant_id !== undefined ? updates.zarinpal_merchant_id : existing.zarinpal_merchant_id},
      balepay_enabled = ${updates.balepay_enabled ?? existing.balepay_enabled},
      balepay_bot_token = ${updates.balepay_bot_token !== undefined ? updates.balepay_bot_token : existing.balepay_bot_token},
      card_to_card_enabled = ${updates.card_to_card_enabled ?? existing.card_to_card_enabled},
      card_number = ${updates.card_number !== undefined ? updates.card_number : existing.card_number},
      card_iban = ${updates.card_iban !== undefined ? updates.card_iban : existing.card_iban},
      card_holder_name = ${updates.card_holder_name !== undefined ? updates.card_holder_name : existing.card_holder_name},
      updated_at = NOW()
    WHERE store_id = ${storeId}
    RETURNING *
  `
  return result[0] as unknown as StorePaymentSettings
}

// --- ORDERS ---

export async function listOrdersByStore(storeId: number, status?: string): Promise<Order[]> {
  const sql = getSql()
  const result = status
    ? await sql`SELECT * FROM orders WHERE store_id = ${storeId} AND status = ${status} ORDER BY created_at DESC`
    : await sql`SELECT * FROM orders WHERE store_id = ${storeId} ORDER BY created_at DESC`
  return result as unknown as Order[]
}

export async function getOrderById(id: number): Promise<Order | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM orders WHERE id = ${id}`
  return result.length > 0 ? (result[0] as unknown as Order) : null
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const sql = getSql()
  const result = await sql`SELECT * FROM order_items WHERE order_id = ${orderId} ORDER BY id ASC`
  return result as unknown as OrderItem[]
}

export async function getOrderPaymentTransactions(orderId: number): Promise<PaymentTransaction[]> {
  const sql = getSql()
  const result = await sql`SELECT * FROM payment_transactions WHERE order_id = ${orderId} ORDER BY created_at DESC`
  return result as unknown as PaymentTransaction[]
}

export async function updateOrderStatus(id: number, status: string): Promise<Order | null> {
  const sql = getSql()
  const result = await sql`
    UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${id} RETURNING *
  `
  return result.length > 0 ? (result[0] as unknown as Order) : null
}

// Used for manual card-to-card review: approve marks the order paid, reject marks payment failed.
export async function reviewCardToCardPayment(orderId: number, approve: boolean): Promise<Order | null> {
  const sql = getSql()
  const result = await sql`
    UPDATE orders SET
      payment_status = ${approve ? "paid" : "failed"},
      status = ${approve ? "processing" : "cancelled"},
      updated_at = NOW()
    WHERE id = ${orderId}
    RETURNING *
  `
  await sql`
    UPDATE payment_transactions SET
      status = ${approve ? "paid" : "failed"},
      updated_at = NOW()
    WHERE order_id = ${orderId} AND gateway = 'card_to_card'
  `
  return result.length > 0 ? (result[0] as unknown as Order) : null
}
