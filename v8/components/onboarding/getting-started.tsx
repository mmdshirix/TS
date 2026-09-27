"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, ArrowLeft, X, Rocket, BookOpen, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Item {
  id: string
  title: string
  description: string
  href: string
  done: boolean
}

export default function GettingStarted({ compact }: { compact?: boolean }) {
  const [items, setItems] = useState<Item[] | null>(null)
  const [progress, setProgress] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch("/api/onboarding", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setItems(d.checklist?.items || [])
        setProgress(d.checklist?.progress || 0)
        setDismissed(Boolean(d.state?.dismissed_checklist) && (d.checklist?.progress || 0) >= 100)
      })
      .catch(() => setItems([]))
  }, [])

  const dismiss = async () => {
    setDismissed(true)
    await fetch("/api/onboarding", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dismissed_checklist: true }) }).catch(() => {})
  }

  if (dismissed) return null
  if (!items) return <div data-tour="checklist" className="rounded-3xl border bg-white p-6 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>

  const next = items.find((i) => !i.done)

  return (
    <motion.div data-tour="checklist" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border bg-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-gray-100"><motion.div className="h-full bg-gradient-to-l from-blue-600 to-cyan-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} /></div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white grid place-items-center shadow-lg shadow-blue-500/30"><Rocket className="w-5 h-5" /></div>
            <div>
              <h2 className="font-black text-gray-900">راه‌اندازی قدم‌به‌قدم</h2>
              <p className="text-xs text-gray-500 mt-0.5">{progress >= 100 ? "همه چیز آماده است! 🎉" : `${progress.toLocaleString("fa-IR")}٪ تکمیل شده · ${items.filter((i) => !i.done).length.toLocaleString("fa-IR")} کار باقی مانده`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/getting-started" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"><BookOpen className="w-3.5 h-3.5" /> آموزش کامل</Link>
            {progress >= 100 && <button onClick={dismiss} className="w-8 h-8 rounded-full grid place-items-center text-gray-400 hover:bg-gray-100" aria-label="بستن"><X className="w-4 h-4" /></button>}
          </div>
        </div>

        {next && !compact && (
          <Link href={next.href} className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-4 hover:bg-blue-100/60 transition group">
            <div>
              <div className="text-[11px] font-bold text-blue-600">قدم بعدی</div>
              <div className="font-bold text-gray-900">{next.title}</div>
              <div className="text-xs text-gray-600 mt-0.5">{next.description}</div>
            </div>
            <span className="w-9 h-9 rounded-full bg-blue-600 text-white grid place-items-center shrink-0 group-hover:-translate-x-1 transition"><ArrowLeft className="w-4 h-4" /></span>
          </Link>
        )}

        <ul className={cn("mt-4 grid gap-2", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          <AnimatePresence>
            {items.map((it, i) => (
              <motion.li key={it.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={it.href} className={cn("flex items-start gap-3 rounded-2xl border p-3 transition hover:border-blue-300", it.done ? "bg-gray-50/60" : "bg-white")}>
                  {it.done ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <div className={cn("text-sm font-medium", it.done ? "text-gray-500 line-through" : "text-gray-900")}>{it.title}</div>
                    {!compact && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{it.description}</div>}
                  </div>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </motion.div>
  )
}
