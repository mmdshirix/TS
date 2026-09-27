"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { JALALI_MONTHS, JALALI_WEEKDAYS_SHORT, jalaliMonthLength, toGregorian, toJalali, toISODate, persianWeekday } from "@/lib/jalali"
import { cn } from "@/lib/utils"

interface Props {
  /** ISO dates that have at least one open slot */
  availableDates: Set<string>
  value: string | null
  onChange: (iso: string) => void
  minDate?: Date
}

export default function JalaliCalendar({ availableDates, value, onChange, minDate = new Date() }: Props) {
  const today = toJalali(new Date())
  const [view, setView] = useState({ jy: today.jy, jm: today.jm })
  const [dir, setDir] = useState(1)

  const cells = useMemo(() => {
    const len = jalaliMonthLength(view.jy, view.jm)
    const first = toGregorian(view.jy, view.jm, 1)
    const offset = persianWeekday(first)
    const list: Array<{ iso: string; jd: number; date: Date } | null> = Array.from({ length: offset }, () => null)
    for (let d = 1; d <= len; d += 1) {
      const date = toGregorian(view.jy, view.jm, d)
      list.push({ iso: toISODate(date), jd: d, date })
    }
    return list
  }, [view])

  const move = (delta: number) => {
    setDir(delta)
    setView((v) => {
      let jm = v.jm + delta
      let jy = v.jy
      if (jm > 12) {
        jm = 1
        jy += 1
      }
      if (jm < 1) {
        jm = 12
        jy -= 1
      }
      return { jy, jm }
    })
  }

  const min = new Date(minDate)
  min.setHours(0, 0, 0, 0)
  const canGoBack = !(view.jy === today.jy && view.jm === today.jm)

  return (
    <div className="rounded-[1.75rem] border border-theme bg-card p-4 sm:p-5 select-none">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => move(-1)} disabled={!canGoBack} className="w-9 h-9 rounded-xl border border-theme grid place-items-center disabled:opacity-30 hover:border-brand transition" aria-label="ماه قبل">
          <ChevronRight className="w-4 h-4" />
        </button>
        <AnimatePresence mode="wait">
          <motion.div key={`${view.jy}-${view.jm}`} initial={{ opacity: 0, x: dir * 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -dir * 12 }} transition={{ duration: 0.2 }} className="font-black text-ink">
            {JALALI_MONTHS[view.jm - 1]} {view.jy.toLocaleString("fa-IR")}
          </motion.div>
        </AnimatePresence>
        <button type="button" onClick={() => move(1)} className="w-9 h-9 rounded-xl border border-theme grid place-items-center hover:border-brand transition" aria-label="ماه بعد">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted mb-2">
        {JALALI_WEEKDAYS_SHORT.map((w, i) => (
          <div key={w} className={cn("py-1", i === 6 && "text-red-500")}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) => {
          if (!c) return <div key={`e-${i}`} />
          const past = c.date.getTime() < min.getTime()
          const available = availableDates.has(c.iso) && !past
          const selected = value === c.iso
          const isToday = c.iso === toISODate(new Date())
          return (
            <motion.button
              key={c.iso}
              type="button"
              disabled={!available}
              onClick={() => onChange(c.iso)}
              whileTap={available ? { scale: 0.92 } : undefined}
              className={cn(
                "relative aspect-square rounded-xl text-sm font-medium transition-all",
                selected
                  ? "brand-gradient text-white shadow-lg"
                  : available
                    ? "bg-brand-surface text-ink hover:border-brand border border-transparent hover:border"
                    : "text-muted/40 cursor-not-allowed",
                isToday && !selected && "ring-1 ring-brand",
              )}
            >
              {c.jd.toLocaleString("fa-IR")}
              {available && !selected && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand" />}
            </motion.button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-surface border border-theme" /> نوبت خالی</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded brand-gradient" /> انتخاب شما</span>
      </div>
    </div>
  )
}
