"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Pill, Loader2, Sparkles, AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdvisorResult {
  answer: string
  caution_level: "info" | "caution" | "see_pharmacist" | "see_doctor"
  suggested_products: Array<{ id: number; name: string; slug: string; price: number; image_url: string | null }>
  tips: string[]
}

const LEVEL: Record<AdvisorResult["caution_level"], { label: string; cls: string }> = {
  info: { label: "اطلاعات عمومی", cls: "bg-emerald-100 text-emerald-800" },
  caution: { label: "با احتیاط مصرف شود", cls: "bg-amber-100 text-amber-800" },
  see_pharmacist: { label: "مشاوره حضوری داروساز توصیه می‌شود", cls: "bg-orange-100 text-orange-800" },
  see_doctor: { label: "به پزشک مراجعه کنید", cls: "bg-red-100 text-red-800" },
}

const QUICK = ["برای سرماخوردگی چی بخرم؟", "مکمل آهن کی مصرف شود؟", "تداخل استامینوفن و ایبوپروفن", "ضدآفتاب مناسب پوست چرب", "ویتامین D روزانه چقدر؟"]

export default function PharmacistAdvisor({ compact }: { compact?: boolean }) {
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AdvisorResult | null>(null)
  const [error, setError] = useState("")

  const run = async (value?: string) => {
    const question = (value ?? q).trim()
    if (question.length < 3) return
    setQ(question)
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/pharmacy/advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) })
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
      <div aria-hidden className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blob" style={{ background: "var(--store-secondary)" }} />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 shrink-0">
            <span className="absolute inset-0 rounded-full brand-gradient animate-pulse-ring" />
            <span className="relative w-12 h-12 rounded-full brand-gradient text-white grid place-items-center"><Pill className="w-6 h-6" /></span>
          </div>
          <div>
            <h3 className="font-black text-ink">داروساز هوشمند</h3>
            <p className="text-xs text-muted mt-0.5">پاسخ سریع به سوالات دارویی، مکمل‌ها و محصولات بهداشتی بر اساس موجودی داروخانه.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} className="mt-5 space-y-3">
              <div className="flex gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && run()}
                  placeholder="سوال دارویی خود را بپرسید…"
                  className="flex-1 rounded-2xl border border-theme bg-[var(--store-bg)] px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand"
                />
                <button type="button" onClick={() => run()} disabled={loading || q.trim().length < 3} className="inline-flex items-center gap-2 rounded-2xl brand-gradient text-white px-5 py-3 text-sm font-bold disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  بپرس
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK.map((s) => (
                  <button key={s} type="button" onClick={() => run(s)} className="rounded-full border border-theme px-3 py-1.5 text-xs text-ink hover:border-brand hover:text-brand transition">
                    {s}
                  </button>
                ))}
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <p className="text-[11px] text-muted">پاسخ‌ها جایگزین مشاوره پزشک یا داروساز نیستند. دوز دارو را فقط با نظر پزشک تغییر دهید.</p>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
              <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold", LEVEL[result.caution_level]?.cls || LEVEL.info.cls)}>
                {(result.caution_level === "see_doctor" || result.caution_level === "see_pharmacist") && <AlertTriangle className="w-4 h-4" />}
                {LEVEL[result.caution_level]?.label || "اطلاعات عمومی"}
              </div>
              <p className="text-sm text-ink leading-7 whitespace-pre-line">{result.answer}</p>
              {result.tips?.length > 0 && (
                <ul className="text-sm text-ink space-y-1.5">
                  {result.tips.map((t, i) => (
                    <li key={i} className="flex gap-2"><span className="text-brand">•</span><span>{t}</span></li>
                  ))}
                </ul>
              )}
              {result.suggested_products?.length > 0 && (
                <div>
                  <div className="text-xs text-muted mb-2">محصولات مرتبط در داروخانه</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {result.suggested_products.map((p) => (
                      <Link key={p.id} href={`/product/${p.slug}`} className="flex items-center gap-3 rounded-2xl border border-theme bg-[var(--store-bg)] p-2 hover:border-brand transition">
                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0">{p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : null}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-ink line-clamp-1">{p.name}</div>
                          <div className="text-xs text-brand font-bold">{Number(p.price).toLocaleString("fa-IR")} تومان</div>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-muted mr-auto" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <button type="button" onClick={() => setResult(null)} className="inline-flex items-center gap-2 rounded-2xl border border-theme px-4 py-2.5 text-sm text-ink">
                <RotateCcw className="w-4 h-4" /> سوال جدید
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
