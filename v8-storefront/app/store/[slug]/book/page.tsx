import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Stethoscope, ArrowLeft, BadgeCheck, Clock } from "lucide-react"
import { getStoreBySlug } from "@/lib/db"
import { listDoctors, getClinicSettings } from "@/lib/clinic-db"
import { buildStoreMetadata } from "@/lib/seo"
import { formatToman } from "@/lib/landing-content"
import { Reveal, Stagger, StaggerItem } from "@/components/motion"
import TriageWidget from "@/components/clinic/triage-widget"
import { cn } from "@/lib/utils"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return {}
  return buildStoreMetadata(store, { path: "/book", title: "رزرو نوبت آنلاین", description: `رزرو نوبت آنلاین ${store.name} با تقویم شمسی و پرداخت ویزیت` })
}

export default async function BookIndexPage({ params, searchParams }: { params: { slug: string }; searchParams: { specialty?: string; symptoms?: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()
  const [doctors, clinic] = await Promise.all([listDoctors(store.id), getClinicSettings(store.id)])
  const specialties = Array.from(new Set(doctors.map((d) => d.specialty)))
  const active = searchParams.specialty ? doctors.filter((d) => d.specialty === searchParams.specialty || d.specialty_slug === searchParams.specialty) : doctors
  const symptomsQs = searchParams.symptoms ? `?symptoms=${encodeURIComponent(searchParams.symptoms)}` : ""

  return (
    <div className="container py-10">
      <Reveal className="mb-8">
        <span className="text-xs font-bold tracking-widest text-brand">نوبت‌دهی آنلاین</span>
        <h1 className="display text-3xl sm:text-4xl font-black text-ink mt-2">انتخاب پزشک</h1>
        <p className="text-muted mt-2">پزشک مورد نظر را انتخاب کنید، سپس روز و ساعت را از تقویم شمسی برگزینید.</p>
      </Reveal>

      {!clinic.booking_enabled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 mb-6">نوبت‌دهی آنلاین در حال حاضر غیرفعال است. لطفاً تلفنی هماهنگ کنید.</div>
      )}

      {specialties.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/book" className={cn("rounded-full border px-4 py-1.5 text-sm", !searchParams.specialty ? "brand-gradient text-white border-transparent" : "border-theme text-ink")}>همه</Link>
          {specialties.map((s) => (
            <Link key={s} href={`/book?specialty=${encodeURIComponent(s)}${searchParams.symptoms ? `&symptoms=${encodeURIComponent(searchParams.symptoms)}` : ""}`} className={cn("rounded-full border px-4 py-1.5 text-sm", searchParams.specialty === s ? "brand-gradient text-white border-transparent" : "border-theme text-ink hover:border-brand")}>
              {s}
            </Link>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div>
          {active.length === 0 ? (
            <div className="rounded-[1.75rem] border border-theme bg-card p-10 text-center text-muted">هنوز پزشکی برای این تخصص ثبت نشده است.</div>
          ) : (
            <Stagger className="grid sm:grid-cols-2 gap-4">
              {active.map((d) => (
                <StaggerItem key={d.id}>
                  <Link href={`/book/${d.slug}${symptomsQs}`} className="group flex gap-4 rounded-[1.75rem] border border-theme bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-brand h-full">
                    <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-brand-surface grid place-items-center">
                      {d.photo_url ? <img src={d.photo_url} alt={d.name} className="w-full h-full object-cover" /> : <Stethoscope className="w-8 h-8 text-brand" />}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col">
                      <div className="flex items-center gap-1.5"><h2 className="font-black text-ink line-clamp-1">{d.title ? `${d.title} ` : ""}{d.name}</h2><BadgeCheck className="w-4 h-4 text-brand shrink-0" /></div>
                      <div className="text-sm text-brand font-medium">{d.specialty}</div>
                      {d.bio && <p className="text-xs text-muted line-clamp-2 mt-1.5">{d.bio}</p>}
                      <div className="mt-auto pt-3 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-muted"><Clock className="w-3.5 h-3.5" /> {(d.visit_duration_min || clinic.slot_minutes).toLocaleString("fa-IR")} دقیقه · {d.consultation_fee || clinic.default_fee ? formatToman(d.consultation_fee ?? clinic.default_fee) : "ویزیت"}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-brand">رزرو <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /></span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
        {clinic.ai_triage_enabled && (
          <aside className="lg:sticky lg:top-24 h-fit">
            <TriageWidget compact />
          </aside>
        )}
      </div>
    </div>
  )
}
