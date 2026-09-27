import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getAppointmentByNumber, markAppointmentPaid, markAppointmentFailed } from "@/lib/clinic-db"
import { getStorePaymentSettings } from "@/lib/commerce-db"
import { verifyZarinpalPayment } from "@/lib/payments/zarinpal"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  const { searchParams, origin } = request.nextUrl
  const number = searchParams.get("number")
  const authority = searchParams.get("Authority")
  const status = searchParams.get("Status")
  if (!store || !number) return NextResponse.redirect(`${origin}/`)

  const appointment = await getAppointmentByNumber(store.id, number)
  if (!appointment) return NextResponse.redirect(`${origin}/`)
  const to = (suffix = "") => NextResponse.redirect(`${origin}/appointment/${number}${suffix}`)

  if (appointment.payment_status === "paid") return to()

  if (status !== "OK" || !authority) {
    await markAppointmentFailed(appointment.id)
    return to("?status=failed")
  }
  const settings = await getStorePaymentSettings(store.id)
  if (!settings?.zarinpal_merchant_id) return to("?status=failed")

  const result = await verifyZarinpalPayment({ merchantId: settings.zarinpal_merchant_id, amountToman: Number(appointment.fee), authority })
  const sql = getSql()
  if (!result.success) {
    await markAppointmentFailed(appointment.id)
    await sql`UPDATE payment_transactions SET status = 'failed', updated_at = NOW() WHERE appointment_id = ${appointment.id} AND gateway = 'zarinpal'`
    return to("?status=failed")
  }
  await markAppointmentPaid(appointment.id, result.refId, "zarinpal")
  await sql`UPDATE payment_transactions SET status = 'paid', gateway_ref = ${result.refId}, updated_at = NOW() WHERE appointment_id = ${appointment.id} AND gateway = 'zarinpal'`
  return to("?status=paid")
}
