"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, Clock, User, CreditCard, Wallet, Landmark, CheckCircle2, Loader2, ChevronLeft, ChevronRight, Stethoscope, ShieldCheck } from "lucide-react"
import JalaliCalendar from "@/components/clinic/jalali-calendar"
import type { Doctor, DaySlots, ClinicSettings } from "@/lib/clinic-db"
import { formatJalali, formatTime, parseISODate } from "@/lib/jalali"
import { formatToman } from "@/lib/landing-content"
import { cn } from "@/lib/utils"

interface Props {
  doctor: Doctor
  clinic: ClinicSettings
  availability: DaySlots[]
  gateways: { zarinpal: boolean; balepay: boolean; card_to_card: boolean }
  initialSymptoms?: string
}

const STEPS = [
  { id: 1, label: "زمان", icon: CalendarDays },
  { id: 2, label: "اطلاعات", icon: User },
  { id: 3, label: "پرداخت", icon: CreditCard },
]

const GATEWAYS = {
  zarinpal: { label: "زرین‌پال", desc: "پرداخت آنلاین با کارت بانکی", icon: CreditCard },
  balepay: { label: "بله‌پی", desc: "پرداخت داخل اپ بله", icon: Wallet },
  card_to_card: { label: "کارت به کارت", desc: "ارسال فیش پرداخت", icon: Landmark },
} as const

export default function BookingFlow({ doctor, clinic, availability, gateways, initialSymptoms }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [date, setDate] = useState<string | null>(availability[0]?.date || null)
  const [slot, setSlot] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", national_id: "", symptoms: initialSymptoms || "", notes: "" })
  const [gateway, setGateway] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fee = Number(doctor.consultation_fee ?? clinic.default_fee ?? 0)
  const payRequired = clinic.fee_required && fee > 0
  const availableDates = useMemo(() => new Set(availability.filter((d) => d.slots.some((s) => s.available)).map((d) => d.date)), [availability])
  const day = availability.find((d) => d.date === date)
  const enabledGateways = (Object.keys(GATEWAYS) as Array<keyof typeof GATEWAYS>).filter((g) => gateways[g])

  useEffect(() => {
    if (!gateway && enabledGateways.length) setGateway(enabledGateways[0])
  }, [enabledGateways, gateway])

  const phoneValid = /^09\d{9}$/.test(form.phone.replace(/\s|-/g, ""))
  const canNext = step === 1 ? Boolean(date && slot) : step === 2 ? form.name.trim().length >= 3 && phoneValid : true

  const submit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/clinic/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctor.id,
          date,
          start: slot,
          patient: form,
          paymentMethod: payRequired ? gateway : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "خطا در ثبت نوبت")
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
        return
      }
      if (data.invoiceLink && (window as any).Bale?.WebApp?.openInvoice) {
        ;(window as any).Bale.WebApp.openInvoice(data.invoiceLink, () => router.push(`/appointment/${data.appointmentNumber}`))
        return
      }
      router.push(`/appointment/${data.appointmentNumber}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در ثبت نوبت")
      setSubmitting(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
      <div>
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const done = step > s.id
            const active = step === s.id
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all", active ? "brand-gradient text-white" : done ? "bg-brand-surface text-brand" : "bg-card border border-theme text-muted")}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", step > s.id ? "bg-brand" : "bg-[var(--store-border)]")} />}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid md:grid-cols-2 gap-5">
              <JalaliCalendar availableDates={availableDates} value={date} onChange={(d) => { setDate(d); setSlot(null) }} />
              <div className="rounded-[1.75rem] border border-theme bg-card p-4 sm:p-5">
                <div className="flex items-center gap-2 font-bold text-ink mb-3">
                  <Clock className="w-4 h-4 text-brand" />
                  {date ? formatJalali(parseISODate(date)) : "یک روز را انتخاب کنید"}
                </div>
                {!day ? (
                  <p className="text-sm text-muted">در این روز نوبتی وجود ندارد.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
                    {day.slots.map((s) => (
                      <motion.button
                        key={s.start}
                        type="button"
                        disabled={!s.available}
                        onClick={() => setSlot(s.start)}
                        whileTap={s.available ? { scale: 0.94 } : undefined}
                        className={cn(
                          "rounded-xl py-2.5 text-sm font-medium border transition-all",
                          slot === s.start ? "brand-gradient text-white border-transparent shadow" : s.available ? "bg-[var(--store-bg)] border-theme text-ink hover:border-brand" : "border-transparent text-muted/40 line-through cursor-not-allowed",
                        )}
                      >
                        {formatTime(s.start)}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="rounded-[1.75rem] border border-theme bg-card p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
              <Field label="نام و نام خانوادگی بیمار *">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="مثلاً: سارا محمدی" />
              </Field>
              <Field label="شماره موبایل *" hint={form.phone && !phoneValid ? "شماره باید با ۰۹ شروع شود و ۱۱ رقم باشد" : undefined}>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, "").slice(0, 11) })} inputMode="numeric" dir="ltr" className={inputCls} placeholder="09xxxxxxxxx" />
              </Field>
              <Field label="کد ملی (اختیاری)">
                <input value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" dir="ltr" className={inputCls} />
              </Field>
              <Field label="توضیحات (اختیاری)">
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} placeholder="مثلاً: بیمه تکمیلی دارم" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="علائم / دلیل مراجعه">
                  <textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} rows={3} className={cn(inputCls, "resize-none")} placeholder="کوتاه بنویسید تا پزشک قبل از ویزیت در جریان باشد" />
                </Field>
              </div>
              <p className="sm:col-span-2 text-[11px] text-muted flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand" /> اطلاعات شما فقط برای هماهنگی نوبت استفاده می‌شود و محرمانه می‌ماند.</p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="rounded-[1.75rem] border border-theme bg-card p-5 sm:p-6 space-y-4">
              {payRequired ? (
                enabledGateways.length === 0 ? (
                  <p className="text-sm text-red-600">هیچ درگاه پرداختی برای این مطب فعال نیست. لطفاً تلفنی هماهنگ کنید.</p>
                ) : (
                  <>
                    <div className="font-bold text-ink">روش پرداخت هزینه ویزیت</div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {enabledGateways.map((g) => {
                        const meta = GATEWAYS[g]
                        const Icon = meta.icon
                        return (
                          <button key={g} type="button" onClick={() => setGateway(g)} className={cn("text-right rounded-2xl border p-4 transition-all", gateway === g ? "border-brand bg-brand-surface shadow" : "border-theme hover:border-brand/50")}>
                            <Icon className={cn("w-6 h-6", gateway === g ? "text-brand" : "text-muted")} />
                            <div className="font-bold text-ink mt-2 text-sm">{meta.label}</div>
                            <div className="text-[11px] text-muted mt-0.5">{meta.desc}</div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )
              ) : (
                <div className="rounded-2xl bg-brand-surface p-4 text-sm text-ink flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand" /> این نوبت نیاز به پیش‌پرداخت ندارد. با تایید، نوبت شما ثبت می‌شود.
                </div>
              )}
              {clinic.cancellation_policy && <p className="text-[11px] text-muted leading-6">{clinic.cancellation_policy}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="inline-flex items-center gap-1 rounded-full border border-theme px-5 py-2.5 text-sm text-ink disabled:opacity-40">
            <ChevronRight className="w-4 h-4" /> قبلی
          </button>
          {step < 3 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="inline-flex items-center gap-1 rounded-full brand-gradient text-white px-6 py-2.5 text-sm font-bold disabled:opacity-40">
              ادامه <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting || (payRequired && !gateway)} className="inline-flex items-center gap-2 rounded-full brand-gradient text-white px-6 py-2.5 text-sm font-bold disabled:opacity-40">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {payRequired ? `پرداخت ${formatToman(fee)} و ثبت نوبت` : "ثبت نهایی نوبت"}
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 h-fit rounded-[1.75rem] border border-theme bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-surface grid place-items-center shrink-0">
            {doctor.photo_url ? <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover" /> : <Stethoscope className="w-6 h-6 text-brand" />}
          </div>
          <div>
            <div className="font-black text-ink">{doctor.title ? `${doctor.title} ` : ""}{doctor.name}</div>
            <div className="text-sm text-brand">{doctor.specialty}</div>
          </div>
        </div>
        <dl className="text-sm space-y-2">
          <Row k="تاریخ" v={date ? formatJalali(parseISODate(date)) : "—"} />
          <Row k="ساعت" v={slot ? formatTime(slot) : "—"} />
          <Row k="مدت ویزیت" v={`${(doctor.visit_duration_min || clinic.slot_minutes).toLocaleString("fa-IR")} دقیقه`} />
          {form.name && <Row k="بیمار" v={form.name} />}
        </dl>
        <div className="border-t border-theme pt-3 flex items-center justify-between">
          <span className="text-sm text-muted">هزینه ویزیت</span>
          <span className="font-black text-brand">{payRequired ? formatToman(fee) : fee > 0 ? `${formatToman(fee)} (در محل)` : "رایگان"}</span>
        </div>
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  )
}
