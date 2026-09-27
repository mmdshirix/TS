import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const sql = getSql()
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbot_id")
    const userPhone = searchParams.get("user_phone")
    const userName = searchParams.get("user_name")

    console.log("[v0] Ticket lookup request:", { chatbotId, userPhone, userName })

    if (!chatbotId || !userPhone) {
      return NextResponse.json({ error: "شناسه چت‌بات و شماره تماس الزامی است" }, { status: 400 })
    }

    let tickets
    if (userName && userName.trim()) {
      tickets = await sql`
        SELECT * FROM tickets 
        WHERE chatbot_id = ${Number.parseInt(chatbotId)}
        AND user_phone = ${userPhone}
        AND user_name ILIKE ${`%${userName}%`}
        ORDER BY created_at DESC
      `
    } else {
      tickets = await sql`
        SELECT * FROM tickets 
        WHERE chatbot_id = ${Number.parseInt(chatbotId)}
        AND user_phone = ${userPhone}
        ORDER BY created_at DESC
      `
    }

    console.log("[v0] Found tickets:", tickets.length)

    // Fetch responses for each ticket
    const ticketsWithResponses = await Promise.all(
      tickets.map(async (ticket: any) => {
        const responses = await sql`
          SELECT * FROM ticket_responses 
          WHERE ticket_id = ${ticket.id}
          ORDER BY created_at ASC
        `
        return {
          ...ticket,
          responses,
        }
      }),
    )

    return NextResponse.json({ tickets: ticketsWithResponses })
  } catch (error) {
    console.error("[v0] Error looking up tickets:", error)
    return NextResponse.json({ error: "خطا در جستجوی تیکت" }, { status: 500 })
  }
}
