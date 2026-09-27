import { getSql } from "@/lib/db"

// Read-only aggregate queries that ground each AI Assistant tab in the store's real
// product/order data before the prompt goes to DeepSeek.

export interface SeoProductContext {
  id: number
  name: string
  description: string | null
  price: number
  category: string | null
}

export async function getSeoContext(storeId: number): Promise<SeoProductContext[]> {
  const sql = getSql()
  const result = await sql`
    SELECT p.id, p.name, p.description, p.price, pc.name as category
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    WHERE p.store_id = ${storeId} AND p.status = 'active'
    ORDER BY p.created_at DESC
    LIMIT 20
  `
  return result as unknown as SeoProductContext[]
}

export interface AnalyticsContext {
  totalOrders: number
  paidOrders: number
  totalRevenue: number
  last7DaysOrders: number
  prev7DaysOrders: number
  topProducts: Array<{ product_name: string; qty: number; revenue: number }>
}

export async function getAnalyticsContext(storeId: number): Promise<AnalyticsContext> {
  const sql = getSql()

  const totals = await sql`
    SELECT
      COUNT(*) as total_orders,
      COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_orders,
      COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0) as total_revenue
    FROM orders WHERE store_id = ${storeId}
  `

  const recentTrend = await sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last7,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') as prev7
    FROM orders WHERE store_id = ${storeId}
  `

  const topProducts = await sql`
    SELECT oi.product_name, SUM(oi.quantity) as qty, SUM(oi.price * oi.quantity) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.store_id = ${storeId}
    GROUP BY oi.product_name
    ORDER BY qty DESC
    LIMIT 10
  `

  return {
    totalOrders: Number(totals[0]?.total_orders || 0),
    paidOrders: Number(totals[0]?.paid_orders || 0),
    totalRevenue: Number(totals[0]?.total_revenue || 0),
    last7DaysOrders: Number(recentTrend[0]?.last7 || 0),
    prev7DaysOrders: Number(recentTrend[0]?.prev7 || 0),
    topProducts: topProducts.map((r: any) => ({
      product_name: r.product_name,
      qty: Number(r.qty),
      revenue: Number(r.revenue),
    })),
  }
}

export interface MarketingContext {
  storeName: string
  storeCategory: string | null
  productCount: number
  topProducts: Array<{ product_name: string; qty: number }>
}

export async function getMarketingContext(storeId: number): Promise<MarketingContext> {
  const sql = getSql()

  const store = await sql`SELECT name, category FROM stores WHERE id = ${storeId}`
  const productCount = await sql`SELECT COUNT(*) as count FROM products WHERE store_id = ${storeId} AND status = 'active'`
  const topProducts = await sql`
    SELECT oi.product_name, SUM(oi.quantity) as qty
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.store_id = ${storeId}
    GROUP BY oi.product_name
    ORDER BY qty DESC
    LIMIT 5
  `

  return {
    storeName: store[0]?.name || "فروشگاه",
    storeCategory: store[0]?.category || null,
    productCount: Number(productCount[0]?.count || 0),
    topProducts: topProducts.map((r: any) => ({ product_name: r.product_name, qty: Number(r.qty) })),
  }
}

export interface CrmCustomer {
  phone: string
  name: string | null
  orderCount: number
  totalSpent: number
  lastOrderAt: string
}

export async function getCrmContext(storeId: number): Promise<CrmCustomer[]> {
  const sql = getSql()
  const result = await sql`
    SELECT
      customer_info->>'phone' as phone,
      customer_info->>'full_name' as name,
      COUNT(*) as order_count,
      COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0) as total_spent,
      MAX(created_at) as last_order_at
    FROM orders
    WHERE store_id = ${storeId} AND customer_info->>'phone' IS NOT NULL
    GROUP BY customer_info->>'phone', customer_info->>'full_name'
    ORDER BY total_spent DESC
    LIMIT 30
  `
  return result.map((r: any) => ({
    phone: r.phone,
    name: r.name,
    orderCount: Number(r.order_count),
    totalSpent: Number(r.total_spent),
    lastOrderAt: r.last_order_at,
  }))
}
