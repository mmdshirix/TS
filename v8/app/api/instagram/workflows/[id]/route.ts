import { NextResponse, type NextRequest } from "next/server"
import { requireStore, fail } from "@/lib/store-route"
import { updateWorkflow, deleteWorkflow } from "@/lib/instagram"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  const wf = await updateWorkflow(ctx.store.id, Number(params.id), {
    name: body.name,
    trigger_type: body.trigger_type,
    keywords: Array.isArray(body.keywords) ? body.keywords.map(String).filter(Boolean) : undefined,
    match_mode: body.match_mode,
    steps: Array.isArray(body.steps) ? body.steps : undefined,
    enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
    priority: body.priority !== undefined ? Number(body.priority) || 0 : undefined,
  })
  if (!wf) return fail("ورک‌فلو یافت نشد", 404)
  return NextResponse.json({ workflow: wf })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  await deleteWorkflow(ctx.store.id, Number(params.id))
  return NextResponse.json({ success: true })
}
