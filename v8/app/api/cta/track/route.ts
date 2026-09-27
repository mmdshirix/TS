// API endpoint to track CTA (Call-To-Action) clicks
import { type NextRequest, NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"
import { incrementCTAUsage } from "@/lib/subscription-system"

export const dynamic = "force-dynamic"

function getSql() {
  return getSharedSql()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { chatbotId, productId, ctaType } = body

    if (!chatbotId) {
      return NextResponse.json({ error: "Missing chatbotId" }, { status: 400 })
    }

    const sql = getSql()

    // Get chatbot owner
    const [chatbot] = await sql`
      SELECT user_id FROM chatbots WHERE id = ${chatbotId}
    `

    if (!chatbot?.user_id) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Increment CTA usage for the user
    await incrementCTAUsage(chatbot.user_id)

    // Log the CTA click for analytics
    await sql`
      INSERT INTO cta_clicks (chatbot_id, product_id, cta_type, created_at)
      VALUES (${chatbotId}, ${productId || null}, ${ctaType || "product_link"}, CURRENT_TIMESTAMP)
    `

    console.log("[CTA Track] CTA click tracked for chatbot:", chatbotId, "user:", chatbot.user_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CTA Track] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
