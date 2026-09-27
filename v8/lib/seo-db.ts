import { getSql } from "@/lib/db"

export interface StoreSeoSettings {
  store_id: number
  meta_title: string | null
  meta_description: string | null
  keywords: string | null
  og_image_url: string | null
  canonical_domain: string | null
  robots_index: boolean
  robots_follow: boolean
  google_site_verification: string | null
  google_analytics_id: string | null
  twitter_handle: string | null
  structured_data_enabled: boolean
  sitemap_enabled: boolean
  business_type: string | null
  locale: string
  page_overrides: Record<string, { title?: string; description?: string }>
  head_scripts: string | null
}

export { SEO_PAGE_KEYS } from "@/lib/shared/seo-constants"

export async function getStoreSeoSettings(storeId: number): Promise<StoreSeoSettings> {
  const sql = getSql()
  const r = await sql`SELECT * FROM store_seo_settings WHERE store_id = ${storeId}`
  const defaults: StoreSeoSettings = {
    store_id: storeId,
    meta_title: null,
    meta_description: null,
    keywords: null,
    og_image_url: null,
    canonical_domain: null,
    robots_index: true,
    robots_follow: true,
    google_site_verification: null,
    google_analytics_id: null,
    twitter_handle: null,
    structured_data_enabled: true,
    sitemap_enabled: true,
    business_type: null,
    locale: "fa_IR",
    page_overrides: {},
    head_scripts: null,
  }
  if (!r.length) return defaults
  const row = r[0] as any
  return { ...defaults, ...row, page_overrides: row.page_overrides || {} }
}

export async function upsertStoreSeoSettings(storeId: number, data: Partial<StoreSeoSettings>): Promise<StoreSeoSettings> {
  const sql = getSql()
  const m = { ...(await getStoreSeoSettings(storeId)), ...data }
  await sql`
    INSERT INTO store_seo_settings (store_id, meta_title, meta_description, keywords, og_image_url, canonical_domain, robots_index, robots_follow, google_site_verification, google_analytics_id, twitter_handle, structured_data_enabled, sitemap_enabled, business_type, locale, page_overrides, head_scripts, updated_at)
    VALUES (${storeId}, ${m.meta_title}, ${m.meta_description}, ${m.keywords}, ${m.og_image_url}, ${m.canonical_domain}, ${m.robots_index}, ${m.robots_follow}, ${m.google_site_verification}, ${m.google_analytics_id}, ${m.twitter_handle}, ${m.structured_data_enabled}, ${m.sitemap_enabled}, ${m.business_type}, ${m.locale || "fa_IR"}, ${JSON.stringify(m.page_overrides || {})}, ${m.head_scripts}, NOW())
    ON CONFLICT (store_id) DO UPDATE SET
      meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description, keywords = EXCLUDED.keywords, og_image_url = EXCLUDED.og_image_url,
      canonical_domain = EXCLUDED.canonical_domain, robots_index = EXCLUDED.robots_index, robots_follow = EXCLUDED.robots_follow,
      google_site_verification = EXCLUDED.google_site_verification, google_analytics_id = EXCLUDED.google_analytics_id, twitter_handle = EXCLUDED.twitter_handle,
      structured_data_enabled = EXCLUDED.structured_data_enabled, sitemap_enabled = EXCLUDED.sitemap_enabled, business_type = EXCLUDED.business_type,
      locale = EXCLUDED.locale, page_overrides = EXCLUDED.page_overrides, head_scripts = EXCLUDED.head_scripts, updated_at = NOW()
  `
  return getStoreSeoSettings(storeId)
}

/** Simple on-page SEO audit used by the dashboard's score card. */
export async function auditStoreSeo(storeId: number): Promise<{ score: number; checks: Array<{ id: string; label: string; ok: boolean; hint: string }> }> {
  const sql = getSql()
  const [store] = (await sql`SELECT * FROM stores WHERE id = ${storeId}`) as any[]
  const seo = await getStoreSeoSettings(storeId)
  const [prod] = (await sql`
    SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE description IS NULL OR length(description) < 60)::int AS thin,
      COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id))::int AS no_image
    FROM products p WHERE store_id = ${storeId} AND status = 'active'
  `) as any[]

  const title = seo.meta_title || store?.name || ""
  const desc = seo.meta_description || store?.description || ""
  const checks = [
    { id: "title", label: "عنوان متا (۳۰ تا ۶۰ کاراکتر)", ok: title.length >= 30 && title.length <= 60, hint: "عنوان کوتاه و گویا با کلمه کلیدی اصلی بنویسید." },
    { id: "desc", label: "توضیحات متا (۷۰ تا ۱۶۰ کاراکتر)", ok: desc.length >= 70 && desc.length <= 160, hint: "یک توضیح جذاب که کاربر را به کلیک ترغیب کند." },
    { id: "keywords", label: "کلمات کلیدی تعریف شده", ok: Boolean(seo.keywords && seo.keywords.split(/[,،]/).length >= 3), hint: "حداقل ۳ کلمه کلیدی مرتبط با کسب‌وکار اضافه کنید." },
    { id: "og", label: "تصویر اشتراک‌گذاری (Open Graph)", ok: Boolean(seo.og_image_url || store?.logo_url), hint: "یک تصویر ۱۲۰۰×۶۳۰ برای نمایش در شبکه‌های اجتماعی تنظیم کنید." },
    { id: "logo", label: "لوگو و فاوآیکون", ok: Boolean(store?.logo_url), hint: "لوگو را در تنظیمات فروشگاه بارگذاری کنید." },
    { id: "index", label: "ایندکس شدن در گوگل فعال است", ok: seo.robots_index, hint: "اگر سایت آماده است، اجازه ایندکس را فعال کنید." },
    { id: "sitemap", label: "نقشه سایت (sitemap.xml)", ok: seo.sitemap_enabled, hint: "نقشه سایت به گوگل کمک می‌کند همه صفحات را پیدا کند." },
    { id: "schema", label: "داده ساختاریافته (Schema.org)", ok: seo.structured_data_enabled, hint: "برای نمایش ریچ‌اسنیپت محصول و کسب‌وکار فعال نگه دارید." },
    { id: "gsc", label: "تایید Google Search Console", ok: Boolean(seo.google_site_verification), hint: "کد تایید سرچ‌کنسول را وارد کنید تا آمار جستجو را ببینید." },
    { id: "thin", label: "توضیحات محصولات کافی است", ok: Number(prod?.total || 0) === 0 || Number(prod?.thin || 0) === 0, hint: `${prod?.thin || 0} محصول توضیحات کوتاه دارند؛ از دستیار سئو برای بهبود استفاده کنید.` },
    { id: "images", label: "همه محصولات تصویر دارند", ok: Number(prod?.no_image || 0) === 0, hint: `${prod?.no_image || 0} محصول بدون تصویر هستند.` },
    { id: "contact", label: "اطلاعات تماس و آدرس ثبت شده", ok: Boolean(store?.contact_phone), hint: "شماره تماس و آدرس برای سئوی محلی مهم است." },
  ]
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)
  return { score, checks }
}
