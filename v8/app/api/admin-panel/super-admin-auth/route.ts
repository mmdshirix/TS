import { NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"

export async function POST(request: Request) {
  try {
    const sql = getSharedSql()
    const { token, chatbotId } = await request.json()

    // Verify the super admin session token
    const sessions = await sql`
      SELECT * FROM chatbot_admin_sessions 
      WHERE session_token = ${token} 
      AND user_id = 0 
      AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: "توکن نامعتبر یا منقضی شده" }, { status: 401 })
    }

    // Create a new admin session for this chatbot
    const newSessionToken = `admin_${chatbotId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await sql`
      INSERT INTO chatbot_admin_sessions (session_token, user_id, expires_at, created_at)
      VALUES (${newSessionToken}, 0, ${expiresAt}, NOW())
    `

    return NextResponse.json({
      success: true,
      sessionToken: newSessionToken,
    })
  } catch (error) {
    console.error("Error in super admin auth:", error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}
