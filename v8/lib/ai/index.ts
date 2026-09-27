// Unified AI layer for TalkSell / Taxel.
//
// Two OpenAI-compatible providers are supported and switchable at runtime from the
// super-admin panel (global_settings.ai_provider) or via env (AI_PROVIDER):
//
//   - "arvan"    → ArvanCloud AI gateway (default / primary)
//   - "deepseek" → api.deepseek.com
//
// Everything that talks to a model goes through chatCompletion()/streamChatCompletion()
// here, so provider switching, key resolution, timeouts, fallback, tone control,
// token budgeting and reasoning-tag stripping live in exactly one place.

import { getSharedSql } from "@/lib/postgres"

export type AIProviderId = "arvan" | "deepseek"

export interface ProviderConfig {
  id: AIProviderId
  label: string
  baseUrl: string
  apiKey: string | null
  model: string
  /** Arvan expects `Authorization: apikey <key>`, DeepSeek expects `Bearer <key>` */
  authScheme: "apikey" | "bearer"
}

export interface AIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export type { ResponseTone } from "@/lib/ai/tones"
import type { ResponseTone } from "@/lib/ai/tones"

export interface ChatOptions {
  messages: AIMessage[]
  system?: string
  /** Preferred provider; falls back to the configured default, then to the other one. */
  provider?: AIProviderId | string | null
  /** Explicit API key override (e.g. a chatbot's own key). */
  apiKey?: string | null
  model?: string
  temperature?: number
  maxTokens?: number
  /** Hard input budget (tokens). Older history is dropped to fit. */
  inputBudgetTokens?: number
  /** Milliseconds before we abort and try the fallback provider. */
  timeoutMs?: number
  /** Ask the model for a JSON object. */
  json?: boolean
  tone?: ResponseTone | string | null
}

export interface ChatResult {
  text: string
  provider: AIProviderId
  model: string
  latencyMs: number
  usage: { inputTokens: number; outputTokens: number; totalTokens: number; estimated: boolean }
}

export class AIUnavailableError extends Error {
  constructor(message = "سرویس هوش مصنوعی پیکربندی نشده است") {
    super(message)
    this.name = "AIUnavailableError"
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_ARVAN_MODEL = "Xerxes-1"
const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat"
const DEFAULT_DEEPSEEK_URL = "https://api.deepseek.com"
const SETTINGS_CACHE_MS = 30_000

interface GlobalAISettings {
  ai_provider?: string
  ai_api_key?: string // legacy single-key setting (kept for backwards compatibility)
  arvan_api_url?: string
  arvan_api_key?: string
  arvan_model?: string
  deepseek_api_key?: string
  deepseek_model?: string
  ai_fallback_enabled?: string
  ai_default_max_tokens?: string
  ai_default_temperature?: string
}

let settingsCache: { at: number; value: GlobalAISettings } | null = null

export async function loadGlobalAISettings(force = false): Promise<GlobalAISettings> {
  if (!force && settingsCache && Date.now() - settingsCache.at < SETTINGS_CACHE_MS) {
    return settingsCache.value
  }
  let value: GlobalAISettings = {}
  try {
    const sql = getSharedSql()
    const rows = await sql`SELECT setting_key, setting_value FROM global_settings WHERE setting_key LIKE 'ai_%' OR setting_key LIKE 'arvan_%' OR setting_key LIKE 'deepseek_%'`
    for (const row of rows as any[]) {
      if (row.setting_value !== null && row.setting_value !== "") {
        ;(value as any)[row.setting_key] = String(row.setting_value)
      }
    }
  } catch {
    // DB unavailable (build time, first boot) → env only
  }
  settingsCache = { at: Date.now(), value }
  return value
}

export function invalidateAISettingsCache() {
  settingsCache = null
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").replace(/\/chat\/completions$/, "")
}

export async function getProviderConfigs(): Promise<Record<AIProviderId, ProviderConfig>> {
  const s = await loadGlobalAISettings()
  const legacyKeyFor = (p: AIProviderId) => (s.ai_provider === p ? s.ai_api_key : undefined)

  const arvanUrl = s.arvan_api_url || process.env.ARVAN_API_URL || ""
  const arvan: ProviderConfig = {
    id: "arvan",
    label: "ArvanCloud AI",
    baseUrl: arvanUrl ? normalizeBaseUrl(arvanUrl) : "",
    apiKey: s.arvan_api_key || legacyKeyFor("arvan") || process.env.ARVAN_API_KEY || null,
    model: s.arvan_model || process.env.ARVAN_MODEL || DEFAULT_ARVAN_MODEL,
    authScheme: "apikey",
  }
  const deepseek: ProviderConfig = {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: normalizeBaseUrl(process.env.DEEPSEEK_API_URL || DEFAULT_DEEPSEEK_URL),
    apiKey: s.deepseek_api_key || legacyKeyFor("deepseek") || process.env.DEEPSEEK_API_KEY || null,
    model: s.deepseek_model || process.env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
    authScheme: "bearer",
  }
  return { arvan, deepseek }
}

export async function getDefaultProviderId(): Promise<AIProviderId> {
  const s = await loadGlobalAISettings()
  const fromDb = s.ai_provider
  const fromEnv = process.env.AI_PROVIDER
  const candidate = (fromDb || fromEnv || "arvan").toLowerCase()
  return candidate === "deepseek" ? "deepseek" : "arvan"
}

function isUsable(cfg: ProviderConfig): boolean {
  return Boolean(cfg.apiKey && cfg.baseUrl)
}

/**
 * Resolve the provider chain: [preferred, other]. Providers without credentials are
 * skipped, so the platform keeps working if only one of the two is configured.
 */
export async function resolveProviderChain(preferred?: string | null, apiKeyOverride?: string | null): Promise<ProviderConfig[]> {
  const configs = await getProviderConfigs()
  const settings = await loadGlobalAISettings()
  const defaultId = await getDefaultProviderId()
  const first: AIProviderId = preferred === "deepseek" || preferred === "arvan" ? preferred : defaultId
  const second: AIProviderId = first === "arvan" ? "deepseek" : "arvan"
  const fallbackEnabled = (settings.ai_fallback_enabled ?? process.env.AI_FALLBACK_ENABLED ?? "true") !== "false"

  const primary = { ...configs[first], apiKey: apiKeyOverride || configs[first].apiKey }
  const chain = [primary]
  if (fallbackEnabled) chain.push(configs[second])
  return chain.filter(isUsable)
}

export { TONE_OPTIONS, getToneInstructions } from "@/lib/ai/tones"
import { getToneInstructions } from "@/lib/ai/tones"

// ---------------------------------------------------------------------------
// Token budgeting
// ---------------------------------------------------------------------------

/** Cheap token estimate that works well enough for Persian + English mixed text. */
export function estimateTokens(text: string): number {
  if (!text) return 0
  return Math.ceil(text.length / 3)
}

export function estimateMessagesTokens(messages: AIMessage[]): number {
  return messages.reduce((sum, m) => sum + estimateTokens(m.content) + 4, 0)
}

/**
 * Drops the oldest non-system messages until the conversation fits the budget.
 * The last user message is always kept (truncated if it alone exceeds the budget).
 */
export function fitMessagesToBudget(system: string | undefined, messages: AIMessage[], budgetTokens: number): AIMessage[] {
  const systemTokens = system ? estimateTokens(system) + 4 : 0
  let history = messages.filter((m) => m.role !== "system")
  while (history.length > 1 && systemTokens + estimateMessagesTokens(history) > budgetTokens) {
    history = history.slice(1)
  }
  if (history.length === 1 && systemTokens + estimateMessagesTokens(history) > budgetTokens) {
    const allowedChars = Math.max(200, (budgetTokens - systemTokens) * 3)
    history = [{ ...history[0], content: history[0].content.slice(-allowedChars) }]
  }
  return history
}

// ---------------------------------------------------------------------------
// Reasoning stripping (DeepSeek-R1 style <think>…</think>)
// ---------------------------------------------------------------------------

export function stripReasoning(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^<think>[\s\S]*$/i, "")
    .trim()
}

/** Stateful filter used for streaming: hides everything between <think> and </think>. */
export function createReasoningFilter() {
  let inThink = false
  let carry = ""
  return (chunk: string): string => {
    let input = carry + chunk
    carry = ""
    let out = ""
    while (input.length > 0) {
      if (inThink) {
        const end = input.indexOf("</think>")
        if (end === -1) {
          // keep a small tail in case the closing tag is split across chunks
          carry = input.slice(-8)
          return out
        }
        input = input.slice(end + 8)
        inThink = false
        continue
      }
      const start = input.indexOf("<think>")
      if (start === -1) {
        // a partial "<thi" at the end could be the start of a tag
        const lt = input.lastIndexOf("<")
        if (lt !== -1 && input.length - lt < 7 && "<think>".startsWith(input.slice(lt))) {
          out += input.slice(0, lt)
          carry = input.slice(lt)
        } else {
          out += input
        }
        return out
      }
      out += input.slice(0, start)
      input = input.slice(start + 7)
      inThink = true
    }
    return out
  }
}

// ---------------------------------------------------------------------------
// HTTP plumbing
// ---------------------------------------------------------------------------

function buildHeaders(cfg: ProviderConfig): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: cfg.authScheme === "apikey" ? `apikey ${cfg.apiKey}` : `Bearer ${cfg.apiKey}`,
  }
}

function buildBody(cfg: ProviderConfig, opts: ChatOptions, stream: boolean) {
  const system = [opts.system, opts.tone ? getToneInstructions(opts.tone) : ""].filter(Boolean).join("\n\n")
  const budget = opts.inputBudgetTokens ?? 6000
  const history = fitMessagesToBudget(system, opts.messages, budget)
  const messages: AIMessage[] = [...(system ? [{ role: "system" as const, content: system }] : []), ...history]

  const body: Record<string, any> = {
    model: opts.model || cfg.model,
    messages,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 700,
    stream,
  }
  if (opts.json && cfg.id === "deepseek") {
    body.response_format = { type: "json_object" }
  }
  return body
}

async function postChat(cfg: ProviderConfig, body: Record<string, any>, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(cfg),
      body: JSON.stringify(body),
      signal: controller.signal,
      // keep-alive is the default in Node's undici fetch; hint caches anyway
      cache: "no-store",
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      clearTimeout(timer)
      throw new Error(`${cfg.label} ${res.status}: ${text.slice(0, 300)}`)
    }
    // For streaming we must keep the timer alive until the body is consumed; the
    // caller clears it through the returned response's finalizer below.
    ;(res as any).__clearTimer = () => clearTimeout(timer)
    if (!body.stream) clearTimeout(timer)
    return res
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function chatCompletion(opts: ChatOptions): Promise<ChatResult> {
  const chain = await resolveProviderChain(opts.provider, opts.apiKey)
  if (chain.length === 0) throw new AIUnavailableError()

  let lastError: unknown = null
  for (const cfg of chain) {
    const started = Date.now()
    try {
      const body = buildBody(cfg, opts, false)
      const res = await postChat(cfg, body, opts.timeoutMs ?? 25_000)
      const data = await res.json()
      const raw = data?.choices?.[0]?.message?.content ?? ""
      const text = stripReasoning(String(raw))
      const usage = data?.usage
      const inputTokens = Number(usage?.prompt_tokens ?? estimateMessagesTokens(body.messages))
      const outputTokens = Number(usage?.completion_tokens ?? estimateTokens(text))
      return {
        text,
        provider: cfg.id,
        model: body.model,
        latencyMs: Date.now() - started,
        usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, estimated: !usage },
      }
    } catch (err) {
      lastError = err
      console.error(`[AI] ${cfg.label} failed:`, err instanceof Error ? err.message : err)
    }
  }
  throw lastError instanceof Error ? lastError : new Error("AI request failed")
}

export interface StreamResult {
  /** Plain-text stream of visible deltas (reasoning removed). */
  stream: ReadableStream<string>
  provider: AIProviderId
  model: string
  /** Resolves with the full visible text when the stream ends. */
  done: Promise<{ text: string; inputTokens: number; outputTokens: number }>
}

export async function streamChatCompletion(opts: ChatOptions): Promise<StreamResult> {
  const chain = await resolveProviderChain(opts.provider, opts.apiKey)
  if (chain.length === 0) throw new AIUnavailableError()

  let lastError: unknown = null
  for (const cfg of chain) {
    try {
      const body = buildBody(cfg, opts, true)
      const res = await postChat(cfg, body, opts.timeoutMs ?? 30_000)
      const inputTokens = estimateMessagesTokens(body.messages)
      const filter = createReasoningFilter()
      let fullText = ""
      let resolveDone!: (v: { text: string; inputTokens: number; outputTokens: number }) => void
      const done = new Promise<{ text: string; inputTokens: number; outputTokens: number }>((r) => (resolveDone = r))

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      const stream = new ReadableStream<string>({
        async pull(controller) {
          const { value, done: finished } = await reader.read()
          if (finished) {
            ;(res as any).__clearTimer?.()
            controller.close()
            resolveDone({ text: fullText, inputTokens, outputTokens: estimateTokens(fullText) })
            return
          }
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith("data:")) continue
            const payload = trimmed.slice(5).trim()
            if (!payload || payload === "[DONE]") continue
            try {
              const json = JSON.parse(payload)
              const delta = json?.choices?.[0]?.delta
              const content: string | undefined = delta?.content
              if (content) {
                const visible = filter(content)
                if (visible) {
                  fullText += visible
                  controller.enqueue(visible)
                }
              }
            } catch {
              // partial JSON, ignore
            }
          }
        },
        cancel() {
          ;(res as any).__clearTimer?.()
          reader.cancel().catch(() => {})
        },
      })

      return { stream, provider: cfg.id, model: body.model, done }
    } catch (err) {
      lastError = err
      console.error(`[AI] ${cfg.label} stream failed:`, err instanceof Error ? err.message : err)
    }
  }
  throw lastError instanceof Error ? lastError : new Error("AI stream failed")
}

/** Convenience for "one prompt in, one answer out" call sites. */
export async function askAI(
  prompt: string,
  options: Omit<ChatOptions, "messages"> & { history?: AIMessage[] } = {},
): Promise<string> {
  const { history = [], ...rest } = options
  const result = await chatCompletion({ ...rest, messages: [...history, { role: "user", content: prompt }] })
  return result.text
}

/** Pull a JSON array/object out of a model reply even if wrapped in prose or a fence. */
export function extractJson<T>(text: string): T | null {
  const cleaned = stripReasoning(text).replace(/```(?:json)?/gi, "")
  const match = cleaned.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as T
  } catch {
    return null
  }
}

/** Health check used by the super-admin panel. */
export async function testProvider(id: AIProviderId): Promise<{ ok: boolean; latencyMs: number; model: string; error?: string; sample?: string }> {
  const configs = await getProviderConfigs()
  const cfg = configs[id]
  if (!isUsable(cfg)) return { ok: false, latencyMs: 0, model: cfg.model, error: "کلید یا آدرس سرویس تنظیم نشده است" }
  const started = Date.now()
  try {
    const res = await postChat(
      cfg,
      { model: cfg.model, messages: [{ role: "user", content: "سلام! فقط بگو: آماده‌ام." }], max_tokens: 20, temperature: 0, stream: false },
      15_000,
    )
    const data = await res.json()
    const sample = stripReasoning(String(data?.choices?.[0]?.message?.content ?? ""))
    return { ok: true, latencyMs: Date.now() - started, model: data?.model || cfg.model, sample }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - started, model: cfg.model, error: err instanceof Error ? err.message : String(err) }
  }
}
