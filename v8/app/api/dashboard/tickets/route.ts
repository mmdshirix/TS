import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getUserChatbots } from "@/lib/user-db"
import { getChatbotTickets } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatbots = await getUserChatbots(user.id)
    const chatbotIds = chatbots.map((c) => c.id)

    const allTickets = []
    for (const chatbotId of chatbotIds) {
      const tickets = await getChatbotTickets(chatbotId)
      allTickets.push(...tickets)
    }

    allTickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ tickets: allTickets })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
}
