import { randomBytes } from "crypto"
import { getSql } from "@/lib/db"
import { askAI, extractJson } from "@/lib/ai"
import { STORE_CATEGORIES, type StoreCategorySlug } from "@/lib/store-categories"

// "Just tell me what to build" intake — shared by the WordPress plugin API and the
// /start page on the platform. A visitor describes what they want, we detect the
// intent (category, name, features), ask a few follow-up questions in stages, and
// finally build the store for them once they sign in.

export interface IntakeQuestion {
  id: string
  label: string
  type: "text" | "choice" | "multi"
  options?: string[]
  placeholder?: string
  required?: boolean
}

export interface IntakeDetected {
  category: StoreCategorySlug
  categoryLabel: string
  storeName?: string | null
  description?: string | null
  features?: string[]
  audience?: string | null
  confidence?: number
  tone?: string
}

export interface IntakeRequest {
  id: number
  token: string
  prompt: string
  answers: Array<{ id: string; label: string; value: string }>
  detected: IntakeDetected
  questions: IntakeQuestion[]
  current_stage: number
  status: string
  user_id: number | null
  store_id: number | null
  source_site: string | null
  created_at: string
}

const KEYWORDS: Array<{ slug: StoreCategorySlug; words: RegExp }> = [
  { slug: "medical", words: /(مطب|کلینیک|پزشک|دکتر|نوبت|ویزیت|درمانگاه|دندان|روانشناس|مشاوره پزشکی|clinic|doctor|appointment)/i },
  { slug: "pharmacy", words: /(داروخانه|دارو|نسخه|مکمل|ویتامین|pharmacy|drug)/i },
  { slug: "cosmetics", words: /(آرایشی|بهداشتی|زیبایی|مراقبت پوست|رژ|کرم|سرم|لوازم آرایش|cosmetic|beauty|skincare)/i },
  { slug: "perfumes", words: /(عطر|ادکلن|رایحه|perfume|fragrance)/i },
  { slug: "accessories", words: /(اکسسوری|جواهر|زیورآلات|طلا|نقره|بدلیجات|گردنبند|دستبند|ساعت|jewel|accessor)/i },
  { slug: "bags-shoes", words: /(کیف|کفش|چرم|کتونی|بوت|صندل|shoe|bag|leather)/i },
  { slug: "mobile", words: /(موبایل|گوشی|لوازم جانبی|هندزفری|شارژر|قاب|تبلت|لپ‌تاپ|دیجیتال|phone|mobile|gadget)/i },
  { slug: "clothing", words: /(پوشاک|لباس|مانتو|تیشرت|شلوار|هودی|مزون|بوتیک|clothing|fashion|apparel)/i },
]

export function detectCategoryByRules(prompt: string): { slug: StoreCategorySlug; confidence: number } {
  for (const k of KEYWORDS) if (k.words.test(prompt)) return { slug: k.slug, confidence: 0.6 }
  return { slug: "clothing", confidence: 0.2 }
}

export function questionsFor(detected: IntakeDetected): IntakeQuestion[][] {
  const kind = detected.category === "medical" ? "clinic" : detected.category === "pharmacy" ? "pharmacy" : "shop"
  const stage1: IntakeQuestion[] = [
    { id: "name", label: kind === "clinic" ? "نام مطب یا کلینیک شما چیست؟" : kind === "pharmacy" ? "نام داروخانه شما چیست؟" : "نام فروشگاه یا برند شما چیست؟", type: "text", placeholder: "مثلاً: ...", required: true },
    { id: "audience", label: "مشتریان اصلی شما چه کسانی هستند؟", type: "choice", options: kind === "clinic" ? ["بیماران محلی", "بیماران سراسر کشور", "مراجعان اینستاگرام"] : ["خریداران اینستاگرام", "مشتریان محلی", "سراسر کشور", "عمده‌فروشی"] },
  ]
  const stage2: IntakeQuestion[] =
    kind === "clinic"
      ? [
          { id: "specialties", label: "چه تخصص‌هایی دارید؟", type: "multi", options: ["پزشک عمومی", "قلب و عروق", "پوست و مو", "کودکان", "زنان", "دندانپزشکی", "روانشناسی", "تغذیه"] },
          { id: "booking", label: "نوبت‌دهی آنلاین با پرداخت ویزیت می‌خواهید؟", type: "choice", options: ["بله، با پرداخت آنلاین", "بله، بدون پیش‌پرداخت", "فقط نمایش اطلاعات"] },
        ]
      : kind === "pharmacy"
        ? [
            { id: "services", label: "کدام خدمات را ارائه می‌دهید؟", type: "multi", options: ["نسخه آنلاین", "ارسال دارو", "شبانه‌روزی", "مشاوره داروساز", "مکمل و ویتامین", "محصولات آرایشی"] },
            { id: "insurance", label: "با کدام بیمه‌ها قرارداد دارید؟", type: "multi", options: ["تامین اجتماعی", "خدمات درمانی", "نیروهای مسلح", "بیمه تکمیلی", "آزاد"] },
          ]
        : [
            { id: "products", label: "چه محصولاتی می‌فروشید؟ (چند نمونه)", type: "text", placeholder: "مثلاً: مانتو، شال، شلوار…" },
            { id: "payment", label: "روش دریافت پول؟", type: "multi", options: ["درگاه زرین‌پال", "کارت به کارت", "بله‌پی"] },
          ]
  const stage3: IntakeQuestion[] = [
    { id: "instagram", label: "آیدی اینستاگرام (برای اتصال دایرکت هوشمند)", type: "text", placeholder: "@yourpage" },
    { id: "style", label: "حس و حال طراحی مورد نظر", type: "choice", options: ["مینیمال و مدرن", "لاکچری و تیره", "گرم و صمیمی", "شاد و رنگی", "حرفه‌ای و رسمی"] },
  ]
  return [stage1, stage2, stage3]
}

export async function detectIntent(prompt: string): Promise<IntakeDetected> {
  const rule = detectCategoryByRules(prompt)
  const cats = STORE_CATEGORIES.map((c) => `${c.slug} = ${c.label}`).join(" | ")
  try {
    const text = await askAI(
      `کاربر می‌خواهد یک سایت بسازد. متن او: «${prompt}»
از بین این قالب‌ها بهترین را انتخاب کن: ${cats}
اگر نام برند/فروشگاه در متن هست استخراج کن. ۳ تا ۵ ویژگی مهم که سایت باید داشته باشد را فهرست کن.
فقط JSON: {"category":"slug","storeName":"نام یا null","description":"توضیح یک‌خطی برای سایت","features":["..."],"audience":"مخاطب","confidence":0.0-1.0}`,
      { temperature: 0.2, maxTokens: 300, timeoutMs: 12_000 },
    )
    const parsed = extractJson<any>(text)
    const slug = STORE_CATEGORIES.some((c) => c.slug === parsed?.category) ? (parsed.category as StoreCategorySlug) : rule.slug
    const cat = STORE_CATEGORIES.find((c) => c.slug === slug)!
    return {
      category: slug,
      categoryLabel: cat.label,
      storeName: parsed?.storeName || null,
      description: parsed?.description || null,
      features: Array.isArray(parsed?.features) ? parsed.features.slice(0, 5).map(String) : [],
      audience: parsed?.audience || null,
      confidence: Number(parsed?.confidence) || rule.confidence,
    }
  } catch {
    const cat = STORE_CATEGORIES.find((c) => c.slug === rule.slug)!
    return { category: rule.slug, categoryLabel: cat.label, storeName: null, description: null, features: [], audience: null, confidence: rule.confidence }
  }
}

export async function verifyIntakeApiKey(key: string | null): Promise<{ id: number; site_url: string | null } | null> {
  if (!key) return null
  const sql = getSql()
  const r = await sql`SELECT id, site_url FROM intake_api_keys WHERE api_key = ${key} AND is_active = TRUE`
  if (!r.length) return null
  await sql`UPDATE intake_api_keys SET last_used_at = NOW() WHERE id = ${r[0].id}`
  return r[0] as any
}

export async function createIntake(data: { prompt: string; apiKeyId?: number | null; source?: string; sourceSite?: string | null; sourcePageUrl?: string | null; visitorId?: string | null; ip?: string | null }): Promise<IntakeRequest> {
  const sql = getSql()
  const detected = await detectIntent(data.prompt)
  const stages = questionsFor(detected)
  const token = randomBytes(24).toString("hex")
  const r = await sql`
    INSERT INTO intake_requests (token, api_key_id, source, source_site, source_page_url, prompt, detected, questions, current_stage, status, visitor_id, visitor_ip)
    VALUES (${token}, ${data.apiKeyId || null}, ${data.source || "wordpress"}, ${data.sourceSite || null}, ${data.sourcePageUrl || null}, ${data.prompt}, ${JSON.stringify(detected)}, ${JSON.stringify(stages)}, 0, 'answering', ${data.visitorId || null}, ${data.ip || null})
    RETURNING *
  `
  return normalize(r[0])
}

function normalize(row: any): IntakeRequest {
  return { ...row, answers: row.answers || [], detected: row.detected || {}, questions: row.questions || [] }
}

export async function getIntake(token: string): Promise<IntakeRequest | null> {
  const sql = getSql()
  const r = await sql`SELECT * FROM intake_requests WHERE token = ${token}`
  return r.length ? normalize(r[0]) : null
}

export async function answerIntake(token: string, answers: Record<string, string | string[]>): Promise<IntakeRequest | null> {
  const sql = getSql()
  const intake = await getIntake(token)
  if (!intake) return null
  const stages = intake.questions as unknown as IntakeQuestion[][]
  const stage = stages[intake.current_stage] || []
  const flat: IntakeRequest["answers"] = [...intake.answers]
  for (const q of stage) {
    const v = answers[q.id]
    if (v === undefined || v === "") continue
    const value = Array.isArray(v) ? v.join("، ") : String(v)
    const idx = flat.findIndex((a) => a.id === q.id)
    if (idx >= 0) flat[idx] = { id: q.id, label: q.label, value }
    else flat.push({ id: q.id, label: q.label, value })
  }
  const nextStage = intake.current_stage + 1
  const done = nextStage >= stages.length
  const detected = { ...intake.detected }
  const nameAns = flat.find((a) => a.id === "name")?.value
  if (nameAns) detected.storeName = nameAns
  const styleAns = flat.find((a) => a.id === "style")?.value
  if (styleAns) detected.tone = styleAns
  await sql`
    UPDATE intake_requests SET answers = ${JSON.stringify(flat)}, detected = ${JSON.stringify(detected)}, current_stage = ${nextStage}, status = ${done ? "ready" : "answering"}, updated_at = NOW()
    WHERE token = ${token}
  `
  return getIntake(token)
}

export async function claimIntake(token: string, userId: number): Promise<IntakeRequest | null> {
  const sql = getSql()
  await sql`UPDATE intake_requests SET user_id = ${userId}, status = CASE WHEN status = 'built' THEN status ELSE 'claimed' END, updated_at = NOW() WHERE token = ${token} AND (user_id IS NULL OR user_id = ${userId})`
  return getIntake(token)
}

export async function markIntakeBuilt(token: string, storeId: number): Promise<void> {
  const sql = getSql()
  await sql`UPDATE intake_requests SET store_id = ${storeId}, status = 'built', updated_at = NOW() WHERE token = ${token}`
}

export function platformStartUrl(token: string): string {
  const base = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://platform-talksell.ir").replace(/\/$/, "")
  return `${base}/start?intake=${token}`
}
