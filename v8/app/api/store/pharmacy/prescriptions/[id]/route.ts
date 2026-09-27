import { NextResponse, type NextRequest } from "next/server"
import { requireStore, fail } from "@/lib/store-route"
import { updatePrescription, PRESCRIPTION_STATUSES } from "@/lib/pharmacy-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  if (body.status && !PRESCRIPTION_STATUSES.some((s) => s.id === body.status)) return fail("وضعیت نامعتبر است")
  await updatePrescription(ctx.store.id, Number(params.id), {
    status: body.status,
    pharmacist_note: body.pharmacist_note,
    total_amount: body.total_amount !== undefined && body.total_amount !== "" ? Number(body.total_amount) : undefined,
    payment_status: body.payment_status,
  })
  return NextResponse.json({ success: true })
}
