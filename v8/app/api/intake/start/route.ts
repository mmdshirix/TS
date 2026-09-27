import type { NextRequest } from "next/server"
import { createIntake, verifyIntakeApiKey, platformStartUrl } from "@/lib/intake"
import { corsJson, corsPreflight } from "@/lib/intake-cors"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 30

export function OPTIONS() {
  return corsPreflight()
}

/**
 * POST { prompt, site?, pageUrl?, visitorId? }  (header X-Taxel-Key optional for WordPress)
 * → { token, detected, stage: 0, questions: [...], totalStages, continueUrl }
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const prompt = String(body.prompt || "").trim().slice(0, 1500)
  if (prompt.length < 5) return corsJson({ error: "لطفاً توضیح دهید چه چیزی می‌خواهید بسازید" }, 400)

  const key = request.headers.get("x-taxel-key") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null
  const apiKey = await verifyIntakeApiKey(key)
  // Keys are optional (the platform's own /start page uses this too), but if one is
  // supplied it must be valid so we can attribute the lead to the right WordPress site.
  if (key && !apiKey) return corsJson({ error: "کلید API نامعتبر است" }, 401)

  try {
    const intake = await createIntake({
      prompt,
      apiKeyId: apiKey?.id || null,
      source: apiKey ? "wordpress" : String(body.source || "platform"),
      sourceSite: body.site || apiKey?.site_url || request.headers.get("origin") || null,
      sourcePageUrl: body.pageUrl || null,
      visitorId: body.visitorId || null,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    })
    const stages = intake.questions as any[]
    return corsJson({
      token: intake.token,
      detected: intake.detected,
      stage: 0,
      totalStages: stages.length,
      questions: stages[0] || [],
      continueUrl: platformStartUrl(intake.token),
    })
  } catch (e) {
    console.error("[intake/start]", e)
    return corsJson({ error: "خطا در شروع ساخت سایت" }, 500)
  }
}
