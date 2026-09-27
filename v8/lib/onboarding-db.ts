import { getSql } from "@/lib/db"

export interface OnboardingState {
  tour_completed: boolean
  completed_steps: string[]
  dismissed_checklist: boolean
  intent: Record<string, any> | null
}

export interface ChecklistItem {
  id: string
  title: string
  description: string
  href: string
  done: boolean
  /** which store kinds this applies to; undefined = all */
  kinds?: string[]
}

export async function getOnboarding(userId: number): Promise<OnboardingState> {
  const sql = getSql()
  const r = await sql`SELECT * FROM user_onboarding WHERE user_id = ${userId}`
  if (!r.length) return { tour_completed: false, completed_steps: [], dismissed_checklist: false, intent: null }
  const row = r[0] as any
  return { tour_completed: row.tour_completed, completed_steps: Array.isArray(row.completed_steps) ? row.completed_steps : [], dismissed_checklist: row.dismissed_checklist, intent: row.intent || null }
}

export async function updateOnboarding(userId: number, patch: Partial<OnboardingState>): Promise<OnboardingState> {
  const sql = getSql()
  const cur = await getOnboarding(userId)
  const merged = { ...cur, ...patch }
  await sql`
    INSERT INTO user_onboarding (user_id, tour_completed, tour_completed_at, completed_steps, dismissed_checklist, intent, updated_at)
    VALUES (${userId}, ${merged.tour_completed}, ${merged.tour_completed ? new Date() : null}, ${JSON.stringify(merged.completed_steps)}, ${merged.dismissed_checklist}, ${merged.intent ? JSON.stringify(merged.intent) : null}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      tour_completed = EXCLUDED.tour_completed,
      tour_completed_at = CASE WHEN EXCLUDED.tour_completed AND user_onboarding.tour_completed_at IS NULL THEN NOW() ELSE user_onboarding.tour_completed_at END,
      completed_steps = EXCLUDED.completed_steps, dismissed_checklist = EXCLUDED.dismissed_checklist,
      intent = COALESCE(EXCLUDED.intent, user_onboarding.intent), updated_at = NOW()
  `
  return getOnboarding(userId)
}

/** Live checklist derived from the user's actual data — nothing to "tick" manually. */
export async function buildChecklist(userId: number): Promise<{ items: ChecklistItem[]; storeKind: string | null; progress: number }> {
  const sql = getSql()
  const [store] = (await sql`SELECT s.*, (SELECT COUNT(*)::int FROM products p WHERE p.store_id = s.id AND p.status = 'active') AS product_count FROM stores s WHERE s.user_id = ${userId} ORDER BY created_at DESC LIMIT 1`) as any[]
  let kind: string | null = null
  let items: ChecklistItem[] = []

  if (!store) {
    items = [
      { id: "store", title: "فروشگاه یا سایت خود را بسازید", description: "در ۵ قدم ساده: نام، قالب، برندینگ، پرداخت و انتشار", href: "/dashboard/store/create", done: false },
      { id: "chatbot", title: "چت‌بات هوشمند را بشناسید", description: "با ساخت فروشگاه، چت‌بات اختصاصی خودکار ساخته می‌شود", href: "/dashboard/chatbots", done: false },
    ]
    return { items, storeKind: null, progress: 0 }
  }

  kind = store.template_id || (["medical"].includes(store.category) ? "clinic" : store.category === "pharmacy" ? "pharmacy" : "shop")
  const safe = async <T,>(q: () => Promise<T[]>): Promise<T | undefined> => {
    try {
      return (await q())[0]
    } catch {
      return undefined
    }
  }
  const payments = await safe<any>(() => sql`SELECT * FROM store_payment_settings WHERE store_id = ${store.id}` as any)
  const seo = await safe<any>(() => sql`SELECT meta_title, meta_description FROM store_seo_settings WHERE store_id = ${store.id}` as any)
  const kb = await safe<any>(() => sql`SELECT COUNT(*)::int AS c FROM chatbot_knowledge_base WHERE chatbot_id = ${store.chatbot_id || 0}` as any)
  const ig = await safe<any>(() => sql`SELECT status FROM instagram_accounts WHERE store_id = ${store.id}` as any)
  const doctors = kind === "clinic" ? await safe<any>(() => sql`SELECT COUNT(*)::int AS c FROM clinic_doctors WHERE store_id = ${store.id} AND is_active = TRUE` as any) : { c: 0 }
  const paymentReady = Boolean(payments && ((payments.zarinpal_enabled && payments.zarinpal_merchant_id) || (payments.balepay_enabled && payments.balepay_bot_token) || (payments.card_to_card_enabled && payments.card_number)))

  items = [
    { id: "branding", title: "لوگو و رنگ برند را تنظیم کنید", description: "لوگو، رنگ اصلی و شماره تماس در تنظیمات فروشگاه", href: "/dashboard/store/settings", done: Boolean(store.logo_url && store.contact_phone) },
    kind === "clinic"
      ? { id: "doctors", title: "پزشکان و برنامه هفتگی را ثبت کنید", description: "بدون برنامه هفتگی، نوبتی برای رزرو نمایش داده نمی‌شود", href: "/dashboard/store/clinic", done: Number(doctors?.c || 0) > 0 }
      : { id: "products", title: kind === "pharmacy" ? "محصولات داروخانه را اضافه کنید" : "اولین محصولات را اضافه کنید", description: "حداقل ۴ محصول با تصویر و توضیحات", href: "/dashboard/store/products", done: Number(store.product_count || 0) >= 4 },
    { id: "payments", title: "درگاه پرداخت را فعال کنید", description: kind === "clinic" ? "برای دریافت هزینه ویزیت آنلاین" : "زرین‌پال، بله‌پی یا کارت به کارت", href: "/dashboard/store/payments", done: paymentReady },
    { id: "knowledge", title: "پایگاه دانش چت‌بات را کامل کنید", description: "سوالات متداول، ساعات کاری و شرایط ارسال را به هوش مصنوعی بدهید", href: "/dashboard/knowledge-base", done: Number(kb?.c || 0) > 2 },
    { id: "seo", title: "تنظیمات سئو را انجام دهید", description: "عنوان و توضیحات متا برای دیده شدن در گوگل", href: "/dashboard/store/seo", done: Boolean(seo?.meta_title && seo?.meta_description) },
    { id: "publish", title: "سایت را منتشر کنید", description: "پیش‌نمایش را ببینید و روی «انتشار» بزنید", href: "/dashboard/store/publish", done: store.status === "published" },
    { id: "instagram", title: "اینستاگرام را وصل کنید", description: "پاسخ خودکار به دایرکت‌ها با هوش مصنوعی و ورک‌فلوهای کلیدواژه‌ای", href: "/dashboard/instagram", done: ig?.status === "connected" },
  ]
  const done = items.filter((i) => i.done).length
  return { items, storeKind: kind, progress: Math.round((done / items.length) * 100) }
}
