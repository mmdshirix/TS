import { NextResponse, type NextRequest } from "next/server"
import { requireStore } from "@/lib/store-route"
import { getAccountByStore, updateAccount, disconnectAccount, metaConfig, instagramStats } from "@/lib/instagram"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function publicAccount(a: any) {
  if (!a) return null
  const { access_token, ...rest } = a
  return { ...rest, has_token: Boolean(access_token) }
}

export async function GET() {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const [account, stats] = await Promise.all([getAccountByStore(ctx.store.id), instagramStats(ctx.store.id)])
  const cfg = metaConfig()
  return NextResponse.json({ account: publicAccount(account), stats, configured: cfg.configured, webhookUrl: cfg.webhookUrl, verifyToken: cfg.verifyToken })
}

export async function PUT(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  const account = await updateAccount(ctx.store.id, {
    ai_enabled: typeof body.ai_enabled === "boolean" ? body.ai_enabled : undefined,
    ai_tone: body.ai_tone,
    ai_handoff_keywords: body.ai_handoff_keywords,
    greeting_message: body.greeting_message,
    away_message: body.away_message,
  } as any)
  return NextResponse.json({ account: publicAccount(account) })
}

export async function DELETE() {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  await disconnectAccount(ctx.store.id)
  return NextResponse.json({ success: true })
}
