import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { syncUserSubscription, checkTalkSellStatus } from "@/lib/subscription-system"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.phone) {
      return NextResponse.json({ error: "شماره تلفن یافت نشد" }, { status: 400 })
    }

    console.log("[SyncEndpoint] Starting manual sync for user:", user.id, "Phone:", user.phone)

    // Check TalkSell status first
    const talkSellStatus = await checkTalkSellStatus(user.phone)
    console.log("[SyncEndpoint] TalkSell status:", JSON.stringify(talkSellStatus, null, 2))

    // Sync subscription
    const syncResult = await syncUserSubscription(user.id, user.phone)

    if (!syncResult) {
      return NextResponse.json(
        {
          success: false,
          message: "خطا در همگام‌سازی با TalkSell",
          talkSellResponse: talkSellStatus,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "اشتراک با موفقیت همگام‌سازی شد",
      subscription: {
        type: talkSellStatus.subscription_type,
        has_subscription: talkSellStatus.has_subscription,
        has_demo: talkSellStatus.has_demo,
        days_remaining: talkSellStatus.days_remaining,
      },
      talkSellResponse: talkSellStatus,
    })
  } catch (error: any) {
    console.error("[SyncEndpoint] Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "خطای سرور",
      },
      { status: 500 },
    )
  }
}
