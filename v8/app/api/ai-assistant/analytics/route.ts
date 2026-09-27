import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { getAnalyticsContext } from "@/lib/ai-assistant-data"
import { callDeepSeek, extractJson, DeepSeekUnavailableError } from "@/lib/deepseek"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface AnalyticsInsights {
  summary: string
  trend_analysis: string
  recommendations: string[]
}

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "ابتدا باید فروشگاه بسازید" }, { status: 400 })
    }

    const context = await getAnalyticsContext(store.id)

    const prompt = `تو یک تحلیل‌گر داده متخصص کسب‌وکارهای آنلاین ایرانی هستی. بر اساس آمار زیر برای فروشگاه «${store.name}»، یک تحلیل دقیق و حرفه‌ای ارائه بده:

- تعداد کل سفارش‌ها: ${context.totalOrders}
- سفارش‌های پرداخت‌شده: ${context.paidOrders}
- درآمد کل (پرداخت‌شده): ${context.totalRevenue} تومان
- سفارش‌های ۷ روز اخیر: ${context.last7DaysOrders}
- سفارش‌های ۷ روز قبل از آن: ${context.prev7DaysOrders}
- محصولات پرفروش: ${context.topProducts.map((p) => `${p.product_name} (${p.qty} عدد)`).join("، ") || "داده‌ای موجود نیست"}

فقط یک شیء JSON برگردان، بدون هیچ متن اضافه، با این ساختار دقیق:
{"summary": "خلاصه وضعیت فروش در ۲ تا ۳ جمله", "trend_analysis": "تحلیل روند رشد یا افت در ۲ تا ۳ جمله", "recommendations": ["پیشنهاد عملی ۱", "پیشنهاد عملی ۲", "پیشنهاد عملی ۳"]}`

    const text = await callDeepSeek(prompt, { temperature: 0.5, maxTokens: 1200 })
    const insights = extractJson<AnalyticsInsights>(text)

    if (!insights) {
      return NextResponse.json({ error: "خطا در پردازش پاسخ هوش مصنوعی" }, { status: 502 })
    }

    return NextResponse.json({ insights, context })
  } catch (error) {
    if (error instanceof DeepSeekUnavailableError) {
      return NextResponse.json({ error: "سرویس هوش مصنوعی در حال حاضر پیکربندی نشده است" }, { status: 503 })
    }
    console.error("API Error generating analytics insights:", error)
    return NextResponse.json({ error: "خطا در تولید تحلیل آماری" }, { status: 500 })
  }
}
