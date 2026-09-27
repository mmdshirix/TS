import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { listProductsWithImages } from "@/lib/db"
import { getPharmacySettings } from "@/lib/pharmacy-db"
import { ask, extractJson } from "@/lib/ai"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) return NextResponse.json({ error: "داروخانه یافت نشد" }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const question = String(body.question || "").trim().slice(0, 600)
  if (question.length < 3) return NextResponse.json({ error: "سوال را کامل‌تر بنویسید" }, { status: 400 })

  const settings = await getPharmacySettings(store.id)
  if (!settings.ai_advisor_enabled) return NextResponse.json({ error: "داروساز هوشمند فعال نیست" }, { status: 400 })

  const products = await listProductsWithImages(store.id, { limit: 48 })
  const catalog = products.map((p) => `#${p.id} ${p.name}${p.description ? ` — ${p.description.slice(0, 80)}` : ""}`).join("\n")

  const system = `تو داروساز هوشمند داروخانه "${store.name}" هستی${settings.pharmacist_name ? ` و زیر نظر داروساز مسئول ${settings.pharmacist_name} کار می‌کنی` : ""}.
قوانین سخت:
- هیچ دوز دقیق تجویز نکن؛ فقط اطلاعات عمومی و هشدارهای ایمنی.
- برای بارداری، شیردهی، کودکان زیر ۲ سال، بیماری‌های زمینه‌ای و تداخل دارویی caution_level را "see_pharmacist" یا "see_doctor" بگذار.
- اگر علائم جدی است (درد قفسه سینه، تنگی نفس، خونریزی، تب بالای ۳۹ در کودک) "see_doctor".
- فقط از محصولات فهرست زیر پیشنهاد بده (با شناسه عددی)؛ اگر مرتبط نیست لیست خالی برگردان.
- فارسی روان، ۳ تا ۶ جمله.
محصولات موجود:
${catalog || "(بدون محصول)"}

فقط JSON برگردان:
{"answer":"متن پاسخ","caution_level":"info|caution|see_pharmacist|see_doctor","suggested_product_ids":[شناسه‌ها],"tips":["۱ تا ۳ نکته کوتاه"]}`

  try {
    const text = await ask([{ role: "system", content: system }, { role: "user", content: question }], { temperature: 0.3, maxTokens: 550, timeoutMs: 18_000 })
    const parsed = extractJson<any>(text)
    if (!parsed) throw new Error("bad json")
    const ids: number[] = Array.isArray(parsed.suggested_product_ids) ? parsed.suggested_product_ids.map(Number) : []
    const suggested = products.filter((p) => ids.includes(p.id)).slice(0, 4).map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: Number(p.price), image_url: p.image_url }))
    return NextResponse.json({
      result: {
        answer: String(parsed.answer || ""),
        caution_level: ["info", "caution", "see_pharmacist", "see_doctor"].includes(parsed.caution_level) ? parsed.caution_level : "caution",
        suggested_products: suggested,
        tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3).map(String) : [],
      },
    })
  } catch (e) {
    console.error("[advisor]", e)
    const words = question.split(/\s+/).filter((w) => w.length > 2)
    const suggested = products
      .filter((p) => words.some((w) => p.name.includes(w)))
      .slice(0, 4)
      .map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: Number(p.price), image_url: p.image_url }))
    return NextResponse.json({
      result: {
        answer: "در حال حاضر داروساز هوشمند در دسترس نیست. برای پاسخ دقیق با داروساز داروخانه تماس بگیرید یا نسخه خود را ارسال کنید.",
        caution_level: "see_pharmacist",
        suggested_products: suggested,
        tips: ["داروها را دور از دسترس کودکان نگه دارید", "قبل از مصرف هر دارو بروشور را بخوانید"],
      },
    })
  }
}
