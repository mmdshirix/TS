import { NextRequest, NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"
import { verifySuperAdmin } from "@/lib/super-admin"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const isAuthenticated = await verifySuperAdmin()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const sql = getSharedSql()
    const chatbotId = Number.parseInt(params.id)

    // Delete all related data
    await sql`DELETE FROM chatbot_messages WHERE chatbot_id = ${chatbotId}`
    await sql`DELETE FROM chatbot_products WHERE chatbot_id = ${chatbotId}`
    await sql`DELETE FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`
    await sql`DELETE FROM chatbot_knowledge_base WHERE chatbot_id = ${chatbotId}`
    await sql`DELETE FROM tickets WHERE chatbot_id = ${chatbotId}`
    await sql`DELETE FROM suggested_products WHERE chatbot_id = ${chatbotId}`
    await sql`DELETE FROM chatbots WHERE id = ${chatbotId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json({ error: "خطا در حذف چت‌بات" }, { status: 500 })
  }
}
