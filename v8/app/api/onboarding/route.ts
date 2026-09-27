import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getOnboarding, updateOnboarding, buildChecklist } from "@/lib/onboarding-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const [state, checklist] = await Promise.all([getOnboarding(user.id), buildChecklist(user.id)])
  return NextResponse.json({ state, checklist })
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const state = await updateOnboarding(user.id, {
    tour_completed: typeof body.tour_completed === "boolean" ? body.tour_completed : undefined,
    dismissed_checklist: typeof body.dismissed_checklist === "boolean" ? body.dismissed_checklist : undefined,
    completed_steps: Array.isArray(body.completed_steps) ? body.completed_steps.map(String) : undefined,
    intent: body.intent && typeof body.intent === "object" ? body.intent : undefined,
  })
  return NextResponse.json({ state })
}
