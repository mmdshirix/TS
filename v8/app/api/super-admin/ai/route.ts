import { type NextRequest, NextResponse } from "next/server"
import { verifySuperAdmin } from "@/lib/super-admin"
import { getSharedSql } from "@/lib/postgres"
import { getProviderConfigs, getDefaultProviderId, invalidateAISettingsCache, loadGlobalAISettings, testProvider, type AIProviderId } from "@/lib/ai"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ALLOWED_KEYS = new Set([
  "ai_provider",
  "arvan_api_url",
  "arvan_api_key",
  "arvan_model",
  "deepseek_api_key",
  "deepseek_model",
  "ai_fallback_enabled",
])

function mask(key: string | null | undefined) {
  if (!key) return ""
  if (key.length <= 8) return "••••"
  return `${key.slice(0, 4)}••••${key.slice(-4)}`
}

function maskUrl(url: string) {
  // Arvan gateway URLs embed an access token in the path — never echo it in full.
  return url.replace(/(\/gateway\/models\/[^/]+\/)[^/]+(\/v1)?$/, "$1•••$2")
}

export async function GET() {
  if (!(await verifySuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const configs = await getProviderConfigs()
  const settings = await loadGlobalAISettings(true)
  const provider = await getDefaultProviderId()
  return NextResponse.json({
    provider,
    fallbackEnabled: (settings.ai_fallback_enabled ?? "true") !== "false",
    arvan: {
      configured: Boolean(configs.arvan.apiKey && configs.arvan.baseUrl),
      apiUrl: configs.arvan.baseUrl ? maskUrl(configs.arvan.baseUrl) : "",
      apiKeyMasked: mask(configs.arvan.apiKey),
      model: configs.arvan.model,
      source: settings.arvan_api_key ? "database" : configs.arvan.apiKey ? "env" : "none",
    },
    deepseek: {
      configured: Boolean(configs.deepseek.apiKey),
      apiKeyMasked: mask(configs.deepseek.apiKey),
      model: configs.deepseek.model,
      source: settings.deepseek_api_key ? "database" : configs.deepseek.apiKey ? "env" : "none",
    },
  })
}

export async function POST(request: NextRequest) {
  if (!(await verifySuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const sql = getSharedSql()

  await sql`
    CREATE TABLE IF NOT EXISTS global_settings (
      id SERIAL PRIMARY KEY,
      setting_key VARCHAR(255) NOT NULL UNIQUE,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  for (const [key, raw] of Object.entries(body as Record<string, unknown>)) {
    if (!ALLOWED_KEYS.has(key)) continue
    const value = raw === null || raw === undefined ? "" : String(raw)
    // Empty string means "clear this override and fall back to env"
    if (value === "") {
      await sql`DELETE FROM global_settings WHERE setting_key = ${key}`
    } else {
      await sql`
        INSERT INTO global_settings (setting_key, setting_value, updated_at)
        VALUES (${key}, ${value}, NOW())
        ON CONFLICT (setting_key) DO UPDATE SET setting_value = ${value}, updated_at = NOW()
      `
    }
  }
  invalidateAISettingsCache()
  return NextResponse.json({ success: true })
}

// Live test of one provider: POST /api/super-admin/ai?test=arvan
export async function PUT(request: NextRequest) {
  if (!(await verifySuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = (request.nextUrl.searchParams.get("test") || "arvan") as AIProviderId
  invalidateAISettingsCache()
  const result = await testProvider(id === "deepseek" ? "deepseek" : "arvan")
  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
