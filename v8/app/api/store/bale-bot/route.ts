import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { getBaleBotConfig, upsertBaleBotConfig, disableBaleBotConfig } from "@/lib/bale-bot-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ config: null })
    }

    const config = await getBaleBotConfig(store.id)
    return NextResponse.json({ config })
  } catch (error) {
    console.error("API Error fetching bale bot config:", error)
    return NextResponse.json({ error: "Failed to fetch bale bot config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "ابتدا باید فروشگاه بسازید" }, { status: 400 })
    }

    const body = await request.json()
    if (!body.bot_token || typeof body.bot_token !== "string" || body.bot_token.trim() === "") {
      return NextResponse.json({ error: "توکن ربات الزامی است" }, { status: 400 })
    }

    const extraEnv: Record<string, string> = {}
    if (Array.isArray(body.extra_env)) {
      for (const entry of body.extra_env) {
        if (entry?.key && typeof entry.key === "string") {
          extraEnv[entry.key.trim()] = String(entry.value ?? "")
        }
      }
    }

    const config = await upsertBaleBotConfig(store.id, {
      bot_token: body.bot_token.trim(),
      bot_username: body.bot_username || null,
      extra_env: extraEnv,
    })

    return NextResponse.json({ config })
  } catch (error) {
    console.error("API Error saving bale bot config:", error)
    return NextResponse.json({ error: "خطا در ذخیره تنظیمات ربات بله" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
    }

    await disableBaleBotConfig(store.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error disabling bale bot:", error)
    return NextResponse.json({ error: "خطا در غیرفعال‌سازی ربات" }, { status: 500 })
  }
}
