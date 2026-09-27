import { type NextRequest, NextResponse } from "next/server"
import { saveMessage } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatbot_id, user_message, bot_response, user_ip, user_agent } = body

    if (!chatbot_id || !user_message) {
      return NextResponse.json({ error: "داده‌های ناقص" }, { status: 400 })
    }

    const message = await saveMessage({
      chatbot_id: Number.parseInt(chatbot_id),
      user_message,
      bot_response: bot_response || null,
      user_ip: user_ip || null,
      user_agent: user_agent || null,
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Error saving message:", error)
    return NextResponse.json({ error: "خطا در ذخیره پیام" }, { status: 500 })
  }
}
