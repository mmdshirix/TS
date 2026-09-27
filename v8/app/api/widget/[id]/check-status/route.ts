import { type NextRequest, NextResponse } from "next/server"
import { getCachedChatbotStatus } from "@/lib/subscription-cache"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)

    if (Number.isNaN(chatbotId)) {
      return NextResponse.json({
        active: true,
        shouldFreeze: false,
      })
    }

    const status = await getCachedChatbotStatus(chatbotId)

    if (!status) {
      // Chatbot not found, but still allow widget to show
      return NextResponse.json({
        active: true,
        shouldFreeze: false,
      })
    }

    // System admin - always active
    if (status.isSystemAdmin) {
      return NextResponse.json({
        active: true,
        shouldFreeze: false,
        planName: "مدیر سیستم",
      })
    }

    return NextResponse.json({
      active: true, // Always show widget
      shouldFreeze: status.shouldFreeze,
      freezeMessage: status.freezeMessage,
      planName: status.planName,
    })
  } catch (error) {
    console.error("[API] Error checking chatbot status:", error)
    // On error, allow widget to work
    return NextResponse.json({
      active: true,
      shouldFreeze: false,
    })
  }
}
