import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = params.id
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(`admin_session_${chatbotId}`)?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    // Verify session token against database
    const user = await verifySession(sessionToken)

    if (!user || user.chatbot_id !== Number(chatbotId)) {
      return NextResponse.json({ error: "session نامعتبر" }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "خطا در بررسی احراز هویت" }, { status: 500 })
  }
}
