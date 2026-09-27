import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const sql = getSql()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Fetching dashboard stats for user:", user.id)

    const chatbotsResult = await sql`
      SELECT COUNT(*) as count
      FROM chatbots
      WHERE user_id = ${user.id}
    `
    const activeChatbots = Number(chatbotsResult[0]?.count || 0)

    const conversationsResult = await sql`
      SELECT COUNT(*) as count
      FROM chatbot_messages cm
      INNER JOIN chatbots c ON cm.chatbot_id = c.id
      WHERE c.user_id = ${user.id}
    `
    const totalConversations = Number(conversationsResult[0]?.count || 0)

    const openTicketsResult = await sql`
      SELECT COUNT(*) as count
      FROM tickets t
      INNER JOIN chatbots c ON t.chatbot_id = c.id
      WHERE c.user_id = ${user.id}
      AND t.status IN ('open', 'pending')
    `
    const openTickets = Number(openTicketsResult[0]?.count || 0)

    const totalMessagesResult = await sql`
      SELECT COUNT(*) as count
      FROM chatbot_messages cm
      INNER JOIN chatbots c ON cm.chatbot_id = c.id
      WHERE c.user_id = ${user.id}
    `
    const totalMessages = Number(totalMessagesResult[0]?.count || 0)

    const satisfaction = totalMessages > 0 ? 85 : 0

    const lastMonthChatbotsResult = await sql`
      SELECT COUNT(*) as count
      FROM chatbots
      WHERE user_id = ${user.id}
      AND created_at < NOW() - INTERVAL '1 month'
    `
    const lastMonthChatbots = Number(lastMonthChatbotsResult[0]?.count || 0)
    const chatbotsGrowth =
      lastMonthChatbots > 0 ? Math.round(((activeChatbots - lastMonthChatbots) / lastMonthChatbots) * 100) : 0

    const lastWeekConversationsResult = await sql`
      SELECT COUNT(*) as count
      FROM chatbot_messages cm
      INNER JOIN chatbots c ON cm.chatbot_id = c.id
      WHERE c.user_id = ${user.id}
      AND cm.timestamp < NOW() - INTERVAL '1 week'
    `
    const lastWeekConversations = Number(lastWeekConversationsResult[0]?.count || 0)
    const conversationsGrowth =
      lastWeekConversations > 0
        ? Math.round(((totalConversations - lastWeekConversations) / lastWeekConversations) * 100)
        : 0

    const dailyMessagesResult = await sql`
      SELECT 
        DATE(cm.timestamp) as date,
        COUNT(*) as count
      FROM chatbot_messages cm
      INNER JOIN chatbots c ON cm.chatbot_id = c.id
      WHERE c.user_id = ${user.id}
      AND cm.timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(cm.timestamp)
      ORDER BY date ASC
    `

    const dailyMessages = dailyMessagesResult.map((row: any) => ({
      date: new Date(row.date).toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
      count: Number(row.count || 0),
    }))

    const stats = {
      activeChatbots,
      totalConversations,
      openTickets,
      satisfaction,
      totalMessages,
      chatbotsGrowth,
      conversationsGrowth,
      dailyMessages, // Added daily message data
    }

    console.log("[v0] Dashboard stats:", stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
