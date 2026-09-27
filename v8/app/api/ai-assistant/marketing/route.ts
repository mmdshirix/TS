import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { getMarketingContext } from "@/lib/ai-assistant-data"
import { createDiscountCode, listDiscountCodes } from "@/lib/discounts-db"
import { callDeepSeek, extractJson, DeepSeekUnavailableError } from "@/lib/deepseek"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface MarketingPlan {
  code: string
  campaign_title: string
  promotional_message: string
  target_audience: string
  channel_suggestions: string[]
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ codes: [] })
    }
    const codes = await listDiscountCodes(store.id)
    return NextResponse.json({ codes })
  } catch (error) {
    console.error("API Error listing discount codes:", error)
    return NextResponse.json({ error: "Failed to fetch discount codes" }, { status: 500 })
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
    const percentage = Math.round(Number(body.percentage))
    const goal = typeof body.goal === "string" ? body.goal.trim() : ""

    if (!percentage || percentage <= 0 || percentage > 100) {
      return NextResponse.json({ error: "درصد تخفیف باید بین ۱ تا ۱۰۰ باشد" }, { status: 400 })
    }

    const context = await getMarketingContext(store.id)

    const prompt = `تو یک متخصص بازاریابی دیجیتال برای کسب‌وکارهای اینستاگرامی ایرانی هستی. برای فروشگاه «${context.storeName}» (دسته‌بندی: ${context.storeCategory || "نامشخص"}، تعداد محصولات: ${context.productCount}) یک کمپین تخفیف ${percentage} درصدی طراحی کن.

هدف کمپین (اگر مشخص شده): ${goal || "افزایش فروش عمومی"}
محصولات پرفروش: ${context.topProducts.map((p) => p.product_name).join("، ") || "داده‌ای موجود نیست"}

فقط یک شیء JSON برگردان، بدون هیچ متن اضافه، با این ساختار دقیق:
{"code": "یک کد تخفیف کوتاه انگلیسی حداکثر ۱۰ کاراکتر بدون فاصله مثل SUMMER30", "campaign_title": "عنوان کمپین", "promotional_message": "متن تبلیغاتی جذاب برای اینستاگرام حداکثر ۴۰۰ کاراکتر", "target_audience": "مخاطب هدف", "channel_suggestions": ["پیشنهاد کانال ۱", "پیشنهاد کانال ۲"]}`

    const text = await callDeepSeek(prompt, { temperature: 0.85, maxTokens: 900 })
    const plan = extractJson<MarketingPlan>(text)

    if (!plan || !plan.code) {
      return NextResponse.json({ error: "خطا در پردازش پاسخ هوش مصنوعی" }, { status: 502 })
    }

    const savedCode = await createDiscountCode({
      store_id: store.id,
      code: plan.code,
      percentage,
      description: plan.campaign_title,
    })

    return NextResponse.json({ plan, discountCode: savedCode })
  } catch (error) {
    if (error instanceof DeepSeekUnavailableError) {
      return NextResponse.json({ error: "سرویس هوش مصنوعی در حال حاضر پیکربندی نشده است" }, { status: 503 })
    }
    console.error("API Error generating marketing plan:", error)
    return NextResponse.json({ error: "خطا در تولید کمپین بازاریابی" }, { status: 500 })
  }
}
