"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, X, Sparkles, HelpCircle } from "lucide-react"

interface Step {
  target: string
  title: string
  body: string
  /** navigate here before showing the step */
  route?: string
  placement?: "right" | "left" | "bottom" | "top"
}

const STEPS: Step[] = [
  { target: "[data-tour='welcome']", title: "به تاکسل خوش آمدید 👋", body: "این داشبورد مرکز مدیریت سایت، فروشگاه و دستیار هوشمند شماست. در چند قدم کوتاه با بخش‌های اصلی آشنا می‌شوید.", placement: "bottom" },
  { target: "[data-tour='checklist']", title: "چک‌لیست راه‌اندازی", body: "این کارت به‌صورت خودکار پیشرفت شما را دنبال می‌کند. هر کاری که انجام دهید تیک می‌خورد؛ کافی است مراحل را به ترتیب دنبال کنید.", placement: "bottom" },
  { target: "[data-tour='nav-store']", title: "فروشگاه / سایت من", body: "ساخت و ویرایش سایت، محصولات، دسته‌بندی‌ها، درگاه پرداخت، سئو و انتشار — همه از اینجا.", placement: "left" },
  { target: "[data-tour='nav-chatbot']", title: "چت‌بات هوش مصنوعی", body: "چت‌بات اختصاصی شما به‌صورت خودکار با ساخت فروشگاه ایجاد می‌شود. پایگاه دانش، پیام‌ها و آمار آن اینجاست.", placement: "left" },
  { target: "[data-tour='nav-instagram']", title: "اتوماسیون اینستاگرام", body: "با وارد کردن نام پیج، دایرکت‌های اینستاگرام را با هوش مصنوعی و ورک‌فلوهای کلیدواژه‌ای پاسخ دهید.", placement: "left" },
  { target: "[data-tour='nav-ai']", title: "دستیار هوش مصنوعی", body: "دستیار سئو، مارکتینگ، تحلیل داده و CRM؛ پیشنهادهای واقعی برای رشد کسب‌وکار شما.", placement: "left" },
  { target: "[data-tour='header-help']", title: "همیشه در دسترس", body: "هر زمان به راهنما نیاز داشتید، از این دکمه تور را دوباره ببینید یا به آموزش قدم‌به‌قدم بروید.", placement: "bottom" },
]

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export default function OnboardingTour({ initiallyCompleted }: { initiallyCompleted: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)

  const step = STEPS[index]

  // Auto-start once for first-time users, only on the dashboard home.
  useEffect(() => {
    if (!initiallyCompleted && pathname === "/dashboard") {
      const t = setTimeout(() => setActive(true), 900)
      return () => clearTimeout(t)
    }
  }, [initiallyCompleted, pathname])

  useEffect(() => {
    const onRestart = () => {
      setIndex(0)
      if (pathname !== "/dashboard") router.push("/dashboard")
      setTimeout(() => setActive(true), pathname !== "/dashboard" ? 700 : 0)
    }
    window.addEventListener("taxel:start-tour", onRestart)
    return () => window.removeEventListener("taxel:start-tour", onRestart)
  }, [pathname, router])

  const measure = useCallback(() => {
    if (!active) return
    const el = document.querySelector<HTMLElement>(step.target)
    if (!el) {
      setRect(null)
      return
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" })
    const r = el.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [active, step])

  useEffect(() => {
    measure()
    const t = setTimeout(measure, 350)
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [measure])

  const finish = async (completed = true) => {
    setActive(false)
    if (completed) {
      await fetch("/api/onboarding", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tour_completed: true }) }).catch(() => {})
    }
  }

  const next = () => (index < STEPS.length - 1 ? setIndex(index + 1) : finish(true))
  const prev = () => index > 0 && setIndex(index - 1)

  const pad = 8
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200
  const vh = typeof window !== "undefined" ? window.innerHeight : 800
  const isMobile = vw < 768
  const cardW = Math.min(360, vw - 32)

  let cardStyle: React.CSSProperties = { top: vh / 2 - 120, left: vw / 2 - cardW / 2 }
  if (rect) {
    const placement = isMobile ? "bottom" : step.placement || "bottom"
    if (placement === "left") cardStyle = { top: Math.max(16, Math.min(rect.top, vh - 260)), left: Math.max(16, rect.left - cardW - 20) }
    else if (placement === "right") cardStyle = { top: Math.max(16, Math.min(rect.top, vh - 260)), left: Math.min(vw - cardW - 16, rect.left + rect.width + 20) }
    else if (placement === "top") cardStyle = { top: Math.max(16, rect.top - 240), left: Math.max(16, Math.min(vw - cardW - 16, rect.left + rect.width / 2 - cardW / 2)) }
    else cardStyle = { top: Math.min(vh - 250, rect.top + rect.height + 16), left: Math.max(16, Math.min(vw - cardW - 16, rect.left + rect.width / 2 - cardW / 2)) }
  }

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div key="tour" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]" dir="rtl">
            {/* Spotlight mask */}
            <svg className="absolute inset-0 w-full h-full" aria-hidden>
              <defs>
                <mask id="tour-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {rect && <motion.rect animate={{ x: rect.left - pad, y: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }} transition={{ type: "spring", stiffness: 260, damping: 28 }} rx="16" fill="black" />}
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(15,23,42,0.7)" mask="url(#tour-mask)" onClick={() => finish(false)} />
            </svg>
            {rect && (
              <motion.div animate={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }} transition={{ type: "spring", stiffness: 260, damping: 28 }} className="absolute rounded-2xl ring-2 ring-white/90 shadow-[0_0_0_9999px_transparent,0_0_40px_rgba(59,130,246,.6)] pointer-events-none" />
            )}

            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ ...cardStyle, width: cardW }}
              className="absolute rounded-3xl bg-white shadow-2xl p-5 text-right"
            >
              <button onClick={() => finish(false)} className="absolute top-3 left-3 w-8 h-8 rounded-full grid place-items-center text-gray-400 hover:bg-gray-100" aria-label="بستن"><X className="w-4 h-4" /></button>
              <div className="flex items-center gap-2 text-xs text-blue-600 font-bold"><Sparkles className="w-4 h-4" /> قدم {(index + 1).toLocaleString("fa-IR")} از {STEPS.length.toLocaleString("fa-IR")}</div>
              <h3 className="text-lg font-black text-gray-900 mt-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-7 mt-1">{step.body}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-1">{STEPS.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-blue-600" : "w-1.5 bg-gray-200"}`} />)}</div>
                <div className="flex gap-2">
                  {index > 0 && <button onClick={prev} className="inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs text-gray-700"><ArrowRight className="w-3.5 h-3.5" /> قبلی</button>}
                  <button onClick={next} className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white px-4 py-2 text-xs font-bold">{index === STEPS.length - 1 ? "شروع کار" : "بعدی"} <ArrowLeft className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** Header button that restarts the tour (also exported for the tutorial page). */
export function StartTourButton({ className }: { className?: string }) {
  return (
    <button type="button" data-tour="header-help" onClick={() => window.dispatchEvent(new Event("taxel:start-tour"))} className={className || "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"}>
      <HelpCircle className="w-4 h-4 text-blue-600" /> راهنمای داشبورد
    </button>
  )
}
