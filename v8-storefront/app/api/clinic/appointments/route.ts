import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getDoctorById, getClinicSettings, isSlotAvailable, createAppointment, markAppointmentFailed } from "@/lib/clinic-db"
import { getStorePaymentSettings } from "@/lib/commerce-db"
import { requestZarinpalPayment } from "@/lib/payments/zarinpal"
import { createBaleInvoiceLink } from "@/lib/payments/balepay"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) return NextResponse.json({ error: "مطب یافت نشد" }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const doctor = await getDoctorById(Number(body.doctor_id))
  if (!doctor || doctor.store_id !== store.id || !doctor.is_active) return NextResponse.json({ error: "پزشک یافت نشد" }, { status: 404 })

  const clinic = await getClinicSettings(store.id)
  if (!clinic.booking_enabled) return NextResponse.json({ error: "نوبت‌دهی غیرفعال است" }, { status: 400 })

  const patient = body.patient || {}
  const name = String(patient.name || "").trim()
  const phone = String(patient.phone || "").replace(/\s|-/g, "")
  if (name.length < 3) return NextResponse.json({ error: "نام بیمار را کامل وارد کنید" }, { status: 400 })
  if (!/^09\d{9}$/.test(phone)) return NextResponse.json({ error: "شماره موبایل معتبر نیست" }, { status: 400 })

  const date = String(body.date || "")
  const start = String(body.start || "")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(start)) return NextResponse.json({ error: "زمان انتخاب‌شده معتبر نیست" }, { status: 400 })

  const slot = await isSlotAvailable(doctor, clinic, date, start)
  if (!slot.ok) return NextResponse.json({ error: slot.error }, { status: 409 })

  const fee = Number(doctor.consultation_fee ?? clinic.default_fee ?? 0)
  const payRequired = clinic.fee_required && fee > 0
  const paymentMethod = payRequired ? (body.paymentMethod as "zarinpal" | "balepay" | "card_to_card") : null

  if (payRequired) {
    const settings = await getStorePaymentSettings(store.id)
    const enabled =
      (paymentMethod === "zarinpal" && settings?.zarinpal_enabled && settings.zarinpal_merchant_id) ||
      (paymentMethod === "balepay" && settings?.balepay_enabled && settings.balepay_bot_token) ||
      (paymentMethod === "card_to_card" && settings?.card_to_card_enabled && settings.card_number)
    if (!enabled) return NextResponse.json({ error: "روش پرداخت انتخاب‌شده فعال نیست" }, { status: 400 })
  }

  let appointment
  try {
    appointment = await createAppointment({
      store_id: store.id,
      store_slug: store.slug,
      doctor_id: doctor.id,
      patient_name: name,
      patient_phone: phone,
      patient_national_id: patient.national_id || null,
      symptoms: patient.symptoms || null,
      notes: patient.notes || null,
      appointment_date: date,
      start_time: start,
      end_time: slot.end!,
      fee,
      payment_method: paymentMethod,
      status: payRequired ? "pending_payment" : "confirmed",
    })
  } catch (e: any) {
    if (e?.code === "23505") return NextResponse.json({ error: "این نوبت همین لحظه رزرو شد. زمان دیگری انتخاب کنید." }, { status: 409 })
    console.error("[appointments]", e)
    return NextResponse.json({ error: "خطا در ثبت نوبت" }, { status: 500 })
  }

  const sql = getSql()
  if (payRequired && paymentMethod) {
    await sql`INSERT INTO payment_transactions (appointment_id, gateway, amount, status) VALUES (${appointment.id}, ${paymentMethod}, ${fee}, 'initiated')`
  }

  if (!payRequired) {
    return NextResponse.json({ appointmentNumber: appointment.appointment_number })
  }

  const settings = (await getStorePaymentSettings(store.id))!

  if (paymentMethod === "zarinpal") {
    const result = await requestZarinpalPayment({
      merchantId: settings.zarinpal_merchant_id!,
      amountToman: fee,
      description: `ویزیت ${doctor.name} — نوبت ${appointment.appointment_number}`,
      callbackUrl: `${request.nextUrl.origin}/api/payments/zarinpal/appointment?number=${appointment.appointment_number}`,
      mobile: phone,
    })
    if (!result.success) {
      await markAppointmentFailed(appointment.id)
      return NextResponse.json({ error: (result as any).error }, { status: 502 })
    }
    await sql`UPDATE payment_transactions SET gateway_ref = ${result.authority} WHERE appointment_id = ${appointment.id} AND gateway = 'zarinpal'`
    return NextResponse.json({ appointmentNumber: appointment.appointment_number, redirectUrl: result.paymentUrl })
  }

  if (paymentMethod === "balepay") {
    const result = await createBaleInvoiceLink({
      botToken: settings.balepay_bot_token!,
      title: `ویزیت ${doctor.name}`,
      description: `نوبت ${appointment.appointment_number}`,
      payload: `appointment:${appointment.appointment_number}`,
      amountToman: fee,
    })
    if (!result.success) {
      await markAppointmentFailed(appointment.id)
      return NextResponse.json({ error: (result as any).error }, { status: 502 })
    }
    return NextResponse.json({ appointmentNumber: appointment.appointment_number, invoiceLink: result.invoiceLink })
  }

  // card_to_card → customer uploads a receipt on the appointment page
  return NextResponse.json({ appointmentNumber: appointment.appointment_number })
}
