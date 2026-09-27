import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { getCrmContext } from "@/lib/ai-assistant-data"
import { callDeepSeek, extractJson, DeepSeekUnavailableError } from "@/lib/deepseek"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface CrmInsights {
  segments: Array<{ name: string; description: string; customer_phones: string[] }>
  retention_strategies: string[]
  personalization_ideas: string[]
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

    const customers = await getCrmContext(store.id)
    if (customers.length === 0) {
      return NextResponse.json({ error: "هنوز مشتری‌ای برای این فروشگاه ثبت نشده است" }, { status: 400 })
    }

    const prompt = `تو یک متخصص CRM برای فروشگاه‌های آنلاین ایرانی هستی. بر اساس داده مشتریان زیر برای فروشگاه «${store.name}»، مشتریان را بخش‌بندی کن و راهکار حفظ مشتری و شخصی‌سازی پیشنهاد بده.

مشتریان (شماره تلفن | تعداد سفارش | مجموع خرید | آخرین سفارش):
${customers.map((c) => `${c.phone} | ${c.orderCount} سفارش | ${c.totalSpent} تومان | ${c.lastOrderAt}`).join("\n")}

فقط یک شیء JSON برگردان، بدون هیچ متن اضافه، با این ساختار دقیق:
{"segments": [{"name": "نام بخش مثل مشتریان وفادار", "description": "توضیح کوتاه", "customer_phones": ["09..."]}], "retention_strategies": ["راهکار ۱", "راهکار ۲", "راهکار ۳"], "personalization_ideas": ["ایده ۱", "ایده ۲"]}`

    const text = await callDeepSeek(prompt, { temperature: 0.5, maxTokens: 1500 })
    const insights = extractJson<CrmInsights>(text)

    if (!insights) {
      return NextResponse.json({ error: "خطا در پردازش پاسخ هوش مصنوعی" }, { status: 502 })
    }

    return NextResponse.json({ insights, customerCount: customers.length })
  } catch (error) {
    if (error instanceof DeepSeekUnavailableError) {
      return NextResponse.json({ error: "سرویس هوش مصنوعی در حال حاضر پیکربندی نشده است" }, { status: 503 })
    }
    console.error("API Error generating CRM insights:", error)
    return NextResponse.json({ error: "خطا در تولید تحلیل مشتریان" }, { status: 500 })
  }
}
