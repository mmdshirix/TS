import { type NextRequest, NextResponse } from "next/server"
import { authenticateAdmin, createSession } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "نام کاربری و رمز عبور الزامی است" }, { status: 400 })
    }

    const user = await authenticateAdmin(chatbotId, username, password)

    if (!user) {
      return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است" }, { status: 401 })
    }

    const sessionToken = await createSession(user.id)

    // Set session cookie with proper settings
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
      },
    })

    // Set cookie with proper settings
    response.cookies.set(`admin_session_${chatbotId}`, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "خطا در سرور" }, { status: 500 })
  }
}
