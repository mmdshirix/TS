import type { NextRequest } from "next/server"
import { getIntake } from "@/lib/intake"
import { corsJson, corsPreflight } from "@/lib/intake-cors"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export function OPTIONS() {
  return corsPreflight()
}

export async function GET(_: NextRequest, { params }: { params: { token: string } }) {
  const intake = await getIntake(params.token)
  if (!intake) return corsJson({ error: "درخواست یافت نشد" }, 404)
  const stages = intake.questions as any[]
  return corsJson({
    token: intake.token,
    prompt: intake.prompt,
    detected: intake.detected,
    answers: intake.answers,
    stage: intake.current_stage,
    totalStages: stages.length,
    questions: stages[intake.current_stage] || [],
    status: intake.status,
    store_id: intake.store_id,
  })
}
