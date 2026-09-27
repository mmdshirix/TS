"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Loader2, AlertTriangle, Stethoscope, ArrowLeft, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface TriageResult {
  summary: string
  urgency: "low" | "medium" | "high" | "emergency"
  specialty: string
  specialty_slug?: string | null
  doctor_slug?: string | null
  doctor_name?: string | null
  advice: string[]
  red_flags?: string[]
  disclaimer?: string
}

const URGENCY: Record<TriageResult["urgency"], { label: string; cls: string }> = {
  low: { label: "غیر فوری", cls: "bg-emerald-100 text-emerald-800" },
  medium: { label: "در چند روز آینده ویزیت شوید", cls: "bg-amber-100 text-amber-800" },
  high: { label: "هر چه زودتر ویزیت شوید", cls: "bg-orange-100 text-orange-800" },
  emergency: { label: "اورژانسی — با ۱۱۵ تماس بگیرید", cls: "bg-red-100 text-red-800" },
}

const QUICK = ["سردرد و سرگیجه", "درد قفسه سینه", "تب و بدن‌درد", "جوش و لک پوستی", "درد معده", "کودکم تب دارد"]

export default function TriageWidget({ compact }: { compact?: boolean }) {
  const [text, setText] = useState("")
  const [age, setAge] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [error, setError] = useState("")

  const run = async (value?: string) => {
    const symptoms = (value ?? text).trim()
    if (symptoms.length < 3) return
    setText(symptoms)
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/clinic/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, age: age ? Number(age) : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "خطا")
      setResult(data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در دریافت پاسخ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] border border-theme bg-card", compact ? "p-5" : "p-6 sm:p-8")}>
      <div aria-hidden className="absolute -top-24 -right-24 w-64 h-64 rounded-full blob" style={{ background: "var(--store-secondary)" }} />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 shrink-0">
            <span className="absolute inset-0 rounded-full brand-gradient animate-pulse-ring" />
            <span className="relative w-12 h-12 rounded-full brand-gradient text-white grid place-items-center"><Sparkles className="w-6 h-6" /></span>
          </div>
          <div>
            <h3 className="font-black text-ink">راهنمای هوشمند انتخاب متخصص</h3>
            <p className="text-xs text-muted mt-0.5">علائم خود را بنویسید؛ دستیار هوشمند تخصص مناسب را پیشنهاد می‌دهد و شما را به رزرو نوبت هدایت می‌کند.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} className="mt-5 space-y-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={compact ? 2 : 3}
                placeholder="مثلاً: از دو روز پیش سردرد شدید همراه با حالت تهوع دارم…"
                className="w-full rounded-2xl border border-theme bg-[var(--store-bg)] px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand resize-none"
              />
              <div className="flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button key={q} type="button" onClick={() => run(q)} className="rounded-full border border-theme px-3 py-1.5 text-xs text-ink hover:border-brand hover:text-brand transition">
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  inputMode="numeric"
                  placeholder="سن (اختیاری)"
                  className="sm:w-36 rounded-2xl border border-theme bg-[var(--store-bg)] px-4 py-3 text-sm text-ink focus:outline-none focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => run()}
                  disabled={loading || text.trim().length < 3}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl brand-gradient text-white px-5 py-3 text-sm font-bold disabled:opacity-50 hover:opacity-90 transition"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
                  {loading ? "در حال تحلیل علائم…" : "پیشنهاد متخصص مناسب"}
                </button>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <p className="text-[11px] text-muted">این راهنما جایگزین تشخیص پزشک نیست. در موارد اورژانسی با ۱۱۵ تماس بگیرید.</p>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
              <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold", URGENCY[result.urgency]?.cls || URGENCY.low.cls)}>
                {result.urgency === "emergency" && <AlertTriangle className="w-4 h-4" />}
                {URGENCY[result.urgency]?.label || "غیر فوری"}
              </div>
              <p className="text-sm text-ink leading-7">{result.summary}</p>
              <div className="rounded-2xl bg-brand-surface border border-theme p-4">
                <div className="text-xs text-muted">تخصص پیشنهادی</div>
                <div className="text-lg font-black text-brand mt-0.5">{result.specialty}</div>
                {result.doctor_name && <div className="text-sm text-ink mt-1">پزشک پیشنهادی: {result.doctor_name}</div>}
              </div>
              {result.advice?.length > 0 && (
                <ul className="text-sm text-ink space-y-1.5">
                  {result.advice.map((a, i) => (
                    <li key={i} className="flex gap-2"><span className="text-brand">•</span><span>{a}</span></li>
                  ))}
                </ul>
              )}
              {result.red_flags && result.red_flags.length > 0 && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <div className="font-bold mb-1">در این موارد فوراً به اورژانس مراجعه کنید:</div>
                  <ul className="list-disc list-inside space-y-0.5">{result.red_flags.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={result.doctor_slug ? `/book/${result.doctor_slug}?symptoms=${encodeURIComponent(text)}` : `/book?specialty=${encodeURIComponent(result.specialty_slug || result.specialty)}&symptoms=${encodeURIComponent(text)}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl brand-gradient text-white px-5 py-3 text-sm font-bold"
                >
                  رزرو نوبت با {result.doctor_name ? "این پزشک" : "این تخصص"} <ArrowLeft className="w-4 h-4" />
                </Link>
                <button type="button" onClick={() => setResult(null)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-theme px-4 py-3 text-sm text-ink">
                  <RotateCcw className="w-4 h-4" /> شروع دوباره
                </button>
              </div>
              <p className="text-[11px] text-muted">{result.disclaimer || "این اطلاعات صرفاً راهنمایی اولیه است و جایگزین معاینه پزشک نیست."}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
