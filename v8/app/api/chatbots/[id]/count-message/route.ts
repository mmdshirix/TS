import { type NextRequest, NextResponse } from "next/server"
import { saveMessage } from "@/lib/db"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    const { userMessage, botResponse, userIp, userAgent } = await req.json()

    if (!chatbotId || !userMessage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await saveMessage(chatbotId, userMessage, botResponse || "", userIp || "", userAgent || "")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error counting message:", error)
    return NextResponse.json({ error: "Failed to count message" }, { status: 500 })
  }
}
