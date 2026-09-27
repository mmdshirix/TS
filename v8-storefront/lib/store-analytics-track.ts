import { getSql } from "@/lib/db"

// Write layer for store_analytics_events (schema: v8/scripts/create-store-analytics.sql).
// Same ownership pattern as lib/explorer-interactions.ts: this app writes at runtime
// against the same DATABASE_URL, the admin dashboard (v8) reads it for the stats tab.

export async function recordAnalyticsEvent(data: {
  storeId: number
  eventType: "page_view" | "explorer_play"
  visitorToken: string
  path?: string | null
  targetId?: number | null
}): Promise<void> {
  const sql = getSql()
  await sql`
    INSERT INTO store_analytics_events (store_id, event_type, visitor_token, path, target_id)
    VALUES (${data.storeId}, ${data.eventType}, ${data.visitorToken}, ${data.path || null}, ${data.targetId ?? null})
  `
}
