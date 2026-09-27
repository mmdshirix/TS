import { type NextRequest, NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"
import { verifySuperAdmin } from "@/lib/super-admin"

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const sql = getSharedSql()
    const isAdmin = await verifySuperAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const { planId } = await request.json()
    const userId = Number.parseInt(params.userId)

    if (isNaN(userId) || isNaN(planId)) {
      return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 })
    }

    // Get plan details
    const [plan] = await sql`
      SELECT * FROM subscription_plans WHERE id = ${planId} AND is_active = true
    `

    if (!plan) {
      return NextResponse.json({ error: "پلن یافت نشد" }, { status: 404 })
    }

    // Check if user has an active subscription
    const [existingSubscription] = await sql`
      SELECT * FROM user_subscriptions 
      WHERE user_id = ${userId} AND is_active = true
    `

    const now = new Date()
    const expiresAt = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000)

    if (existingSubscription) {
      // Update existing subscription
      await sql`
        UPDATE user_subscriptions
        SET 
          plan_id = ${planId},
          started_at = ${now.toISOString()},
          expires_at = ${expiresAt.toISOString()},
          message_count = 0
        WHERE id = ${existingSubscription.id}
      `
    } else {
      // Create new subscription
      await sql`
        INSERT INTO user_subscriptions (user_id, plan_id, started_at, expires_at, is_active, message_count)
        VALUES (${userId}, ${planId}, ${now.toISOString()}, ${expiresAt.toISOString()}, true, 0)
      `
    }

    // Update user subscription status
    await sql`
      UPDATE users
      SET 
        subscription_status = 'active',
        trial_end_date = ${expiresAt.toISOString()},
        is_trial_active = true
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing user subscription:", error)
    return NextResponse.json({ error: "خطا در تغییر اشتراک کاربر" }, { status: 500 })
  }
}
