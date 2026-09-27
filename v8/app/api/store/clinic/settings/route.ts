import { NextResponse, type NextRequest } from "next/server"
import { requireStore } from "@/lib/store-route"
import { getClinicSettings, upsertClinicSettings } from "@/lib/clinic-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  return NextResponse.json({ settings: await getClinicSettings(ctx.store.id) })
}

export async function PUT(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  const settings = await upsertClinicSettings(ctx.store.id, {
    booking_enabled: body.booking_enabled,
    fee_required: body.fee_required,
    default_fee: body.default_fee !== undefined ? Number(body.default_fee) || 0 : undefined,
    slot_minutes: body.slot_minutes !== undefined ? Math.max(5, Number(body.slot_minutes) || 20) : undefined,
    booking_horizon_days: body.booking_horizon_days !== undefined ? Math.min(90, Math.max(1, Number(body.booking_horizon_days) || 30)) : undefined,
    cancellation_policy: body.cancellation_policy,
    ai_triage_enabled: body.ai_triage_enabled,
    ai_welcome: body.ai_welcome,
    emergency_note: body.emergency_note,
    insurance_types: Array.isArray(body.insurance_types) ? body.insurance_types.map(String).filter(Boolean) : undefined,
  })
  return NextResponse.json({ settings })
}
