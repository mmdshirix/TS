import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const sql = getSql()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const messages = await sql`
      SELECT 
        cm.*,
        c.name as chatbot_name,
        c.id as chatbot_id
      FROM chatbot_messages cm
      JOIN chatbots c ON cm.chatbot_id = c.id
      WHERE c.user_id = ${user.id}
      ORDER BY cm.timestamp DESC
      LIMIT 1000
    `

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching all messages:", error)
    return NextResponse.json({ error: "خطا در دریافت پیام‌ها" }, { status: 500 })
  }
}
