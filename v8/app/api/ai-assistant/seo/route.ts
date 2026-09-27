import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { getSeoContext } from "@/lib/ai-assistant-data"
import { callDeepSeek, extractJson, DeepSeekUnavailableError } from "@/lib/deepseek"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface SeoSuggestion {
  product_id: number
  product_name: string
  meta_title: string
  meta_description: string
  keywords: string[]
  description_improvement: string
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

    const products = await getSeoContext(store.id)
    if (products.length === 0) {
      return NextResponse.json({ error: "ابتدا محصولی به فروشگاه اضافه کنید" }, { status: 400 })
    }

    const prompt = `تو یک متخصص سئوی فروشگاه‌های آنلاین ایرانی هستی. برای هر یک از محصولات زیر، متا تایتل، متا دیسکریپشن، ۳ تا ۵ کلمه کلیدی مرتبط، و یک پیشنهاد کوتاه برای بهبود توضیحات محصول ارائه بده.

فروشگاه: ${store.name} (دسته‌بندی: ${store.category || "نامشخص"})

محصولات:
${products.map((p) => `- شناسه ${p.id}: ${p.name} | قیمت: ${p.price} تومان | دسته: ${p.category || "-"} | توضیحات فعلی: ${p.description ? p.description.slice(0, 200) : "(بدون توضیحات)"}`).join("\n")}

فقط یک آرایه JSON برگردان، بدون هیچ متن اضافه، با این ساختار دقیق برای هر محصول:
[{"product_id": شناسه_عددی, "product_name": "نام", "meta_title": "...", "meta_description": "...", "keywords": ["...", "..."], "description_improvement": "..."}]`

    const text = await callDeepSeek(prompt, { temperature: 0.6, maxTokens: 2500 })
    const suggestions = extractJson<SeoSuggestion[]>(text)

    if (!suggestions) {
      return NextResponse.json({ error: "خطا در پردازش پاسخ هوش مصنوعی" }, { status: 502 })
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    if (error instanceof DeepSeekUnavailableError) {
      return NextResponse.json({ error: "سرویس هوش مصنوعی در حال حاضر پیکربندی نشده است" }, { status: 503 })
    }
    console.error("API Error generating SEO suggestions:", error)
    return NextResponse.json({ error: "خطا در تولید پیشنهادهای سئو" }, { status: 500 })
  }
}
