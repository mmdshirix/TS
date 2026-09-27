import { getSql } from "@/lib/db"

// Read-side aggregate queries for the "My Store" stats tab. Sales/orders/best-sellers
// come from the existing orders/order_items tables (same pattern as
// lib/ai-assistant-data.ts's getAnalyticsContext). Visitors/page-views/explorer-plays
// come from store_analytics_events (scripts/create-store-analytics.sql), written at
// runtime by the storefront app (see v8-storefront/lib/store-analytics-track.ts).

export type StatsGranularity = "day" | "week" | "month" | "year"

const LOOKBACK: Record<StatsGranularity, string> = {
  day: "30 days",
  week: "12 weeks",
  month: "12 months",
  year: "5 years",
}

const TRUNC_UNIT: Record<StatsGranularity, string> = {
  day: "day",
  week: "week",
  month: "month",
  year: "year",
}

function formatBucketLabel(date: Date, granularity: StatsGranularity): string {
  switch (granularity) {
    case "day":
      return date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" })
    case "week":
      return date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" })
    case "month":
      return date.toLocaleDateString("fa-IR", { month: "long", year: "numeric" })
    case "year":
      return date.toLocaleDateString("fa-IR", { year: "numeric" })
  }
}

export interface StoreStatsSummary {
  totalRevenue: number
  totalOrders: number
  totalVisitors: number
  totalPageViews: number
  totalPlays: number
  revenueChangePct: number | null
}

export async function getStoreStatsSummary(storeId: number, granularity: StatsGranularity): Promise<StoreStatsSummary> {
  const sql = getSql()
  const interval = LOOKBACK[granularity]

  const orderTotals = await sql`
    SELECT
      COUNT(*) as orders,
      COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0) as revenue
    FROM orders
    WHERE store_id = ${storeId} AND created_at >= NOW() - ${interval}::interval
  `

  const prevOrderTotals = await sql`
    SELECT COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0) as revenue
    FROM orders
    WHERE store_id = ${storeId}
      AND created_at >= NOW() - (${interval}::interval * 2)
      AND created_at < NOW() - ${interval}::interval
  `

  const eventTotals = await sql`
    SELECT
      COUNT(DISTINCT visitor_token) FILTER (WHERE event_type = 'page_view') as visitors,
      COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
      COUNT(*) FILTER (WHERE event_type = 'explorer_play') as plays
    FROM store_analytics_events
    WHERE store_id = ${storeId} AND created_at >= NOW() - ${interval}::interval
  `

  const revenue = Number(orderTotals[0]?.revenue || 0)
  const prevRevenue = Number(prevOrderTotals[0]?.revenue || 0)
  const revenueChangePct = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null

  return {
    totalRevenue: revenue,
    totalOrders: Number(orderTotals[0]?.orders || 0),
    totalVisitors: Number(eventTotals[0]?.visitors || 0),
    totalPageViews: Number(eventTotals[0]?.page_views || 0),
    totalPlays: Number(eventTotals[0]?.plays || 0),
    revenueChangePct,
  }
}

export interface StoreStatsPoint {
  label: string
  revenue: number
  orders: number
  visitors: number
  pageViews: number
  plays: number
}

export async function getStoreStatsSeries(storeId: number, granularity: StatsGranularity): Promise<StoreStatsPoint[]> {
  const sql = getSql()
  const interval = LOOKBACK[granularity]
  const unit = TRUNC_UNIT[granularity]

  const orderRows = await sql`
    SELECT date_trunc(${unit}, created_at) as bucket,
      COUNT(*) as orders,
      COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0) as revenue
    FROM orders
    WHERE store_id = ${storeId} AND created_at >= NOW() - ${interval}::interval
    GROUP BY bucket
    ORDER BY bucket ASC
  `

  const eventRows = await sql`
    SELECT date_trunc(${unit}, created_at) as bucket,
      COUNT(DISTINCT visitor_token) FILTER (WHERE event_type = 'page_view') as visitors,
      COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
      COUNT(*) FILTER (WHERE event_type = 'explorer_play') as plays
    FROM store_analytics_events
    WHERE store_id = ${storeId} AND created_at >= NOW() - ${interval}::interval
    GROUP BY bucket
    ORDER BY bucket ASC
  `

  const byKey = new Map<string, StoreStatsPoint & { sortKey: string }>()

  for (const row of orderRows as any[]) {
    const date = new Date(row.bucket)
    const key = date.toISOString()
    byKey.set(key, {
      sortKey: key,
      label: formatBucketLabel(date, granularity),
      revenue: Number(row.revenue),
      orders: Number(row.orders),
      visitors: 0,
      pageViews: 0,
      plays: 0,
    })
  }

  for (const row of eventRows as any[]) {
    const date = new Date(row.bucket)
    const key = date.toISOString()
    const existing = byKey.get(key)
    if (existing) {
      existing.visitors = Number(row.visitors)
      existing.pageViews = Number(row.page_views)
      existing.plays = Number(row.plays)
    } else {
      byKey.set(key, {
        sortKey: key,
        label: formatBucketLabel(date, granularity),
        revenue: 0,
        orders: 0,
        visitors: Number(row.visitors),
        pageViews: Number(row.page_views),
        plays: Number(row.plays),
      })
    }
  }

  return Array.from(byKey.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey, ...point }) => point)
}

export interface BestSellingProduct {
  productId: number | null
  name: string
  qty: number
  revenue: number
}

export async function getBestSellingProducts(
  storeId: number,
  granularity: StatsGranularity,
  limit = 10,
): Promise<BestSellingProduct[]> {
  const sql = getSql()
  const interval = LOOKBACK[granularity]

  const rows = await sql`
    SELECT oi.product_id, oi.product_name, SUM(oi.quantity) as qty, SUM(oi.price * oi.quantity) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.store_id = ${storeId} AND o.created_at >= NOW() - ${interval}::interval
    GROUP BY oi.product_id, oi.product_name
    ORDER BY qty DESC
    LIMIT ${limit}
  `

  return rows.map((r: any) => ({
    productId: r.product_id ?? null,
    name: r.product_name,
    qty: Number(r.qty),
    revenue: Number(r.revenue),
  }))
}
