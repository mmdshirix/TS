import { NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sql = getSharedSql()
    const cookieStore = await cookies()
    const superAdminToken = cookieStore.get("super_admin_token")?.value

    if (!superAdminToken) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 })
    }

    // Get chatbot details
    const chatbots = await sql`
      SELECT id, name, user_id 
      FROM chatbots 
      WHERE id = ${chatbotId}
    `

    if (chatbots.length === 0) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    const chatbot = chatbots[0]

    const sessionToken = `super_admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Check if chatbot_admin_sessions table exists, if not use user_sessions
    await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${chatbot.user_id || 0}, ${sessionToken}, ${expiresAt})
      ON CONFLICT DO NOTHING
    `

    // Return the admin panel URL with session
    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ororw.vercel.app"}/admin-panel/${chatbotId}/login?super_admin_token=${sessionToken}`

    return NextResponse.json({
      success: true,
      adminUrl,
      chatbotId: chatbot.id,
      chatbotName: chatbot.name,
    })
  } catch (error) {
    console.error("Error generating chatbot login:", error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}
