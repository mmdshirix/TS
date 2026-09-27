import { NextResponse, type NextRequest } from "next/server"
import { requireStore } from "@/lib/store-route"
import { recentConversations, conversationMessages } from "@/lib/instagram"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const id = request.nextUrl.searchParams.get("id")
  if (id) return NextResponse.json({ messages: await conversationMessages(ctx.store.id, Number(id)) })
  return NextResponse.json({ conversations: await recentConversations(ctx.store.id) })
}

/** PATCH { id, ai_paused } — resume/pause the AI for one conversation */
export async function PATCH(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  const sql = getSql()
  await sql`UPDATE dm_conversations SET ai_paused = ${Boolean(body.ai_paused)} WHERE id = ${Number(body.id)} AND store_id = ${ctx.store.id}`
  return NextResponse.json({ success: true })
}
