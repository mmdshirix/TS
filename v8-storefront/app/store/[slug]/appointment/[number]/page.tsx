import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CheckCircle2, Clock, XCircle, CalendarDays, Stethoscope, Phone } from "lucide-react"
import { getStoreBySlug } from "@/lib/db"
import { getAppointmentByNumber, getDoctorById } from "@/lib/clinic-db"
import { getCardToCardInfo } from "@/lib/commerce-db"
import { formatJalali, formatTime, parseISODate, toPersianDigits } from "@/lib/jalali"
import { formatToman } from "@/lib/landing-content"
import { buildStoreMetadata } from "@/lib/seo"
import AppointmentReceiptUpload from "@/components/clinic/receipt-upload"
import { Reveal } from "@/components/motion"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return {}
  return buildStoreMetadata(store, { path: "/appointment", title: "وضعیت نوبت", noIndex: true })
}

const STATUS: Record<string, { label: string; icon: any; cls: string }> = {
  confirmed: { label: "نوبت شما تایید شد", icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  pending_payment: { label: "در انتظار پرداخت", icon: Clock, cls: "text-amber-700 bg-amber-50 border-amber-200" },
  cancelled: { label: "نوبت لغو شد", icon: XCircle, cls: "text-red-700 bg-red-50 border-red-200" },
  completed: { label: "ویزیت انجام شد", icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  no_show: { label: "عدم حضور", icon: XCircle, cls: "text-red-700 bg-red-50 border-red-200" },
}

export default async function AppointmentPage({ params, searchParams }: { params: { slug: string; number: string }; searchParams: { status?: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()
  const appointment = await getAppointmentByNumber(store.id, params.number)
  if (!appointment) notFound()
  const doctor = appointment.doctor_id ? await getDoctorById(appointment.doctor_id) : null
  const card = appointment.payment_method === "card_to_card" ? await getCardToCardInfo(store.id) : null
  const s = STATUS[appointment.status] || STATUS.pending_payment
  const Icon = s.icon

  return (
    <div className="container py-10 max-w-2xl">
      <Reveal className={`rounded-[2rem] border p-6 sm:p-8 ${s.cls}`}>
        <div className="flex items-center gap-3">
          <Icon className="w-9 h-9" />
          <div>
            <h1 className="display text-2xl font-black">{s.label}</h1>
            <div className="text-sm opacity-80">کد نوبت: <span className="font-mono" dir="ltr">{appointment.appointment_number}</span></div>
          </div>
        </div>
        {searchParams.status === "failed" && <p className="mt-4 text-sm">پرداخت ناموفق بود. می‌توانید دوباره نوبت بگیرید.</p>}
      </Reveal>

      <Reveal delay={0.1} className="mt-5 rounded-[2rem] border border-theme bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-surface grid place-items-center overflow-hidden">
            {doctor?.photo_url ? <img src={doctor.photo_url} alt="" className="w-full h-full object-cover" /> : <Stethoscope className="w-6 h-6 text-brand" />}
          </div>
          <div>
            <div className="font-black text-ink">{doctor ? `${doctor.title ? `${doctor.title} ` : ""}${doctor.name}` : "پزشک"}</div>
            <div className="text-sm text-brand">{doctor?.specialty}</div>
          </div>
        </div>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <Row k="تاریخ" v={formatJalali(parseISODate(appointment.appointment_date))} icon={CalendarDays} />
          <Row k="ساعت" v={`${formatTime(appointment.start_time)} تا ${formatTime(appointment.end_time)}`} icon={Clock} />
          <Row k="بیمار" v={appointment.patient_name} />
          <Row k="موبایل" v={toPersianDigits(appointment.patient_phone)} />
          <Row k="هزینه ویزیت" v={Number(appointment.fee) > 0 ? formatToman(appointment.fee) : "—"} />
          <Row k="وضعیت پرداخت" v={appointment.payment_status === "paid" ? "پرداخت شده" : appointment.payment_status === "awaiting_review" ? "در انتظار تایید فیش" : appointment.payment_status === "not_required" ? "بدون پیش‌پرداخت" : "پرداخت نشده"} />
        </dl>
        {appointment.symptoms && <p className="text-sm text-muted border-t border-theme pt-3">علائم ثبت‌شده: {appointment.symptoms}</p>}
      </Reveal>

      {appointment.payment_method === "card_to_card" && appointment.payment_status !== "paid" && card && (
        <Reveal delay={0.15} className="mt-5 rounded-[2rem] border border-theme bg-card p-6 space-y-4">
          <h2 className="font-black text-ink">پرداخت کارت به کارت</h2>
          <p className="text-sm text-muted">مبلغ {formatToman(appointment.fee)} را به کارت زیر منتقل کنید و تصویر فیش را بارگذاری نمایید. پس از تایید مطب، نوبت شما قطعی می‌شود.</p>
          <div className="rounded-2xl bg-brand-surface p-4 text-sm space-y-1">
            <div className="font-mono text-lg tracking-wider text-ink" dir="ltr">{card.card_number?.replace(/(\d{4})(?=\d)/g, "$1-")}</div>
            {card.card_holder_name && <div className="text-muted">به نام: {card.card_holder_name}</div>}
            {card.card_iban && <div className="text-muted font-mono text-xs" dir="ltr">{card.card_iban}</div>}
          </div>
          <AppointmentReceiptUpload number={appointment.appointment_number} existing={appointment.receipt_image_url} />
        </Reveal>
      )}

      {store.contact_phone && (
        <a href={`tel:${store.contact_phone}`} className="mt-5 flex items-center justify-center gap-2 rounded-full border border-theme py-3 text-sm text-ink hover:border-brand">
          <Phone className="w-4 h-4 text-brand" /> تماس با مطب <span dir="ltr">{store.contact_phone}</span>
        </a>
      )}
    </div>
  )
}

function Row({ k, v, icon: Icon }: { k: string; v: string; icon?: any }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[var(--store-bg)] border border-theme px-3 py-2.5">
      {Icon && <Icon className="w-4 h-4 text-brand shrink-0" />}
      <dt className="text-muted">{k}:</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  )
}
