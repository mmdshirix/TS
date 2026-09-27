import { type NextRequest, NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string; ticketId: string } }) {
  try {
    const sql = getSharedSql()

    const { admin_response, status } = await request.json()
    const chatbotId = Number.parseInt(params.id)
    const ticketId = Number.parseInt(params.ticketId)

    if (!admin_response || !status) {
      return NextResponse.json({ error: "پاسخ و وضعیت الزامی است" }, { status: 400 })
    }

    // Update ticket with admin response
    await sql`
      UPDATE tickets 
      SET admin_response = ${admin_response},
          status = ${status},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${ticketId} AND chatbot_id = ${chatbotId}
    `

    return NextResponse.json({
      success: true,
      message: "پاسخ با موفقیت ثبت شد",
    })
  } catch (error) {
    console.error("Error responding to ticket:", error)
    return NextResponse.json({ error: "خطا در ثبت پاسخ" }, { status: 500 })
  }
}
