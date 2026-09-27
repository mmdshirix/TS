import { NextResponse, type NextRequest } from "next/server"
import { requireStore, fail } from "@/lib/store-route"
import { updateAppointmentStatus } from "@/lib/clinic-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ALLOWED = ["pending_payment", "confirmed", "cancelled", "completed", "no_show"]

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  if (!ALLOWED.includes(body.status)) return fail("وضعیت نامعتبر است")
  await updateAppointmentStatus(ctx.store.id, Number(params.id), body.status, body.payment_status)
  return NextResponse.json({ success: true })
}
