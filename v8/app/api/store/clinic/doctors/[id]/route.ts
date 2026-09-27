import { NextResponse, type NextRequest } from "next/server"
import { requireStore, fail } from "@/lib/store-route"
import { getDoctor, updateDoctor, deleteDoctor, replaceSchedules } from "@/lib/clinic-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const id = Number(params.id)
  const body = await request.json().catch(() => ({}))
  const doctor = await updateDoctor(ctx.store.id, id, {
    ...body,
    consultation_fee: body.consultation_fee === "" ? null : body.consultation_fee !== undefined ? Number(body.consultation_fee) : undefined,
    visit_duration_min: body.visit_duration_min !== undefined ? Number(body.visit_duration_min) || 20 : undefined,
  })
  if (!doctor) return fail("پزشک یافت نشد", 404)
  if (Array.isArray(body.schedules)) doctor.schedules = await replaceSchedules(doctor.id, body.schedules)
  return NextResponse.json({ doctor })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const doctor = await getDoctor(ctx.store.id, Number(params.id))
  if (!doctor) return fail("پزشک یافت نشد", 404)
  await deleteDoctor(ctx.store.id, doctor.id)
  return NextResponse.json({ success: true })
}
