import { NextResponse } from "next/server"
import { requireStore } from "@/lib/store-route"
import { askAI, extractJson, AIUnavailableError } from "@/lib/ai"
import { getStoreCategory } from "@/lib/store-categories"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Suggests site-wide meta title/description/keywords for the SEO tab.
export async function POST() {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const { store } = ctx
  const sql = getSql()
  const cats = (await sql`SELECT name FROM product_categories WHERE store_id = ${store.id} LIMIT 10`) as any[]
  const prods = (await sql`SELECT name FROM products WHERE store_id = ${store.id} AND status = 'active' LIMIT 15`) as any[]
  const category = getStoreCategory(store.category)

  const prompt = `تو متخصص سئوی فارسی هستی. برای این کسب‌وکار یک عنوان متا (۳۰ تا ۶۰ کاراکتر)، توضیحات متا (۱۰۰ تا ۱۵۵ کاراکتر) و ۶ تا ۱۰ کلمه کلیدی پرجستجو در ایران بنویس.
نام: ${store.name}
نوع: ${category?.label || store.category || "فروشگاه"}
توضیح: ${store.description || "-"}
دسته‌ها: ${cats.map((c) => c.name).join("، ") || "-"}
محصولات/خدمات: ${prods.map((p) => p.name).join("، ") || "-"}
فقط JSON: {"meta_title":"...","meta_description":"...","keywords":"کلمه۱، کلمه۲، ..."}`

  try {
    const text = await askAI(prompt, { temperature: 0.5, maxTokens: 400, timeoutMs: 20_000 })
    const meta = extractJson<{ meta_title: string; meta_description: string; keywords: string }>(text)
    if (!meta) return NextResponse.json({ error: "خطا در پردازش پاسخ" }, { status: 502 })
    return NextResponse.json({ meta })
  } catch (e) {
    if (e instanceof AIUnavailableError) return NextResponse.json({ error: "سرویس هوش مصنوعی پیکربندی نشده است" }, { status: 503 })
    return NextResponse.json({ error: "خطا در تولید پیشنهاد" }, { status: 500 })
  }
}
