import type { NextRequest } from "next/server"
import { getStoreBySlug, type Store } from "@/lib/db"

// API routes can't rely on the [slug] path param (middleware only rewrites pages,
// see middleware.ts) — the store slug arrives via the x-store-slug header it sets.
export async function getStoreFromRequest(request: NextRequest): Promise<Store | null> {
  const slug = request.headers.get("x-store-slug")
  if (!slug) return null
  return getStoreBySlug(slug)
}
