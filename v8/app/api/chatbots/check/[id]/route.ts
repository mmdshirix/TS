import { type NextRequest, NextResponse } from "next/server"
import { getChatbotById } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const chatbot = await getChatbotById(id)

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Return only the essential settings needed for the widget
    return NextResponse.json({
      id: chatbot.id,
      name: chatbot.name,
      primary_color: chatbot.primary_color,
      chat_icon: chatbot.chat_icon,
      position: chatbot.position,
    })
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return NextResponse.json({ error: "Failed to fetch chatbot" }, { status: 500 })
  }
}
