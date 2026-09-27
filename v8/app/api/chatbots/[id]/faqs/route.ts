import { NextResponse } from "next/server"
import { syncChatbotFAQs, type ChatbotFAQ } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const chatbotId = Number.parseInt(params.id, 10)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
  }

  try {
    const faqs = (await request.json()) as Partial<ChatbotFAQ>[]
    console.log(`[API PUT /faqs] Received request for chatbot ${chatbotId} with ${faqs.length} FAQs.`)

    if (!Array.isArray(faqs)) {
      console.error("[API PUT /faqs] Invalid data format: not an array.")
      return NextResponse.json({ error: "داده‌های ارسالی باید یک آرایه از سوالات باشد" }, { status: 400 })
    }

    const updatedFAQs = await syncChatbotFAQs(chatbotId, faqs)
    console.log(`[API PUT /faqs] Successfully synced ${updatedFAQs.length} FAQs for chatbot ${chatbotId}.`)
    return NextResponse.json(updatedFAQs)
  } catch (error) {
    console.error(`[API PUT /faqs] Error syncing FAQs for chatbot ${chatbotId}:`, error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "خطای داخلی سرور در ذخیره سوالات", details: errorMessage }, { status: 500 })
  }
}
