import { type NextRequest, NextResponse } from "next/server"
import { createTicket } from "@/lib/db"
import { checkTicketLimit } from "@/lib/plan-limits"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { chatbot_id, name, phone, subject, message, user_ip, user_agent, image_url } = body

    if (!chatbot_id) {
      return NextResponse.json({ error: "شناسه چت‌بات الزامی است" }, { status: 400 })
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: "نام الزامی است" }, { status: 400 })
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: "موضوع الزامی است" }, { status: 400 })
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: "پیام الزامی است" }, { status: 400 })
    }

    const limitCheck = await checkTicketLimit(Number.parseInt(chatbot_id))
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message }, { status: 403 })
    }

    const ticket = await createTicket({
      chatbot_id: Number.parseInt(chatbot_id),
      user_name: name.trim(),
      user_phone: phone?.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
      user_ip: user_ip || null,
      user_agent: user_agent || null,
      image_url: image_url || null,
      status: "open",
      priority: "normal",
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ error: "خطا در ساخت تیکت" }, { status: 500 })
  }
}
