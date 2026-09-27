import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { getUserSubscriptionStatus, syncUserSubscription, PLAN_LIMITS } from "@/lib/subscription-system"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Sync with TalkSell first
    if (user.phone) {
      try {
        await syncUserSubscription(user.id, user.phone)
      } catch (syncError) {
        console.error("[SubscriptionStatus] Sync error:", syncError)
        // Continue even if sync fails
      }
    }

    // Get full subscription status
    const status = await getUserSubscriptionStatus(user.id)

    if (!status) {
      // Return default demo status if we can't get real status
      const demoLimits = PLAN_LIMITS.demo
      return NextResponse.json({
        userId: user.id,
        planName: "دمو",
        planNameEn: "demo",
        isDemo: true,
        isActive: true,
        isExpired: false,
        daysRemaining: 7,
        expiryDate: null,
        limits: demoLimits,
        usage: {
          ai_tokens: { used: 0, limit: demoLimits.ai_tokens, percentage: 0, remaining: demoLimits.ai_tokens },
          messages: { used: 0, limit: 200, percentage: 0, remaining: 200 },
          products: { used: 0, limit: demoLimits.product_inputs, percentage: 0, remaining: demoLimits.product_inputs },
          sales_advisor: {
            used: 0,
            limit: demoLimits.sales_advisor_limit,
            percentage: 0,
            remaining: demoLimits.sales_advisor_limit,
          },
          cta_links: { used: 0, limit: demoLimits.cta_limit, percentage: 0, remaining: demoLimits.cta_limit },
          tickets: { used: 0, limit: 50, percentage: 0, remaining: 50 },
        },
        shouldFreeze: false,
        freezeReason: null,
      })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error getting subscription status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
