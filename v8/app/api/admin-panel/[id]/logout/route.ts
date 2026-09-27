import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logoutAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = params.id
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(`admin_session_${chatbotId}`)?.value

    if (sessionToken) {
      await logoutAdmin(sessionToken)
    }

    const response = NextResponse.json({ success: true })

    // Clear the session cookie
    response.cookies.set(`admin_session_${chatbotId}`, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "خطا در خروج" }, { status: 500 })
  }
}
