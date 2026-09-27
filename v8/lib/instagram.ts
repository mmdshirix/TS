import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"
import { getSql, getChatbotById, getChatbotFAQs, getChatbotKnowledgeBase } from "@/lib/db"
import { chatCompletion, getToneInstructions, type AIMessage } from "@/lib/ai"

// ---------------------------------------------------------------------------
// Instagram DM automation: OAuth connect, webhook ingestion, keyword workflows
// (text / image / card / voice), and an AI agent fallback that answers from the
// store's chatbot knowledge base + live catalogue.
// ---------------------------------------------------------------------------

export const GRAPH_VERSION = "v21.0"
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`

export const IG_SCOPES = [
  "instagram_basic",
  "instagram_manage_messages",
  "pages_show_list",
  "pages_manage_metadata",
  "pages_messaging",
  "business_management",
].join(",")

export interface InstagramAccount {
  id: number
  store_id: number
  user_id: number
  page_name: string
  ig_username: string | null
  ig_user_id: string | null
  fb_page_id: string | null
  access_token: string | null
  token_expires_at: string | null
  status: "pending" | "connected" | "error" | "disconnected"
  status_message: string | null
  ai_enabled: boolean
  ai_tone: string | null
  ai_handoff_keywords: string | null
  greeting_message: string | null
  away_message: string | null
  daily_message_count: number
  total_message_count: number
  connected_at: string | null
}

export type StepType = "text" | "image" | "card" | "voice" | "delay" | "handoff" | "ai"

export interface WorkflowStep {
  type: StepType
  /** text */
  text?: string
  /** image / voice */
  url?: string
  /** card */
  title?: string
  subtitle?: string
  image_url?: string
  buttons?: Array<{ title: string; url?: string; payload?: string }>
  /** card from a store product */
  product_id?: number | null
  /** delay (seconds) */
  seconds?: number
  /** ai: extra instruction */
  instruction?: string
}

export interface DmWorkflow {
  id: number
  store_id: number
  name: string
  trigger_type: "keyword" | "welcome" | "fallback" | "story_reply"
  keywords: string[]
  match_mode: "contains" | "exact" | "starts_with" | "regex"
  steps: WorkflowStep[]
  enabled: boolean
  priority: number
  hits: number
}

// ---------------------------------------------------------------------------
// Token encryption
// ---------------------------------------------------------------------------

function key(): Buffer {
  const secret = process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY || process.env.SUPER_ADMIN_PASSWORD || "taxel-default-key"
  return createHash("sha256").update(secret).digest()
}

export function encryptToken(token: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key(), iv)
  const enc = Buffer.concat([cipher.update(token, "utf8"), cipher.final()])
  return `enc:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${enc.toString("base64")}`
}

export function decryptToken(stored: string | null): string | null {
  if (!stored) return null
  if (!stored.startsWith("enc:")) return stored
  try {
    const [, iv, tag, data] = stored.split(":")
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"))
    decipher.setAuthTag(Buffer.from(tag, "base64"))
    return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8")
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export function metaConfig() {
  const appId = process.env.META_APP_ID || ""
  const appSecret = process.env.META_APP_SECRET || ""
  const base = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "")
  return {
    appId,
    appSecret,
    configured: Boolean(appId && appSecret && base),
    redirectUri: `${base}/api/instagram/callback`,
    webhookUrl: `${base}/api/instagram/webhook`,
    verifyToken: process.env.INSTAGRAM_VERIFY_TOKEN || "taxel-instagram-verify",
  }
}

export function oauthUrl(state: string): string {
  const c = metaConfig()
  const p = new URLSearchParams({ client_id: c.appId, redirect_uri: c.redirectUri, state, scope: IG_SCOPES, response_type: "code" })
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${p}`
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export async function getAccountByStore(storeId: number): Promise<InstagramAccount | null> {
  const sql = getSql()
  const r = await sql`SELECT * FROM instagram_accounts WHERE store_id = ${storeId}`
  return (r[0] as any) || null
}

export async function getAccountByIgUserId(igUserId: string): Promise<InstagramAccount | null> {
  const sql = getSql()
  const r = await sql`SELECT * FROM instagram_accounts WHERE ig_user_id = ${igUserId} AND status = 'connected'`
  return (r[0] as any) || null
}

export async function upsertPendingAccount(storeId: number, userId: number, pageName: string): Promise<InstagramAccount> {
  const sql = getSql()
  const clean = pageName.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "")
  const r = await sql`
    INSERT INTO instagram_accounts (store_id, user_id, page_name, status, updated_at)
    VALUES (${storeId}, ${userId}, ${clean}, 'pending', NOW())
    ON CONFLICT (store_id) DO UPDATE SET page_name = EXCLUDED.page_name, status = CASE WHEN instagram_accounts.status = 'connected' THEN 'connected' ELSE 'pending' END, updated_at = NOW()
    RETURNING *
  `
  return r[0] as any
}

export async function updateAccount(storeId: number, patch: Partial<InstagramAccount>): Promise<InstagramAccount | null> {
  const sql = getSql()
  const cur = await getAccountByStore(storeId)
  if (!cur) return null
  const m = { ...cur, ...patch }
  await sql`
    UPDATE instagram_accounts SET
      ig_username = ${m.ig_username}, ig_user_id = ${m.ig_user_id}, fb_page_id = ${m.fb_page_id}, access_token = ${m.access_token},
      token_expires_at = ${m.token_expires_at}, status = ${m.status}, status_message = ${m.status_message}, ai_enabled = ${m.ai_enabled},
      ai_tone = ${m.ai_tone}, ai_handoff_keywords = ${m.ai_handoff_keywords}, greeting_message = ${m.greeting_message}, away_message = ${m.away_message},
      connected_at = ${m.connected_at}, updated_at = NOW()
    WHERE store_id = ${storeId}
  `
  return getAccountByStore(storeId)
}

export async function disconnectAccount(storeId: number) {
  const sql = getSql()
  await sql`UPDATE instagram_accounts SET status = 'disconnected', access_token = NULL, ig_user_id = NULL, fb_page_id = NULL, updated_at = NOW() WHERE store_id = ${storeId}`
}

// ---------------------------------------------------------------------------
// OAuth exchange
// ---------------------------------------------------------------------------

async function graph<T = any>(path: string, params: Record<string, string>, init?: RequestInit): Promise<T> {
  const url = `${GRAPH}${path}?${new URLSearchParams(params)}`
  const res = await fetch(url, { ...init, cache: "no-store" })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(data?.error?.message || `Graph API ${res.status}`)
  return data as T
}

export async function completeOAuth(code: string): Promise<{ userToken: string; expiresIn: number }> {
  const c = metaConfig()
  const short = await graph<{ access_token: string }>("/oauth/access_token", { client_id: c.appId, client_secret: c.appSecret, redirect_uri: c.redirectUri, code })
  const long = await graph<{ access_token: string; expires_in?: number }>("/oauth/access_token", { grant_type: "fb_exchange_token", client_id: c.appId, client_secret: c.appSecret, fb_exchange_token: short.access_token })
  return { userToken: long.access_token, expiresIn: long.expires_in || 60 * 24 * 3600 }
}

export interface PageWithIg {
  pageId: string
  pageName: string
  pageToken: string
  igUserId: string | null
  igUsername: string | null
}

export async function listPagesWithInstagram(userToken: string): Promise<PageWithIg[]> {
  const data = await graph<{ data: any[] }>("/me/accounts", { access_token: userToken, fields: "id,name,access_token,instagram_business_account{id,username}" })
  return (data.data || []).map((p) => ({
    pageId: p.id,
    pageName: p.name,
    pageToken: p.access_token,
    igUserId: p.instagram_business_account?.id || null,
    igUsername: p.instagram_business_account?.username || null,
  }))
}

export async function subscribePageToWebhooks(pageId: string, pageToken: string) {
  await graph(`/${pageId}/subscribed_apps`, { access_token: pageToken, subscribed_fields: "messages,messaging_postbacks,message_reactions" }, { method: "POST" })
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

async function send(account: InstagramAccount, payload: Record<string, any>) {
  const token = decryptToken(account.access_token)
  if (!token || !account.fb_page_id) throw new Error("account not connected")
  const res = await fetch(`${GRAPH}/${account.fb_page_id}/messages?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(data?.error?.message || `send failed ${res.status}`)
  return data
}

export async function sendText(account: InstagramAccount, recipientId: string, text: string) {
  return send(account, { recipient: { id: recipientId }, messaging_type: "RESPONSE", message: { text: text.slice(0, 1000) } })
}

export async function sendAttachment(account: InstagramAccount, recipientId: string, type: "image" | "audio" | "video", url: string) {
  return send(account, { recipient: { id: recipientId }, messaging_type: "RESPONSE", message: { attachment: { type, payload: { url, is_reusable: true } } } })
}

export async function sendCard(account: InstagramAccount, recipientId: string, card: { title: string; subtitle?: string; image_url?: string; buttons?: Array<{ title: string; url?: string; payload?: string }> }) {
  const buttons = (card.buttons || []).slice(0, 3).map((b) => (b.url ? { type: "web_url", url: b.url, title: b.title.slice(0, 20) } : { type: "postback", title: b.title.slice(0, 20), payload: b.payload || b.title }))
  return send(account, {
    recipient: { id: recipientId },
    messaging_type: "RESPONSE",
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{ title: card.title.slice(0, 80), subtitle: card.subtitle?.slice(0, 80), image_url: card.image_url, buttons: buttons.length ? buttons : undefined }],
        },
      },
    },
  })
}

export async function sendSenderAction(account: InstagramAccount, recipientId: string, action: "typing_on" | "typing_off" | "mark_seen") {
  try {
    await send(account, { recipient: { id: recipientId }, sender_action: action })
  } catch {
    /* non-critical */
  }
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export async function listWorkflows(storeId: number): Promise<DmWorkflow[]> {
  const sql = getSql()
  const r = await sql`SELECT * FROM dm_workflows WHERE store_id = ${storeId} ORDER BY priority DESC, id ASC`
  return (r as any[]).map(normalizeWorkflow)
}

function normalizeWorkflow(row: any): DmWorkflow {
  return { ...row, keywords: Array.isArray(row.keywords) ? row.keywords : [], steps: Array.isArray(row.steps) ? row.steps : [] }
}

export async function createWorkflow(storeId: number, data: Partial<DmWorkflow>): Promise<DmWorkflow> {
  const sql = getSql()
  const r = await sql`
    INSERT INTO dm_workflows (store_id, name, trigger_type, keywords, match_mode, steps, enabled, priority)
    VALUES (${storeId}, ${data.name || "ورک‌فلو جدید"}, ${data.trigger_type || "keyword"}, ${JSON.stringify(data.keywords || [])}, ${data.match_mode || "contains"}, ${JSON.stringify(data.steps || [])}, ${data.enabled ?? true}, ${data.priority || 0})
    RETURNING *
  `
  return normalizeWorkflow(r[0])
}

export async function updateWorkflow(storeId: number, id: number, data: Partial<DmWorkflow>): Promise<DmWorkflow | null> {
  const sql = getSql()
  const cur = (await sql`SELECT * FROM dm_workflows WHERE id = ${id} AND store_id = ${storeId}`)[0] as any
  if (!cur) return null
  const m = { ...normalizeWorkflow(cur), ...data }
  const r = await sql`
    UPDATE dm_workflows SET name = ${m.name}, trigger_type = ${m.trigger_type}, keywords = ${JSON.stringify(m.keywords)}, match_mode = ${m.match_mode},
      steps = ${JSON.stringify(m.steps)}, enabled = ${m.enabled}, priority = ${m.priority}, updated_at = NOW()
    WHERE id = ${id} AND store_id = ${storeId} RETURNING *
  `
  return normalizeWorkflow(r[0])
}

export async function deleteWorkflow(storeId: number, id: number) {
  const sql = getSql()
  await sql`DELETE FROM dm_workflows WHERE id = ${id} AND store_id = ${storeId}`
}

function normalizeText(t: string) {
  return t
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function matchWorkflow(workflows: DmWorkflow[], text: string, isFirstMessage: boolean): DmWorkflow | null {
  const norm = normalizeText(text || "")
  const active = workflows.filter((w) => w.enabled)
  if (isFirstMessage) {
    const welcome = active.find((w) => w.trigger_type === "welcome")
    if (welcome) return welcome
  }
  for (const w of active.filter((w) => w.trigger_type === "keyword")) {
    for (const kw of w.keywords) {
      const k = normalizeText(kw)
      if (!k) continue
      const hit =
        w.match_mode === "exact" ? norm === k : w.match_mode === "starts_with" ? norm.startsWith(k) : w.match_mode === "regex" ? safeRegex(kw, text) : norm.includes(k)
      if (hit) return w
    }
  }
  return null
}

function safeRegex(pattern: string, text: string) {
  try {
    return new RegExp(pattern, "iu").test(text)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Conversations + logging
// ---------------------------------------------------------------------------

export async function getOrCreateConversation(storeId: number, senderId: string): Promise<{ id: number; isNew: boolean; ai_paused: boolean }> {
  const sql = getSql()
  const existing = await sql`SELECT id, ai_paused FROM dm_conversations WHERE store_id = ${storeId} AND ig_sender_id = ${senderId}`
  if (existing.length) {
    await sql`UPDATE dm_conversations SET last_message_at = NOW() WHERE id = ${existing[0].id}`
    return { id: existing[0].id, isNew: false, ai_paused: existing[0].ai_paused }
  }
  const r = await sql`INSERT INTO dm_conversations (store_id, ig_sender_id) VALUES (${storeId}, ${senderId}) RETURNING id`
  return { id: r[0].id, isNew: true, ai_paused: false }
}

export async function logMessage(conversationId: number, direction: "in" | "out", kind: string, content: Record<string, any>, workflowId?: number | null, igMessageId?: string | null) {
  const sql = getSql()
  await sql`INSERT INTO dm_messages (conversation_id, direction, kind, content, workflow_id, ig_message_id) VALUES (${conversationId}, ${direction}, ${kind}, ${JSON.stringify(content)}, ${workflowId || null}, ${igMessageId || null})`
}

export async function recentConversations(storeId: number, limit = 30) {
  const sql = getSql()
  return sql`
    SELECT c.*, (SELECT content FROM dm_messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_content,
      (SELECT direction FROM dm_messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_direction,
      (SELECT COUNT(*)::int FROM dm_messages m WHERE m.conversation_id = c.id) AS message_count
    FROM dm_conversations c WHERE c.store_id = ${storeId} ORDER BY c.last_message_at DESC LIMIT ${limit}
  `
}

export async function conversationMessages(storeId: number, conversationId: number) {
  const sql = getSql()
  return sql`SELECT m.* FROM dm_messages m JOIN dm_conversations c ON c.id = m.conversation_id WHERE c.store_id = ${storeId} AND m.conversation_id = ${conversationId} ORDER BY m.created_at ASC LIMIT 200`
}

export async function instagramStats(storeId: number) {
  const sql = getSql()
  const r = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM dm_conversations WHERE store_id = ${storeId}) AS conversations,
      (SELECT COUNT(*)::int FROM dm_messages m JOIN dm_conversations c ON c.id = m.conversation_id WHERE c.store_id = ${storeId} AND m.direction = 'out' AND m.created_at > NOW() - INTERVAL '7 days') AS replies7,
      (SELECT COUNT(*)::int FROM dm_messages m JOIN dm_conversations c ON c.id = m.conversation_id WHERE c.store_id = ${storeId} AND m.direction = 'out' AND m.kind = 'ai' AND m.created_at > NOW() - INTERVAL '7 days') AS ai7,
      (SELECT COALESCE(SUM(hits),0)::int FROM dm_workflows WHERE store_id = ${storeId}) AS workflow_hits
  `
  return r[0]
}

// ---------------------------------------------------------------------------
// AI agent reply — grounded in the store's chatbot KB + catalogue
// ---------------------------------------------------------------------------

export async function buildStoreContext(storeId: number): Promise<{ system: string; products: Array<{ id: number; name: string; slug: string; price: number; image_url: string | null }>; store: any }> {
  const sql = getSql()
  const [store] = (await sql`SELECT * FROM stores WHERE id = ${storeId}`) as any[]
  const products = (await sql`
    SELECT p.id, p.name, p.slug, p.price, p.description, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image_url
    FROM products p WHERE p.store_id = ${storeId} AND p.status = 'active' ORDER BY p.created_at DESC LIMIT 40
  `) as any[]
  let kbText = ""
  if (store?.chatbot_id) {
    const [chatbot, faqs, kb] = await Promise.all([getChatbotById(store.chatbot_id).catch(() => null), getChatbotFAQs(store.chatbot_id).catch(() => []), getChatbotKnowledgeBase(store.chatbot_id).catch(() => [])])
    if (chatbot?.business_info) kbText += `\nدرباره کسب‌وکار: ${chatbot.business_info}`
    for (const e of kb.slice(0, 20)) kbText += `\n🔹 ${e.title || ""}: ${String(e.content).slice(0, 400)}`
    for (const f of faqs.slice(0, 20)) kbText += `\nپرسش: ${f.question}\nپاسخ: ${f.answer}`
  }
  const base = (process.env.NEXT_PUBLIC_STOREFRONT_BASE_DOMAIN || "tsll.ir")
  const siteUrl = store ? `https://${store.slug}.${base}` : ""
  const catalogue = products.map((p) => `#${p.id} ${p.name} — ${Number(p.price).toLocaleString("fa-IR")} تومان${p.description ? ` — ${String(p.description).slice(0, 80)}` : ""} — ${siteUrl}/product/${p.slug}`).join("\n")

  const system = `تو دستیار فروش هوشمند پیج اینستاگرام «${store?.name || ""}» هستی و در دایرکت به مشتریان پاسخ می‌دهی.
قوانین:
- کوتاه، صمیمی و طبیعی مثل ادمین واقعی پیج بنویس (۱ تا ۳ جمله)؛ ایموجی کم.
- فقط از اطلاعات زیر استفاده کن. اگر جواب را نمی‌دانی بگو ادمین به‌زودی پاسخ می‌دهد.
- وقتی محصول مرتبطی هست، نام و قیمت و لینک آن را بده. اگر می‌خواهی کارت محصول ارسال شود، در انتهای پاسخ بنویس [PRODUCT:شناسه].
- برای ثبت سفارش/نوبت، مشتری را به سایت ${siteUrl} هدایت کن.
- هرگز شماره کارت یا اطلاعات بانکی جعلی نده؛ برای پرداخت فقط لینک سایت.
اطلاعات فروشگاه:${kbText || "\n(پایگاه دانش خالی است)"}
محصولات:
${catalogue || "(بدون محصول)"}`

  return { system, products, store }
}

export async function generateAiReply(storeId: number, account: InstagramAccount, history: AIMessage[], text: string): Promise<{ text: string; productId: number | null }> {
  const ctx = await buildStoreContext(storeId)
  const result = await chatCompletion({
    system: ctx.system + "\n\n" + getToneInstructions(account.ai_tone || "friendly"),
    messages: [...history.slice(-8), { role: "user", content: text }],
    temperature: 0.6,
    maxTokens: 350,
    inputBudgetTokens: 5000,
    timeoutMs: 20_000,
  })
  const m = result.text.match(/\[PRODUCT:(\d+)\]/)
  const productId = m ? Number(m[1]) : null
  return { text: result.text.replace(/\[PRODUCT:\d+\]/g, "").trim(), productId: ctx.products.some((p) => p.id === productId) ? productId : null }
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

export interface ExecutedAction {
  type: string
  preview: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function executeSteps(account: InstagramAccount, recipientId: string, steps: WorkflowStep[], conversationId: number | null, workflowId: number | null, dryRun: boolean, storeId: number, incomingText: string): Promise<ExecutedAction[]> {
  const actions: ExecutedAction[] = []
  const sql = getSql()
  for (const step of steps.slice(0, 12)) {
    switch (step.type) {
      case "text": {
        if (!step.text) break
        if (!dryRun) await sendText(account, recipientId, step.text)
        actions.push({ type: "text", preview: step.text })
        if (conversationId && !dryRun) await logMessage(conversationId, "out", "text", { text: step.text }, workflowId)
        break
      }
      case "image": {
        if (!step.url) break
        if (!dryRun) await sendAttachment(account, recipientId, "image", step.url)
        actions.push({ type: "image", preview: step.url })
        if (conversationId && !dryRun) await logMessage(conversationId, "out", "image", { url: step.url }, workflowId)
        break
      }
      case "voice": {
        if (!step.url) break
        if (!dryRun) await sendAttachment(account, recipientId, "audio", step.url)
        actions.push({ type: "voice", preview: step.url })
        if (conversationId && !dryRun) await logMessage(conversationId, "out", "voice", { url: step.url }, workflowId)
        break
      }
      case "card": {
        let card = { title: step.title || "", subtitle: step.subtitle, image_url: step.image_url, buttons: step.buttons || [] }
        if (step.product_id) {
          const [p] = (await sql`SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image_url, s.slug AS store_slug FROM products p JOIN stores s ON s.id = p.store_id WHERE p.id = ${step.product_id} AND p.store_id = ${storeId}`) as any[]
          if (p) {
            const url = `https://${p.store_slug}.${process.env.NEXT_PUBLIC_STOREFRONT_BASE_DOMAIN || "tsll.ir"}/product/${p.slug}`
            card = { title: p.name, subtitle: `${Number(p.price).toLocaleString("fa-IR")} تومان`, image_url: p.image_url, buttons: [{ title: "مشاهده و خرید", url }] }
          }
        }
        if (!card.title) break
        if (!dryRun) await sendCard(account, recipientId, card)
        actions.push({ type: "card", preview: `${card.title} — ${card.subtitle || ""}` })
        if (conversationId && !dryRun) await logMessage(conversationId, "out", "card", card, workflowId)
        break
      }
      case "delay": {
        const s = Math.min(10, Math.max(0, Number(step.seconds) || 1))
        if (!dryRun) await sleep(s * 1000)
        actions.push({ type: "delay", preview: `${s} ثانیه` })
        break
      }
      case "handoff": {
        if (conversationId && !dryRun) await sql`UPDATE dm_conversations SET ai_paused = TRUE WHERE id = ${conversationId}`
        const msg = step.text || "همکار ما به‌زودی پاسخ شما را می‌دهد 🙏"
        if (!dryRun) await sendText(account, recipientId, msg)
        actions.push({ type: "handoff", preview: msg })
        if (conversationId && !dryRun) await logMessage(conversationId, "out", "handoff", { text: msg }, workflowId)
        break
      }
      case "ai": {
        const history = conversationId ? await recentHistory(conversationId) : []
        const reply = await generateAiReply(storeId, account, history, step.instruction ? `${incomingText}\n(راهنمای ادمین: ${step.instruction})` : incomingText)
        if (!dryRun) await sendText(account, recipientId, reply.text)
        actions.push({ type: "ai", preview: reply.text })
        if (conversationId && !dryRun) await logMessage(conversationId, "out", "ai", { text: reply.text }, workflowId)
        if (reply.productId) {
          await executeSteps(account, recipientId, [{ type: "card", product_id: reply.productId }], conversationId, workflowId, dryRun, storeId, incomingText).then((a) => actions.push(...a))
        }
        break
      }
    }
  }
  return actions
}

async function recentHistory(conversationId: number): Promise<AIMessage[]> {
  const sql = getSql()
  const rows = (await sql`SELECT direction, kind, content FROM dm_messages WHERE conversation_id = ${conversationId} ORDER BY created_at DESC LIMIT 10`) as any[]
  return rows
    .reverse()
    .filter((r) => r.kind === "text" || r.kind === "ai" || r.kind === "in")
    .map((r) => ({ role: r.direction === "in" ? "user" : "assistant", content: String(r.content?.text || "") }) as AIMessage)
    .filter((m) => m.content)
}

/**
 * Central handler for an inbound DM text. Order: welcome workflow (first message) →
 * keyword workflow → handoff keywords → AI agent (if enabled) → fallback workflow.
 */
export async function handleIncomingMessage(account: InstagramAccount, senderId: string, text: string, opts: { dryRun?: boolean; igMessageId?: string | null } = {}): Promise<{ matchedWorkflow: DmWorkflow | null; actions: ExecutedAction[]; via: "workflow" | "ai" | "handoff" | "none" }> {
  const sql = getSql()
  const dryRun = Boolean(opts.dryRun)
  const conv = dryRun ? null : await getOrCreateConversation(account.store_id, senderId)
  if (conv) await logMessage(conv.id, "in", "in", { text }, null, opts.igMessageId || null)
  if (!dryRun) {
    await sendSenderAction(account, senderId, "mark_seen")
    await sendSenderAction(account, senderId, "typing_on")
    await sql`UPDATE instagram_accounts SET total_message_count = total_message_count + 1, daily_message_count = daily_message_count + 1 WHERE id = ${account.id}`
  }

  const workflows = await listWorkflows(account.store_id)
  const isFirst = conv ? conv.isNew : false
  const matched = matchWorkflow(workflows, text, isFirst)
  if (matched) {
    if (!dryRun) await sql`UPDATE dm_workflows SET hits = hits + 1 WHERE id = ${matched.id}`
    const actions = await executeSteps(account, senderId, matched.steps, conv?.id || null, matched.id, dryRun, account.store_id, text)
    // welcome workflow shouldn't swallow the first actual question
    if (matched.trigger_type === "welcome" && account.ai_enabled && !(conv?.ai_paused)) {
      const more = await handleAi(account, senderId, text, conv?.id || null, dryRun)
      actions.push(...more)
    }
    return { matchedWorkflow: matched, actions, via: "workflow" }
  }

  const handoffWords = (account.ai_handoff_keywords || "").split(/[,،\n]/).map((s) => normalizeText(s)).filter(Boolean)
  if (handoffWords.some((w) => normalizeText(text).includes(w))) {
    const actions = await executeSteps(account, senderId, [{ type: "handoff", text: account.away_message || undefined }], conv?.id || null, null, dryRun, account.store_id, text)
    return { matchedWorkflow: null, actions, via: "handoff" }
  }

  if (conv?.ai_paused) return { matchedWorkflow: null, actions: [], via: "none" }

  if (account.ai_enabled) {
    const actions = await handleAi(account, senderId, text, conv?.id || null, dryRun)
    return { matchedWorkflow: null, actions, via: "ai" }
  }

  const fallback = workflows.find((w) => w.enabled && w.trigger_type === "fallback")
  if (fallback) {
    const actions = await executeSteps(account, senderId, fallback.steps, conv?.id || null, fallback.id, dryRun, account.store_id, text)
    return { matchedWorkflow: fallback, actions, via: "workflow" }
  }
  return { matchedWorkflow: null, actions: [], via: "none" }
}

async function handleAi(account: InstagramAccount, senderId: string, text: string, conversationId: number | null, dryRun: boolean): Promise<ExecutedAction[]> {
  try {
    return await executeSteps(account, senderId, [{ type: "ai" }], conversationId, null, dryRun, account.store_id, text)
  } catch (e) {
    console.error("[instagram] ai reply failed", e)
    const msg = account.away_message || "پیامتون رسید 🙏 به‌زودی پاسخ می‌دیم."
    if (!dryRun) await sendText(account, senderId, msg).catch(() => {})
    return [{ type: "text", preview: msg }]
  }
}
