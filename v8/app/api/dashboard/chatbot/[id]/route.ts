import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import {
  getChatbotById,
  getChatbotFAQs,
  getChatbotProducts,
  getChatbotMessages,
  getChatbotTickets,
  updateChatbot,
} from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const chatbotId = Number(id)

    const [chatbot, faqs, products, messages, tickets] = await Promise.all([
      getChatbotById(chatbotId),
      getChatbotFAQs(chatbotId),
      getChatbotProducts(chatbotId),
      getChatbotMessages(chatbotId),
      getChatbotTickets(chatbotId),
    ])

    if (!chatbot) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    // Verify ownership
    if (chatbot.user_id !== user.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    return NextResponse.json({
      chatbot,
      faqs,
      products,
      messages: messages.slice(0, 100),
      tickets,
    })
  } catch (error) {
    console.error("Error fetching chatbot data:", error)
    return NextResponse.json({ error: "خطا در دریافت اطلاعات" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const chatbotId = Number(id)
    const data = await request.json()

    // Verify ownership
    const chatbot = await getChatbotById(chatbotId)
    if (!chatbot || chatbot.user_id !== user.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const updated = await updateChatbot(chatbotId, data)

    return NextResponse.json({ chatbot: updated })
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json({ error: "خطا در به‌روزرسانی" }, { status: 500 })
  }
}
