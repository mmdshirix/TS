import { NextResponse, type NextRequest } from "next/server"
import { requireStore, fail } from "@/lib/store-route"
import { listDoctors, createDoctor, replaceSchedules } from "@/lib/clinic-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  return NextResponse.json({ doctors: await listDoctors(ctx.store.id) })
}

export async function POST(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  if (!body.name?.trim()) return fail("نام پزشک الزامی است")
  try {
    const doctor = await createDoctor(ctx.store.id, {
      name: body.name,
      title: body.title,
      specialty: body.specialty,
      bio: body.bio,
      photo_url: body.photo_url,
      medical_council_no: body.medical_council_no,
      consultation_fee: body.consultation_fee === "" || body.consultation_fee === null ? null : Number(body.consultation_fee),
      visit_duration_min: Number(body.visit_duration_min) || 20,
      keywords: body.keywords,
      is_active: body.is_active ?? true,
    })
    if (Array.isArray(body.schedules)) doctor.schedules = await replaceSchedules(doctor.id, body.schedules)
    return NextResponse.json({ doctor }, { status: 201 })
  } catch (e) {
    return fail(e instanceof Error ? e.message : "خطا در ثبت پزشک", 500)
  }
}
