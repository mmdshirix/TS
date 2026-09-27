import { NextResponse } from "next/server"
import { getProviderConfigs, testProvider } from "@/lib/ai"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Reports both providers' configured model + live reachability.
export async function GET() {
  const configs = await getProviderConfigs()
  const results = await Promise.all(
    (["arvan", "deepseek"] as const).map(async (id) => {
      const cfg = configs[id]
      const test = cfg.apiKey && cfg.baseUrl ? await testProvider(id) : { ok: false, latencyMs: 0, model: cfg.model, error: "not configured" }
      return { provider: id, label: cfg.label, configured: Boolean(cfg.apiKey && cfg.baseUrl), ...test, model: test.model || cfg.model }
    }),
  )
  return NextResponse.json({ results })
}
