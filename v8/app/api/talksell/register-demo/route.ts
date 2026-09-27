// API route to register demo users to TalkSell
import { type NextRequest, NextResponse } from "next/server"

const TALKSELL_API_BASE = "https://talksell.ir/wp-json/talksell"
const TALKSELL_API_KEY = process.env.TALKSELL_API_KEY ?? ""

function normalizePhoneForTalkSell(phone: string): string {
  const digits = phone.replace(/\D/g, "")

  if (digits.startsWith("98") && digits.length === 12) {
    return "0" + digits.slice(2)
  } else if (digits.startsWith("0") && digits.length === 11) {
    return digits
  } else if (digits.length === 10 && !digits.startsWith("0")) {
    return "0" + digits
  }

  return digits
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone } = body

    if (!name || !phone) {
      return NextResponse.json({ success: false, message: "نام و شماره تلفن الزامی است" }, { status: 400 })
    }

    const normalizedPhone = normalizePhoneForTalkSell(phone)
    const userEmail = email || `${normalizedPhone}@talksell.ir`

    console.log("[API] Registering demo to TalkSell:", { email: userEmail, name, phone: normalizedPhone })

    const response = await fetch(`${TALKSELL_API_BASE}/demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": TALKSELL_API_KEY,
      },
      body: JSON.stringify({
        email: userEmail,
        name,
        phone: normalizedPhone,
      }),
    })

    const result = await response.json()
    console.log("[API] TalkSell demo registration result:", result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[API] Error registering demo:", error)
    return NextResponse.json({ success: false, message: error.message || "خطا در ثبت دمو" }, { status: 500 })
  }
}
