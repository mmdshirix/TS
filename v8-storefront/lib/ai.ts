// Lightweight AI client for storefront-side features (clinic triage, pharmacist advisor).
// Same provider contract as the platform's lib/ai: Arvan (default) or DeepSeek, both
// OpenAI-compatible. Reads global_settings first so the super-admin switch applies here too.

import { getSql } from "@/lib/db"

type ProviderId = "arvan" | "deepseek"

interface Provider {
  id: ProviderId
  baseUrl: string
  apiKey: string
  model: string
  auth: "apikey" | "bearer"
}

let cache: { at: number; settings: Record<string, string> } | null = null

async function settings(): Promise<Record<string, string>> {
  if (cache && Date.now() - cache.at < 30_000) return cache.settings
  const out: Record<string, string> = {}
  try {
    const sql = getSql()
    const rows = await sql`SELECT setting_key, setting_value FROM global_settings WHERE setting_key LIKE 'ai_%' OR setting_key LIKE 'arvan_%' OR setting_key LIKE 'deepseek_%'`
    for (const r of rows as any[]) if (r.setting_value) out[r.setting_key] = String(r.setting_value)
  } catch {
    /* env only */
  }
  cache = { at: Date.now(), settings: out }
  return out
}

async function providers(): Promise<Provider[]> {
  const s = await settings()
  const preferred = ((s.ai_provider || process.env.AI_PROVIDER || "arvan").toLowerCase() === "deepseek" ? "deepseek" : "arvan") as ProviderId
  const arvanUrl = (s.arvan_api_url || process.env.ARVAN_API_URL || "").replace(/\/+$/, "").replace(/\/chat\/completions$/, "")
  const list: Provider[] = []
  const arvan: Provider | null = arvanUrl && (s.arvan_api_key || process.env.ARVAN_API_KEY)
    ? { id: "arvan", baseUrl: arvanUrl, apiKey: s.arvan_api_key || process.env.ARVAN_API_KEY!, model: s.arvan_model || process.env.ARVAN_MODEL || "Xerxes-1", auth: "apikey" }
    : null
  const deepseek: Provider | null = s.deepseek_api_key || process.env.DEEPSEEK_API_KEY
    ? { id: "deepseek", baseUrl: "https://api.deepseek.com", apiKey: s.deepseek_api_key || process.env.DEEPSEEK_API_KEY!, model: s.deepseek_model || "deepseek-chat", auth: "bearer" }
    : null
  const ordered = preferred === "arvan" ? [arvan, deepseek] : [deepseek, arvan]
  for (const p of ordered) if (p) list.push(p)
  return list
}

export function stripReasoning(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()
}

export async function ask(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  opts: { temperature?: number; maxTokens?: number; timeoutMs?: number } = {},
): Promise<string> {
  const chain = await providers()
  if (chain.length === 0) throw new Error("AI_NOT_CONFIGURED")
  let lastErr: unknown
  for (const p of chain) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20_000)
    try {
      const res = await fetch(`${p.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: p.auth === "apikey" ? `apikey ${p.apiKey}` : `Bearer ${p.apiKey}`,
        },
        body: JSON.stringify({ model: p.model, messages, temperature: opts.temperature ?? 0.4, max_tokens: opts.maxTokens ?? 500, stream: false }),
        signal: controller.signal,
        cache: "no-store",
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`${p.id} ${res.status}`)
      const data = await res.json()
      return stripReasoning(String(data?.choices?.[0]?.message?.content ?? ""))
    } catch (e) {
      clearTimeout(timer)
      lastErr = e
      console.error("[storefront ai]", p.id, e instanceof Error ? e.message : e)
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("AI_FAILED")
}

export function extractJson<T>(text: string): T | null {
  const m = stripReasoning(text).replace(/```(?:json)?/gi, "").match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!m) return null
  try {
    return JSON.parse(m[0]) as T
  } catch {
    return null
  }
}
