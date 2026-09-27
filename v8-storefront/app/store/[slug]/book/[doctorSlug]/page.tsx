import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Stethoscope, BadgeCheck, ChevronRight } from "lucide-react"
import { getStoreBySlug } from "@/lib/db"
import { getDoctorBySlug, getClinicSettings, getDoctorAvailability } from "@/lib/clinic-db"
import { getStorePaymentSettings } from "@/lib/commerce-db"
import { buildStoreMetadata, BreadcrumbJsonLd, storeBaseUrl } from "@/lib/seo"
import BookingFlow from "@/components/clinic/booking-flow"
import { Reveal } from "@/components/motion"

export async function generateMetadata({ params }: { params: { slug: string; doctorSlug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return {}
  const doctor = await getDoctorBySlug(store.id, params.doctorSlug)
  return buildStoreMetadata(store, {
    path: `/book/${params.doctorSlug}`,
    title: doctor ? `نوبت ${doctor.title || "دکتر"} ${doctor.name} — ${doctor.specialty}` : "رزرو نوبت",
    description: doctor?.bio || undefined,
    image: doctor?.photo_url,
  })
}

export default async function DoctorBookingPage({ params, searchParams }: { params: { slug: string; doctorSlug: string }; searchParams: { symptoms?: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()
  const doctor = await getDoctorBySlug(store.id, params.doctorSlug)
  if (!doctor) notFound()

  const [clinic, payment] = await Promise.all([getClinicSettings(store.id), getStorePaymentSettings(store.id)])
  const availability = await getDoctorAvailability(doctor, clinic)
  const gateways = {
    zarinpal: Boolean(payment?.zarinpal_enabled && payment.zarinpal_merchant_id),
    balepay: Boolean(payment?.balepay_enabled && payment.balepay_bot_token),
    card_to_card: Boolean(payment?.card_to_card_enabled && payment.card_number),
  }
  const base = storeBaseUrl(store)

  return (
    <div className="container py-8 sm:py-10">
      <BreadcrumbJsonLd items={[{ name: store.name, url: base }, { name: "رزرو نوبت", url: `${base}/book` }, { name: doctor.name, url: `${base}/book/${doctor.slug}` }]} />
      <nav className="text-xs text-muted flex items-center gap-1 mb-6">
        <Link href="/" className="hover:text-brand">خانه</Link><ChevronRight className="w-3 h-3" />
        <Link href="/book" className="hover:text-brand">رزرو نوبت</Link><ChevronRight className="w-3 h-3" />
        <span className="text-ink">{doctor.name}</span>
      </nav>

      <Reveal className="rounded-[2rem] border border-theme bg-card p-5 sm:p-6 mb-6 flex flex-col sm:flex-row gap-5">
        <div className="w-28 h-28 shrink-0 rounded-3xl overflow-hidden bg-brand-surface grid place-items-center">
          {doctor.photo_url ? <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover" /> : <Stethoscope className="w-10 h-10 text-brand" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2"><h1 className="display text-2xl font-black text-ink">{doctor.title ? `${doctor.title} ` : ""}{doctor.name}</h1><BadgeCheck className="w-5 h-5 text-brand" /></div>
          <div className="text-brand font-bold mt-1">{doctor.specialty}</div>
          {doctor.medical_council_no && <div className="text-xs text-muted mt-1">شماره نظام پزشکی: {doctor.medical_council_no}</div>}
          {doctor.bio && <p className="text-sm text-muted leading-7 mt-3">{doctor.bio}</p>}
        </div>
      </Reveal>

      {!clinic.booking_enabled ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">نوبت‌دهی آنلاین در حال حاضر غیرفعال است.</div>
      ) : availability.length === 0 ? (
        <div className="rounded-[1.75rem] border border-theme bg-card p-10 text-center text-muted">برای این پزشک هنوز برنامه زمانی ثبت نشده است. لطفاً با مطب تماس بگیرید.</div>
      ) : (
        <BookingFlow doctor={doctor} clinic={clinic} availability={availability} gateways={gateways} initialSymptoms={searchParams.symptoms} />
      )}
    </div>
  )
}
