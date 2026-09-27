import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const sql = getSql()

    const chatbot = await sql`
      SELECT c.*, u.phone 
      FROM chatbots c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ${chatbotId} AND c.user_id = ${user.id}
    `

    if (chatbot.length === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    const userPhone = chatbot[0].phone

    const isSystemAdmin = userPhone === "0000000000"

    if (!isSystemAdmin) {
      await sql`
        UPDATE chatbots 
        SET is_active = FALSE 
        WHERE user_id = ${user.id} AND id != ${chatbotId}
      `
    }

    const result = await sql`
      UPDATE chatbots 
      SET is_active = NOT is_active
      WHERE id = ${chatbotId}
      RETURNING *
    `

    return NextResponse.json({ success: true, chatbot: result[0] })
  } catch (error) {
    console.error("Error toggling chatbot active status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
