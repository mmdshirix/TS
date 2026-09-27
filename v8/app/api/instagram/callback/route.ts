import { NextResponse, type NextRequest } from "next/server"
import { getSql } from "@/lib/db"
import { completeOAuth, listPagesWithInstagram, subscribePageToWebhooks, encryptToken, getAccountByStore, updateAccount } from "@/lib/instagram"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const back = (q: string) => NextResponse.redirect(`${origin}/dashboard/instagram?${q}`)
  if (!code || !state) return back("error=" + encodeURIComponent(searchParams.get("error_description") || "دسترسی داده نشد"))

  const sql = getSql()
  const row = (await sql`SELECT setting_value FROM global_settings WHERE setting_key = ${`ig_state_${state}`}`)[0] as any
  if (!row) return back("error=" + encodeURIComponent("درخواست نامعتبر یا منقضی شده"))
  await sql`DELETE FROM global_settings WHERE setting_key = ${`ig_state_${state}`}`
  const storeId = Number(row.setting_value)
  const account = await getAccountByStore(storeId)
  if (!account) return back("error=" + encodeURIComponent("حساب یافت نشد"))

  try {
    const { userToken, expiresIn } = await completeOAuth(code)
    const pages = await listPagesWithInstagram(userToken)
    const want = account.page_name.toLowerCase()
    const match =
      pages.find((p) => p.igUsername?.toLowerCase() === want) ||
      pages.find((p) => p.pageName.toLowerCase() === want) ||
      pages.find((p) => p.igUserId) ||
      null
    if (!match || !match.igUserId) {
      await updateAccount(storeId, { status: "error", status_message: "هیچ صفحه فیسبوکی با اکانت اینستاگرام بیزینس متصل پیدا نشد. پیج را به Business/Creator تبدیل و به یک Facebook Page وصل کنید." })
      return back("error=" + encodeURIComponent("اکانت اینستاگرام بیزینس متصل به صفحه فیسبوک پیدا نشد"))
    }
    await subscribePageToWebhooks(match.pageId, match.pageToken).catch((e) => console.error("[instagram] subscribe failed", e))
    await updateAccount(storeId, {
      ig_username: match.igUsername,
      ig_user_id: match.igUserId,
      fb_page_id: match.pageId,
      access_token: encryptToken(match.pageToken),
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString() as any,
      status: "connected",
      status_message: null,
      connected_at: new Date().toISOString() as any,
    })
    return back("connected=1")
  } catch (e) {
    console.error("[instagram/callback]", e)
    await updateAccount(storeId, { status: "error", status_message: e instanceof Error ? e.message : "خطا در اتصال" })
    return back("error=" + encodeURIComponent(e instanceof Error ? e.message : "خطا در اتصال"))
  }
}
