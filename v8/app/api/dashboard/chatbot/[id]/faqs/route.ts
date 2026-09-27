import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getChatbotById, syncChatbotFAQs, getChatbotFAQs } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const chatbotId = Number(params.id)
    const { faqs } = await request.json()

    // Verify ownership
    const chatbot = await getChatbotById(chatbotId)
    if (!chatbot || chatbot.user_id !== user.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    await syncChatbotFAQs(chatbotId, faqs)
    const updatedFaqs = await getChatbotFAQs(chatbotId)

    return NextResponse.json({ faqs: updatedFaqs })
  } catch (error) {
    console.error("Error updating FAQs:", error)
    return NextResponse.json({ error: "خطا در به‌روزرسانی سوالات" }, { status: 500 })
  }
}
