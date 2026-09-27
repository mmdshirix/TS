import { NextResponse, type NextRequest } from "next/server"
import { requireStore } from "@/lib/store-route"
import { getPharmacySettings, upsertPharmacySettings } from "@/lib/pharmacy-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  return NextResponse.json({ settings: await getPharmacySettings(ctx.store.id) })
}

export async function PUT(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  const settings = await upsertPharmacySettings(ctx.store.id, {
    accepts_prescriptions: body.accepts_prescriptions,
    is_24h: body.is_24h,
    delivery_enabled: body.delivery_enabled,
    delivery_fee: body.delivery_fee !== undefined ? Number(body.delivery_fee) || 0 : undefined,
    delivery_radius_km: body.delivery_radius_km === "" || body.delivery_radius_km === null ? null : body.delivery_radius_km !== undefined ? Number(body.delivery_radius_km) : undefined,
    consult_enabled: body.consult_enabled,
    pharmacist_name: body.pharmacist_name,
    license_no: body.license_no,
    insurance_types: Array.isArray(body.insurance_types) ? body.insurance_types.map(String).filter(Boolean) : undefined,
    ai_advisor_enabled: body.ai_advisor_enabled,
    emergency_phone: body.emergency_phone,
  })
  return NextResponse.json({ settings })
}
