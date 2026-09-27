import { NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"
import { verifySuperAdmin } from "@/lib/super-admin"

export async function GET() {
  const isAuthenticated = await verifySuperAdmin()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const sql = getSharedSql()
    const users = await sql`
      SELECT 
        u.*,
        COALESCE(stats.chatbot_count, 0) as chatbot_count,
        COALESCE(stats.message_count, 0) as message_count,
        COALESCE(stats.ticket_count, 0) as ticket_count,
        COALESCE(chatbot_data.chatbots, '[]'::json) as chatbots
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(DISTINCT c.id) as chatbot_count,
          COUNT(DISTINCT cm.id) as message_count,
          COUNT(DISTINCT t.id) as ticket_count
        FROM chatbots c
        LEFT JOIN chatbot_messages cm ON c.id = cm.chatbot_id
        LEFT JOIN tickets t ON c.id = t.chatbot_id
        GROUP BY user_id
      ) stats ON u.id = stats.user_id
      LEFT JOIN (
        SELECT 
          user_id,
          json_agg(
            json_build_object(
              'id', id,
              'name', name,
              'is_active', COALESCE(is_active, true),
              'created_at', created_at
            ) ORDER BY created_at DESC
          ) as chatbots
        FROM chatbots
        GROUP BY user_id
      ) chatbot_data ON u.id = chatbot_data.user_id
      ORDER BY u.created_at DESC
    `

    const orphanedChatbots = await sql`
      SELECT 
        id,
        name,
        COALESCE(is_active, true) as is_active,
        created_at
      FROM chatbots
      WHERE user_id IS NULL
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      users,
      orphanedChatbots,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "خطا در دریافت کاربران" }, { status: 500 })
  }
}
