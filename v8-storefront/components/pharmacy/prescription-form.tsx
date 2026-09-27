"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Upload, X, Loader2, CheckCircle2, Truck, Store, ImagePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PharmacySettings } from "@/lib/pharmacy-db"

export default function PrescriptionForm({ settings }: { settings: PharmacySettings }) {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "", national_id: "", insurance: settings.insurance_types[0] || "", delivery: settings.delivery_enabled ? "delivery" : "pickup", address: "", notes: "" })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const phoneValid = /^09\d{9}$/.test(form.phone)
  const canSubmit = images.length > 0 && form.name.trim().length >= 3 && phoneValid && (form.delivery === "pickup" || form.address.trim().length >= 8)

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError("")
    try {
      for (const file of Array.from(files).slice(0, 5 - images.length)) {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        const data = await res.json()
        if (!res.ok || !data.url) throw new Error(data.error || "خطا در آپلود")
        setImages((prev) => [...prev, data.url])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در آپلود")
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/pharmacy/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image_urls: images }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "خطا در ثبت نسخه")
      router.push(`/prescription/${data.requestNumber}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا")
      setSubmitting(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-5">
        {/* Upload */}
        <div className="rounded-[1.75rem] border border-theme bg-card p-5">
          <div className="font-black text-ink mb-1">۱. تصویر نسخه</div>
          <p className="text-xs text-muted mb-4">عکس واضح از نسخه یا اسکرین‌شات نسخه الکترونیک (حداکثر ۵ تصویر)</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((url, i) => (
              <motion.div key={url} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative aspect-square rounded-2xl overflow-hidden border border-theme">
                <img src={url} alt={`نسخه ${i + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(images.filter((u) => u !== url))} className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white grid place-items-center"><X className="w-3.5 h-3.5" /></button>
              </motion.div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-theme grid place-items-center cursor-pointer hover:border-brand transition text-muted">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-brand" /> : <ImagePlus className="w-6 h-6 text-brand" />}
                <input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="rounded-[1.75rem] border border-theme bg-card p-5 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 font-black text-ink">۲. اطلاعات بیمار</div>
          <Field label="نام و نام خانوادگی *"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
          <Field label="شماره موبایل *" hint={form.phone && !phoneValid ? "شماره معتبر نیست" : undefined}><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })} inputMode="numeric" dir="ltr" className={inputCls} placeholder="09xxxxxxxxx" /></Field>
          <Field label="کد ملی (برای بیمه)"><input value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" dir="ltr" className={inputCls} /></Field>
          <Field label="نوع بیمه">
            <select value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })} className={inputCls}>
              {settings.insurance_types.map((i) => <option key={i} value={i}>{i}</option>)}
              <option value="آزاد">آزاد (بدون بیمه)</option>
            </select>
          </Field>
        </div>

        {/* Delivery */}
        <div className="rounded-[1.75rem] border border-theme bg-card p-5 space-y-4">
          <div className="font-black text-ink">۳. روش تحویل</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {settings.delivery_enabled && (
              <button type="button" onClick={() => setForm({ ...form, delivery: "delivery" })} className={cn("text-right rounded-2xl border p-4 transition-all", form.delivery === "delivery" ? "border-brand bg-brand-surface" : "border-theme")}>
                <Truck className="w-6 h-6 text-brand" />
                <div className="font-bold text-ink text-sm mt-2">ارسال به آدرس</div>
                <div className="text-[11px] text-muted">{settings.delivery_fee > 0 ? `هزینه ارسال ${settings.delivery_fee.toLocaleString("fa-IR")} تومان` : "ارسال رایگان"}</div>
              </button>
            )}
            <button type="button" onClick={() => setForm({ ...form, delivery: "pickup" })} className={cn("text-right rounded-2xl border p-4 transition-all", form.delivery === "pickup" ? "border-brand bg-brand-surface" : "border-theme")}>
              <Store className="w-6 h-6 text-brand" />
              <div className="font-bold text-ink text-sm mt-2">تحویل حضوری</div>
              <div className="text-[11px] text-muted">وقتی آماده شد پیامک می‌کنیم</div>
            </button>
          </div>
          {form.delivery === "delivery" && (
            <Field label="آدرس کامل *"><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className={cn(inputCls, "resize-none")} /></Field>
          )}
          <Field label="توضیحات (اختیاری)"><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} placeholder="مثلاً: داروی ژنریک هم قبول است" /></Field>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <aside className="lg:sticky lg:top-24 h-fit rounded-[1.75rem] border border-theme bg-card p-5 space-y-4">
        <div className="font-black text-ink">خلاصه درخواست</div>
        <ul className="text-sm space-y-2 text-muted">
          <li className="flex items-center gap-2">{images.length > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="w-4 h-4 rounded-full border border-theme" />} {images.length.toLocaleString("fa-IR")} تصویر نسخه</li>
          <li className="flex items-center gap-2">{form.name && phoneValid ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="w-4 h-4 rounded-full border border-theme" />} اطلاعات بیمار</li>
          <li className="flex items-center gap-2">{form.delivery === "pickup" || form.address.length >= 8 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="w-4 h-4 rounded-full border border-theme" />} روش تحویل</li>
        </ul>
        <p className="text-[11px] text-muted leading-6">پس از ثبت، داروساز نسخه را بررسی می‌کند و قیمت نهایی و زمان آماده‌سازی از طریق پیامک اعلام می‌شود.</p>
        <button type="button" onClick={submit} disabled={!canSubmit || submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-full brand-gradient text-white py-3.5 text-sm font-bold disabled:opacity-40">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} ثبت نسخه
        </button>
      </aside>
    </div>
  )
}

const inputCls = "w-full rounded-2xl border border-theme bg-[var(--store-bg)] px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-ink mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-red-600 mt-1">{hint}</span>}
    </label>
  )
}
