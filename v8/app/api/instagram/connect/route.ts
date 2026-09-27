import { NextResponse, type NextRequest } from "next/server"
import { randomBytes } from "crypto"
import { requireStore, fail } from "@/lib/store-route"
import { metaConfig, oauthUrl, upsertPendingAccount } from "@/lib/instagram"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * POST { page_name } → saves the pending account and returns the Facebook OAuth URL the
 * dashboard redirects the user to. The user grants the Taxel Meta app access to the
 * Facebook Page linked to their Instagram professional account.
 */
export async function POST(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  const pageName = String(body.page_name || "").trim()
  if (pageName.length < 2) return fail("نام پیج را وارد کنید")

  const account = await upsertPendingAccount(ctx.store.id, ctx.user.id, pageName)
  const cfg = metaConfig()
  if (!cfg.configured) {
    return NextResponse.json({
      account,
      configured: false,
      message: "اتصال به اینستاگرام هنوز روی سرور پیکربندی نشده است (META_APP_ID / META_APP_SECRET). راهنما: docs/instagram-setup.md",
    })
  }

  const state = randomBytes(16).toString("hex")
  const sql = getSql()
  await sql`
    INSERT INTO global_settings (setting_key, setting_value, updated_at) VALUES (${`ig_state_${state}`}, ${String(ctx.store.id)}, NOW())
    ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
  `
  return NextResponse.json({ account, configured: true, authUrl: oauthUrl(state) })
}
