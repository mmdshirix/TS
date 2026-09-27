import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getStoreSmsSettings, createOtpCode } from "@/lib/otp-db"
import { sendSmsIrOtp } from "@/lib/sms/sms-ir"
import { sendMelipayamakOtp } from "@/lib/sms/melipayamak"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
  }

  const body = await request.json()
  const phone = typeof body.phone === "string" ? body.phone.replace(/\s|-/g, "") : ""
  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "شماره تلفن معتبر نیست" }, { status: 400 })
  }

  const settings = await getStoreSmsSettings(store.id)
  if (!settings || !settings.otp_enabled) {
    return NextResponse.json({ error: "تایید پیامکی برای این فروشگاه فعال نیست" }, { status: 400 })
  }

  const code = await createOtpCode(store.id, phone)

  const result =
    settings.provider === "melipayamak"
      ? await sendMelipayamakOtp({
          username: settings.melipayamak_username || "",
          password: settings.melipayamak_password || "",
          bodyId: settings.melipayamak_body_id || "",
          mobile: phone,
          code,
        })
      : await sendSmsIrOtp({
          apiKey: settings.sms_ir_api_key || "",
          templateId: settings.sms_ir_template_id || "",
          mobile: phone,
          code,
        })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
