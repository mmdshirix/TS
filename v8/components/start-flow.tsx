"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowLeft, CheckCircle2, Loader2, Wand2, Store, Palette, Package, Search, Bot, LogIn, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  label: string
  type: "text" | "choice" | "multi"
  options?: string[]
  placeholder?: string
  required?: boolean
}
interface IntakeView {
  prompt: string
  detected: { category: string; categoryLabel: string; storeName?: string | null; description?: string | null; features?: string[] }
  answers: Array<{ id: string; label: string; value: string }>
  stage: number
  questions: Question[][]
  status: string
}

const BUILD_STEPS = [
  { icon: Store, label: "ساخت سایت و انتخاب قالب اختصاصی" },
  { icon: Palette, label: "اعمال رنگ و سبک برند" },
  { icon: Package, label: "ایجاد دسته‌بندی‌ها و محصولات نمونه" },
  { icon: Bot, label: "راه‌اندازی دستیار هوشمند و پایگاه دانش" },
  { icon: Search, label: "تنظیم سئو و نقشه سایت" },
]

export default function StartFlow({ token, initialPrompt, intake, user }: { token: string | null; initialPrompt: string; intake: IntakeView | null; user: { id: number; first_name: string } | null }) {
  const router = useRouter()
  const [prompt, setPrompt] = useState(initialPrompt)
  const [starting, setStarting] = useState(false)
  const [data, setData] = useState<IntakeView | null>(intake)
  const [currentToken, setCurrentToken] = useState<string | null>(token)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [saving, setSaving] = useState(false)
  const [building, setBuilding] = useState(false)
  const [buildStep, setBuildStep] = useState(0)
  const [error, setError] = useState("")

  const stageQuestions = useMemo(() => (data ? data.questions[data.stage] || [] : []), [data])
  const done = Boolean(data && (data.status === "ready" || data.status === "claimed" || data.stage >= data.questions.length))
  const nextUrl = currentToken ? `/start?intake=${currentToken}` : "/start"

  // Signed-in user with a finished intake → build automatically.
  useEffect(() => {
    if (user && done && currentToken && !building && data?.status !== "built") {
      build()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, done, currentToken])

  const start = async () => {
    if (prompt.trim().length < 5) return
    setStarting(true)
    setError("")
    try {
      const res = await fetch("/api/intake/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, source: "platform" }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "خطا")
      setCurrentToken(d.token)
      window.history.replaceState(null, "", `/start?intake=${d.token}`)
      const full = await fetch(`/api/intake/${d.token}`).then((r) => r.json())
      setData({ prompt, detected: full.detected, answers: full.answers, stage: full.stage, questions: (await fetchQuestions(d.token)) as any, status: full.status })
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا")
    } finally {
      setStarting(false)
    }
  }

  // The GET endpoint returns only the current stage; rebuild the stages array by
  // reading stage-by-stage is unnecessary — the start response already gives stage 0,
  // and answer responses return the next stage. We keep a local array and fill it.
  async function fetchQuestions(tok: string): Promise<Question[][]> {
    const full = await fetch(`/api/intake/${tok}`).then((r) => r.json())
    const arr: Question[][] = []
    arr[full.stage] = full.questions
    for (let i = 0; i < full.totalStages; i += 1) if (!arr[i]) arr[i] = []
    return arr
  }

  const submitStage = async () => {
    if (!currentToken || !data) return
    for (const q of stageQuestions) if (q.required && !answers[q.id]) return setError("لطفاً فیلدهای ضروری را پر کنید")
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/intake/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: currentToken, answers }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "خطا")
      const qs = [...data.questions]
      qs[d.stage] = d.questions
      setData({ ...data, detected: d.detected, stage: d.stage, questions: qs, status: d.done ? "ready" : "answering", answers: d.summary?.answers || data.answers })
      setAnswers({})
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا")
    } finally {
      setSaving(false)
    }
  }

  const build = async () => {
    if (!currentToken) return
    setBuilding(true)
    setError("")
    const ticker = setInterval(() => setBuildStep((s) => Math.min(s + 1, BUILD_STEPS.length - 1)), 1400)
    try {
      const res = await fetch("/api/intake/build", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: currentToken }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "خطا در ساخت سایت")
      setBuildStep(BUILD_STEPS.length)
      setTimeout(() => router.push(d.redirect || "/dashboard"), 900)
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا")
      setBuilding(false)
    } finally {
      clearInterval(ticker)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#0b1a3a_0%,_#020617_60%)] text-white" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 grid place-items-center shadow-lg shadow-blue-500/40"><Sparkles className="w-5 h-5" /></div>
          <div>
            <div className="font-black text-lg">Taxel</div>
            <div className="text-xs text-white/60">سایت‌ساز هوشمند</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* 0. No intake yet */}
          {!data && (
            <motion.div key="prompt" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <h1 className="text-3xl sm:text-5xl font-black leading-tight">فقط بگو چی می‌خوای بسازیم</h1>
              <p className="text-white/70 leading-8">مثلاً: «سایت نوبت‌دهی برای مطب پوست»، «فروشگاه برای پیج اینستاگرام مانتو»، «داروخانه آنلاین با ارسال دارو».</p>
              <div className="rounded-3xl p-[1px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 shadow-[0_0_60px_-15px_rgba(59,130,246,.8)]">
                <div className="rounded-[calc(1.5rem-1px)] bg-slate-950 p-2 flex flex-col sm:flex-row gap-2">
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder="سایت من برای ..." className="flex-1 bg-transparent resize-none px-4 py-3 text-base focus:outline-none placeholder:text-white/30" />
                  <button onClick={start} disabled={starting || prompt.trim().length < 5} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 font-bold disabled:opacity-40">
                    {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />} بساز
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-300">{error}</p>}
            </motion.div>
          )}

          {/* 1. Answering stages */}
          {data && !done && (
            <motion.div key={`stage-${data.stage}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              <DetectedCard data={data} />
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-5">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>چند سوال کوتاه — مرحله {(data.stage + 1).toLocaleString("fa-IR")} از {data.questions.length.toLocaleString("fa-IR")}</span>
                  <span className="flex gap-1">{data.questions.map((_, i) => <span key={i} className={cn("h-1.5 rounded-full", i <= data.stage ? "w-6 bg-cyan-400" : "w-2 bg-white/20")} />)}</span>
                </div>
                {stageQuestions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-bold mb-2">{q.label}{q.required && <span className="text-cyan-400"> *</span>}</label>
                    {q.type === "text" && <input value={(answers[q.id] as string) || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder={q.placeholder} className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400" />}
                    {q.type === "choice" && (
                      <div className="flex flex-wrap gap-2">{q.options?.map((o) => <button key={o} type="button" onClick={() => setAnswers({ ...answers, [q.id]: o })} className={cn("rounded-full px-4 py-2 text-sm border transition", answers[q.id] === o ? "bg-cyan-400 text-slate-900 border-cyan-400 font-bold" : "border-white/20 hover:border-white/50")}>{o}</button>)}</div>
                    )}
                    {q.type === "multi" && (
                      <div className="flex flex-wrap gap-2">{q.options?.map((o) => { const cur = (answers[q.id] as string[]) || []; const on = cur.includes(o); return <button key={o} type="button" onClick={() => setAnswers({ ...answers, [q.id]: on ? cur.filter((x) => x !== o) : [...cur, o] })} className={cn("rounded-full px-4 py-2 text-sm border transition", on ? "bg-cyan-400 text-slate-900 border-cyan-400 font-bold" : "border-white/20 hover:border-white/50")}>{o}</button> })}</div>
                    )}
                  </div>
                ))}
                {error && <p className="text-sm text-red-300">{error}</p>}
                <div className="flex justify-end">
                  <button onClick={submitStage} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-bold disabled:opacity-40">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} ادامه <ArrowLeft className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. Ready — need sign in */}
          {data && done && !user && (
            <motion.div key="auth" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <DetectedCard data={data} final />
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 grid place-items-center"><CheckCircle2 className="w-7 h-7" /></div>
                <h2 className="text-2xl font-black">همه چیز آماده است!</h2>
                <p className="text-white/70 text-sm leading-7">برای دریافت سایتتان، یک حساب کاربری بسازید یا وارد شوید. بلافاصله بعد از ورود، سایت شما ساخته و آماده می‌شود.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href={`/login?tab=register&next=${encodeURIComponent(nextUrl)}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 font-bold"><UserPlus className="w-4 h-4" /> ثبت‌نام و دریافت سایت</Link>
                  <Link href={`/login?next=${encodeURIComponent(nextUrl)}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3"><LogIn className="w-4 h-4" /> قبلاً حساب دارم</Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. Building */}
          {data && done && user && (
            <motion.div key="build" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <DetectedCard data={data} final />
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8">
                <h2 className="text-xl font-black mb-1">{user.first_name} عزیز، سایت شما در حال ساخت است…</h2>
                <p className="text-white/60 text-sm mb-6">چند ثانیه صبر کنید؛ بعد از پایان به داشبورد منتقل می‌شوید.</p>
                <ul className="space-y-3">
                  {BUILD_STEPS.map((s, i) => {
                    const state = i < buildStep ? "done" : i === buildStep && building ? "active" : "todo"
                    return (
                      <li key={s.label} className="flex items-center gap-3">
                        <span className={cn("w-9 h-9 rounded-full grid place-items-center border", state === "done" ? "bg-emerald-500 border-emerald-500" : state === "active" ? "border-cyan-400 text-cyan-400" : "border-white/15 text-white/30")}>
                          {state === "done" ? <CheckCircle2 className="w-5 h-5" /> : state === "active" ? <Loader2 className="w-4 h-4 animate-spin" /> : <s.icon className="w-4 h-4" />}
                        </span>
                        <span className={cn("text-sm", state === "todo" ? "text-white/40" : "text-white")}>{s.label}</span>
                      </li>
                    )
                  })}
                </ul>
                {error && (
                  <div className="mt-5 space-y-3">
                    <p className="text-sm text-red-300">{error}</p>
                    <button onClick={build} className="rounded-full border border-white/20 px-5 py-2 text-sm">تلاش دوباره</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DetectedCard({ data, final }: { data: IntakeView; final?: boolean }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 border border-cyan-400/20 p-5">
      <div className="text-xs text-cyan-300 font-bold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> {final ? "خلاصه سایت شما" : "متوجه شدم!"}</div>
      <p className="text-white/80 text-sm mt-2 leading-7">«{data.prompt}»</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-white/10 px-3 py-1">قالب: <b>{data.detected.categoryLabel}</b></span>
        {(data.detected.storeName || data.answers.find((a) => a.id === "name")) && <span className="rounded-full bg-white/10 px-3 py-1">نام: <b>{data.detected.storeName || data.answers.find((a) => a.id === "name")?.value}</b></span>}
        {data.detected.features?.slice(0, 3).map((f) => <span key={f} className="rounded-full bg-white/10 px-3 py-1">{f}</span>)}
      </div>
      {final && data.answers.length > 0 && (
        <dl className="mt-4 grid sm:grid-cols-2 gap-2 text-xs">
          {data.answers.map((a) => <div key={a.id} className="rounded-xl bg-black/20 px-3 py-2"><dt className="text-white/50">{a.label}</dt><dd className="text-white mt-0.5">{a.value}</dd></div>)}
        </dl>
      )}
    </div>
  )
}
