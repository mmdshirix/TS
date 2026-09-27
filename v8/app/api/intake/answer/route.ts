import type { NextRequest } from "next/server"
import { answerIntake, platformStartUrl } from "@/lib/intake"
import { corsJson, corsPreflight } from "@/lib/intake-cors"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export function OPTIONS() {
  return corsPreflight()
}

/** POST { token, answers: {questionId: value} } → next stage or { done: true, continueUrl } */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const token = String(body.token || "")
  if (!token) return corsJson({ error: "توکن نامعتبر است" }, 400)
  const intake = await answerIntake(token, body.answers && typeof body.answers === "object" ? body.answers : {})
  if (!intake) return corsJson({ error: "درخواست یافت نشد" }, 404)
  const stages = intake.questions as any[]
  const done = intake.status === "ready" || intake.current_stage >= stages.length
  return corsJson({
    token,
    detected: intake.detected,
    stage: intake.current_stage,
    totalStages: stages.length,
    questions: done ? [] : stages[intake.current_stage] || [],
    done,
    continueUrl: platformStartUrl(token),
    summary: done ? { name: intake.detected.storeName, category: intake.detected.categoryLabel, answers: intake.answers } : undefined,
  })
}
