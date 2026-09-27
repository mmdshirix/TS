import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Upload, ShieldCheck, Clock } from "lucide-react"
import { getStoreBySlug } from "@/lib/db"
import { getPharmacySettings } from "@/lib/pharmacy-db"
import { buildStoreMetadata } from "@/lib/seo"
import PrescriptionForm from "@/components/pharmacy/prescription-form"
import { Reveal } from "@/components/motion"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return {}
  return buildStoreMetadata(store, { path: "/prescription", title: "ارسال نسخه آنلاین", description: `ارسال نسخه به ${store.name} و تحویل دارو در محل` })
}

export default async function PrescriptionPage({ params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()
  const settings = await getPharmacySettings(store.id)

  return (
    <div className="container py-10">
      <Reveal className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-brand">نسخه آنلاین</span>
          <h1 className="display text-3xl sm:text-4xl font-black text-ink mt-2">ارسال نسخه</h1>
          <p className="text-muted mt-2 max-w-xl">تصویر نسخه را بفرستید؛ داروساز بررسی می‌کند، قیمت را اعلام می‌کند و دارو {settings.delivery_enabled ? "درِ خانه تحویل می‌شود" : "برای تحویل حضوری آماده می‌شود"}.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-theme px-3 py-1.5 text-ink"><ShieldCheck className="w-4 h-4 text-brand" /> محرمانه</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-theme px-3 py-1.5 text-ink"><Clock className="w-4 h-4 text-brand" /> پاسخ سریع</span>
        </div>
      </Reveal>

      {!settings.accepts_prescriptions ? (
        <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 flex items-center gap-3"><Upload className="w-5 h-5" /> این داروخانه در حال حاضر نسخه آنلاین نمی‌پذیرد.</div>
      ) : (
        <PrescriptionForm settings={settings} />
      )}
    </div>
  )
}
