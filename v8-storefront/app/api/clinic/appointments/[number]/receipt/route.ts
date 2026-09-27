import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getAppointmentByNumber, attachAppointmentReceipt } from "@/lib/clinic-db"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: { number: string } }) {
  const store = await getStoreFromRequest(request)
  if (!store) return NextResponse.json({ error: "مطب یافت نشد" }, { status: 404 })
  const appointment = await getAppointmentByNumber(store.id, params.number)
  if (!appointment || appointment.payment_method !== "card_to_card") return NextResponse.json({ error: "نوبت یافت نشد" }, { status: 404 })
  const body = await request.json().catch(() => ({}))
  if (!body.imageUrl) return NextResponse.json({ error: "تصویر فیش الزامی است" }, { status: 400 })
  await attachAppointmentReceipt(appointment.id, String(body.imageUrl))
  const sql = getSql()
  await sql`UPDATE payment_transactions SET receipt_image_url = ${String(body.imageUrl)}, status = 'awaiting_review', updated_at = NOW() WHERE appointment_id = ${appointment.id}`
  return NextResponse.json({ success: true })
}
