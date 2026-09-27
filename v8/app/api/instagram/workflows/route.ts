import { NextResponse, type NextRequest } from "next/server"
import { requireStore, fail } from "@/lib/store-route"
import { listWorkflows, createWorkflow } from "@/lib/instagram"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  return NextResponse.json({ workflows: await listWorkflows(ctx.store.id) })
}

export async function POST(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  if (!body.name?.trim()) return fail("نام ورک‌فلو الزامی است")
  const wf = await createWorkflow(ctx.store.id, {
    name: String(body.name).trim(),
    trigger_type: body.trigger_type,
    keywords: Array.isArray(body.keywords) ? body.keywords.map(String).filter(Boolean) : [],
    match_mode: body.match_mode,
    steps: Array.isArray(body.steps) ? body.steps : [],
    enabled: body.enabled ?? true,
    priority: Number(body.priority) || 0,
  })
  return NextResponse.json({ workflow: wf }, { status: 201 })
}
