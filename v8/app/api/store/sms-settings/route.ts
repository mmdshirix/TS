import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { getSmsSettings, upsertSmsSettings } from "@/lib/sms-settings-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ settings: null })
    }

    const settings = await getSmsSettings(store.id)
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("API Error fetching SMS settings:", error)
    return NextResponse.json({ error: "Failed to fetch SMS settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "ابتدا باید فروشگاه بسازید" }, { status: 400 })
    }

    const body = await request.json()
    const settings = await upsertSmsSettings(store.id, {
      provider: body.provider === "melipayamak" ? "melipayamak" : "sms_ir",
      otp_enabled: Boolean(body.otp_enabled),
      sms_ir_api_key: body.sms_ir_api_key,
      sms_ir_template_id: body.sms_ir_template_id,
      melipayamak_username: body.melipayamak_username,
      melipayamak_password: body.melipayamak_password,
      melipayamak_body_id: body.melipayamak_body_id,
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("API Error saving SMS settings:", error)
    return NextResponse.json({ error: "خطا در ذخیره تنظیمات پیامکی" }, { status: 500 })
  }
}
