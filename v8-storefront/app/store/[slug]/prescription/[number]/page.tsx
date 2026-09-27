import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CheckCircle2, Clock, Pill, Truck, Phone } from "lucide-react"
import { getStoreBySlug } from "@/lib/db"
import { getPrescriptionByNumber, PRESCRIPTION_STATUS_LABELS } from "@/lib/pharmacy-db"
import { buildStoreMetadata } from "@/lib/seo"
import { formatToman } from "@/lib/landing-content"
import { Reveal } from "@/components/motion"
import { cn } from "@/lib/utils"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return {}
  return buildStoreMetadata(store, { path: "/prescription", title: "پیگیری نسخه", noIndex: true })
}

const ORDER = ["received", "reviewing", "ready", "delivering", "delivered"]

export default async function PrescriptionStatusPage({ params }: { params: { slug: string; number: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()
  const rx = await getPrescriptionByNumber(store.id, params.number)
  if (!rx) notFound()
  const idx = ORDER.indexOf(rx.status)
  const steps = rx.delivery_method === "delivery" ? ORDER : ORDER.filter((s) => s !== "delivering")

  return (
    <div className="container py-10 max-w-2xl">
      <Reveal className="rounded-[2rem] border border-theme bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl brand-gradient text-white grid place-items-center"><Pill className="w-6 h-6" /></div>
          <div>
            <h1 className="display text-2xl font-black text-ink">{rx.status === "rejected" ? "نسخه نیاز به اصلاح دارد" : "نسخه شما ثبت شد"}</h1>
            <div className="text-sm text-muted">کد پیگیری: <span className="font-mono" dir="ltr">{rx.request_number}</span></div>
          </div>
        </div>

        {rx.status !== "rejected" && (
          <ol className="mt-8 relative border-r-2 border-theme mr-3 space-y-6">
            {steps.map((s, i) => {
              const done = idx >= ORDER.indexOf(s)
              const current = rx.status === s
              return (
                <li key={s} className="pr-6 relative">
                  <span className={cn("absolute -right-[11px] top-0.5 w-5 h-5 rounded-full grid place-items-center border-2", done ? "bg-brand border-brand text-white" : "bg-card border-theme")}>
                    {done ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-[var(--store-border)]" />}
                  </span>
                  <div className={cn("text-sm font-bold", done ? "text-ink" : "text-muted")}>{PRESCRIPTION_STATUS_LABELS[s]}</div>
                  {current && <div className="text-xs text-brand mt-0.5">وضعیت فعلی</div>}
                </li>
              )
            })}
          </ol>
        )}

        {rx.pharmacist_note && (
          <div className="mt-6 rounded-2xl bg-brand-surface border border-theme p-4 text-sm text-ink">
            <div className="text-xs text-muted mb-1">یادداشت داروساز</div>
            {rx.pharmacist_note}
          </div>
        )}

        <dl className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
          <Row k="بیمار" v={rx.customer_name} />
          <Row k="تحویل" v={rx.delivery_method === "delivery" ? "ارسال به آدرس" : "حضوری"} icon={Truck} />
          {rx.insurance_type && <Row k="بیمه" v={rx.insurance_type} />}
          {rx.total_amount !== null && rx.total_amount !== undefined && <Row k="مبلغ نهایی" v={formatToman(rx.total_amount)} />}
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          {rx.image_urls.map((u, i) => (
            <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-xl overflow-hidden border border-theme"><img src={u} alt={`نسخه ${i + 1}`} className="w-full h-full object-cover" /></a>
          ))}
        </div>
      </Reveal>

      {store.contact_phone && (
        <a href={`tel:${store.contact_phone}`} className="mt-5 flex items-center justify-center gap-2 rounded-full border border-theme py-3 text-sm text-ink hover:border-brand">
          <Phone className="w-4 h-4 text-brand" /> تماس با داروخانه <span dir="ltr">{store.contact_phone}</span>
        </a>
      )}
    </div>
  )
}

function Row({ k, v, icon: Icon }: { k: string; v: string; icon?: any }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[var(--store-bg)] border border-theme px-3 py-2.5">
      {Icon ? <Icon className="w-4 h-4 text-brand shrink-0" /> : <Clock className="w-4 h-4 text-brand shrink-0 opacity-0" />}
      <dt className="text-muted">{k}:</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  )
}
