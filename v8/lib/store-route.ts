import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId, type Store } from "@/lib/store-db"
import type { User } from "@/lib/auth"

/**
 * Shared guard for /api/store/* handlers: resolves the signed-in user and their store,
 * or returns the right JSON error. Usage:
 *   const ctx = await requireStore(); if ("error" in ctx) return ctx.error
 */
export async function requireStore(): Promise<{ user: User; store: Store } | { error: NextResponse }> {
  const user = await getCurrentUser()
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const store = await getStoreByUserId(user.id)
  if (!store) return { error: NextResponse.json({ error: "ابتدا فروشگاه خود را بسازید" }, { status: 404 }) }
  return { user, store }
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
