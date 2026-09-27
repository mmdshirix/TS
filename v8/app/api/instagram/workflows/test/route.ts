import { NextResponse, type NextRequest } from "next/server"
import { requireStore, fail } from "@/lib/store-route"
import { getAccountByStore, handleIncomingMessage, type InstagramAccount } from "@/lib/instagram"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 30

/** Simulator: POST { text, first?: boolean } → which workflow fires and what would be sent (nothing is sent). */
export async function POST(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  const text = String(body.text || "").trim()
  if (!text) return fail("متن پیام را وارد کنید")
  const account: InstagramAccount =
    (await getAccountByStore(ctx.store.id)) ||
    ({ id: 0, store_id: ctx.store.id, user_id: ctx.user.id, page_name: "", ig_username: null, ig_user_id: null, fb_page_id: null, access_token: null, token_expires_at: null, status: "pending", status_message: null, ai_enabled: true, ai_tone: "friendly", ai_handoff_keywords: null, greeting_message: null, away_message: null, daily_message_count: 0, total_message_count: 0, connected_at: null } as InstagramAccount)
  const result = await handleIncomingMessage(account, "simulator", text, { dryRun: true })
  return NextResponse.json({ via: result.via, workflow: result.matchedWorkflow ? { id: result.matchedWorkflow.id, name: result.matchedWorkflow.name } : null, actions: result.actions })
}
