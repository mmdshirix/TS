import { type NextRequest, NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"
import { verifySuperAdmin } from "@/lib/super-admin"

export const dynamic = "force-dynamic"

function getSql() {
  return getSharedSql()
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await verifySuperAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getSql()
    const planId = Number.parseInt(params.id)
    const data = await request.json()

    await sql`
      UPDATE subscription_plans SET
        name = ${data.name},
        description = ${data.description},
        price = ${data.price},
        duration_days = ${data.duration_days},
        ai_tokens = ${data.ai_tokens},
        approx_conversations = ${data.approx_conversations},
        product_inputs = ${data.product_inputs},
        response_quality = ${data.response_quality},
        crawler_speed = ${data.crawler_speed},
        cta_suggestions_type = ${data.cta_suggestions_type},
        cta_suggestions_limit = ${data.cta_suggestions_limit},
        sales_advisor_limit = ${data.sales_advisor_limit},
        conversation_memory = ${data.conversation_memory},
        ai_learning_depth = ${data.ai_learning_depth},
        suggested_questions_enabled = ${data.suggested_questions_enabled},
        ticket_system_enabled = ${data.ticket_system_enabled},
        product_sync_enabled = ${data.product_sync_enabled},
        api_access_enabled = ${data.api_access_enabled},
        order_tracking_enabled = ${data.order_tracking_enabled},
        customer_return_detection_enabled = ${data.customer_return_detection_enabled},
        is_popular = ${data.is_popular},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${planId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating subscription plan:", error)
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 })
  }
}
