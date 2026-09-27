import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getIntake, claimIntake, markIntakeBuilt } from "@/lib/intake"
import { createStore, getStoreByUserId, updateStore, createCategory, createProduct } from "@/lib/store-db"
import { upsertClinicSettings } from "@/lib/clinic-db"
import { upsertPharmacySettings } from "@/lib/pharmacy-db"
import { upsertStoreSeoSettings } from "@/lib/seo-db"
import { updateOnboarding } from "@/lib/onboarding-db"
import { getThemePreset } from "@/lib/theme-presets"
import { checkUserLimit } from "@/lib/subscription-system"
import { askAI, extractJson } from "@/lib/ai"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 60

const STYLE_SCHEMES: Record<string, { primary: string; secondary: string; surface: string }> = {
  "لاکچری و تیره": { primary: "#111827", secondary: "#c9a227", surface: "#0f0f12" },
  "گرم و صمیمی": { primary: "#b45309", secondary: "#f59e0b", surface: "#fffbeb" },
  "شاد و رنگی": { primary: "#db2777", secondary: "#f97316", surface: "#fff1f2" },
  "حرفه‌ای و رسمی": { primary: "#1e3a8a", secondary: "#0ea5e9", surface: "#f8fafc" },
}

/**
 * Turns a completed intake into a real store for the signed-in user:
 * creates the store with the detected template, applies answers (name, style,
 * specialties, services, insurance), seeds AI-suggested products/categories and SEO,
 * and records the intent for the onboarding checklist.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const token = String(body.token || "")
  const intake = await getIntake(token)
  if (!intake) return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 })
  if (intake.user_id && intake.user_id !== user.id) return NextResponse.json({ error: "این درخواست به حساب دیگری تعلق دارد" }, { status: 403 })
  await claimIntake(token, user.id)

  const existing = await getStoreByUserId(user.id)
  if (existing) {
    await markIntakeBuilt(token, existing.id)
    return NextResponse.json({ storeId: existing.id, alreadyHadStore: true, redirect: "/dashboard" })
  }

  const limit = await checkUserLimit(user.id, "stores")
  if (!limit.allowed) return NextResponse.json({ error: limit.message || "به حداکثر تعداد فروشگاه مجاز رسیده‌اید" }, { status: 403 })

  const ans = (id: string) => intake.answers.find((a) => a.id === id)?.value || ""
  const name = (intake.detected.storeName || ans("name") || intake.prompt.slice(0, 40)).trim()
  const category = intake.detected.category
  const description = intake.detected.description || intake.prompt.slice(0, 200)

  const store = await createStore({ user_id: user.id, name, description, category })

  // Style
  const preset = getThemePreset(category)
  const scheme = STYLE_SCHEMES[ans("style")]
  const instagram = ans("instagram").replace(/^@/, "")
  await updateStore(store.id, {
    color_scheme: scheme ? { ...scheme, radius: preset?.radius || "1rem" } : preset ? { primary: preset.primary, secondary: preset.secondary, surface: preset.surface, radius: preset.radius } : {},
    social_links: instagram ? { instagram } : {},
  } as any)

  // Template-specific answers
  if (category === "medical") {
    const booking = ans("booking")
    await upsertClinicSettings(store.id, { booking_enabled: booking !== "فقط نمایش اطلاعات", fee_required: booking === "بله، با پرداخت آنلاین" })
  }
  if (category === "pharmacy") {
    const services = ans("services")
    const insurance = ans("insurance")
    await upsertPharmacySettings(store.id, {
      is_24h: services.includes("شبانه‌روزی"),
      delivery_enabled: services.includes("ارسال دارو"),
      accepts_prescriptions: services.includes("نسخه آنلاین") || services === "",
      insurance_types: insurance ? insurance.split("، ").filter(Boolean) : undefined,
    })
  }

  // AI-suggested catalogue for shops (categories + a few products) based on the user's own words
  if (category !== "medical") {
    const productHint = ans("products") || intake.prompt
    try {
      const text = await askAI(
        `برای یک ${intake.detected.categoryLabel} به نام «${name}» که این محصولات را دارد: «${productHint}»، ۴ دسته‌بندی و ۶ محصول نمونه واقع‌گرایانه با قیمت تومان پیشنهاد بده.
فقط JSON: {"categories":["..."],"products":[{"name":"...","price":120000,"description":"یک جمله"}]}`,
        { temperature: 0.6, maxTokens: 600, timeoutMs: 15_000 },
      )
      const parsed = extractJson<{ categories: string[]; products: Array<{ name: string; price: number; description: string }> }>(text)
      if (parsed) {
        const catIds: number[] = []
        for (const c of (parsed.categories || []).slice(0, 4)) {
          try {
            const cat = await createCategory({ store_id: store.id, name: String(c) })
            catIds.push(cat.id)
          } catch {
            /* duplicate slug etc. */
          }
        }
        for (const [i, p] of (parsed.products || []).slice(0, 6).entries()) {
          try {
            await createProduct({ store_id: store.id, name: String(p.name), price: Number(p.price) || 100000, description: p.description ? String(p.description) : undefined, status: "draft", category_id: catIds[i % Math.max(1, catIds.length)] })
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      console.error("[intake/build] catalogue suggestion failed", e)
    }
  }

  // SEO defaults from the intake
  try {
    await upsertStoreSeoSettings(store.id, {
      meta_title: `${name} | ${intake.detected.categoryLabel}`,
      meta_description: description.slice(0, 155),
      keywords: [name, intake.detected.categoryLabel, ...(intake.detected.features || [])].join("، "),
    })
  } catch {
    /* ignore */
  }

  await updateOnboarding(user.id, { intent: { prompt: intake.prompt, detected: intake.detected, answers: intake.answers, source: intake.source_site } })
  await markIntakeBuilt(token, store.id)

  return NextResponse.json({ storeId: store.id, slug: store.slug, redirect: "/dashboard?built=1" })
}
