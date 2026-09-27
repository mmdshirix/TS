"use client"

// Shared motion primitives used by every category theme. All animation runs on the
// client; the theme pages themselves stay server components and pass plain props in.

import { type ReactNode, useEffect, useRef, useState } from "react"
import { motion, useInView, useMotionValue, useSpring, useTransform, useScroll, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

const EASE = [0.22, 1, 0.36, 1] as const

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  as: Tag = "div",
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
  as?: any
}) {
  const MotionTag = (motion as any)[Tag] || motion.div
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className={className}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

/** Word-by-word headline entrance. */
export function SplitText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ")
  return (
    <span className={cn("inline", className)} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block will-change-transform"
          initial={{ opacity: 0, y: "0.6em", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: delay + i * 0.06, ease: EASE }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  )
}

/** Infinite horizontal marquee, RTL-safe (uses translateX in a logical-direction-agnostic way). */
export function Marquee({
  children,
  className,
  speed = 40,
  reverse = false,
  pauseOnHover = true,
}: {
  children: ReactNode
  className?: string
  speed?: number
  reverse?: boolean
  pauseOnHover?: boolean
}) {
  return (
    <div className={cn("overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]", className)} dir="ltr">
      <div
        className={cn("flex w-max gap-8 animate-marquee", reverse && "[animation-direction:reverse]", pauseOnHover && "hover:[animation-play-state:paused]")}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}

/** 3D tilt on hover with a moving glare highlight. */
export function TiltCard({ children, className, intensity = 10 }: { children: ReactNode; className?: string; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 200, damping: 20 })
  const rY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 200, damping: 20 })
  const glareX = useTransform(x, [-0.5, 0.5], ["0%", "100%"])
  const glareY = useTransform(y, [-0.5, 0.5], ["0%", "100%"])

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: rX, rotateY: rY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        x.set((e.clientX - r.left) / r.width - 0.5)
        y.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className={cn("relative will-change-transform", className)}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) => `radial-gradient(400px circle at ${gx} ${gy}, rgba(255,255,255,.35), transparent 60%)`,
          ),
        }}
      />
    </motion.div>
  )
}

/** Image that drifts slightly slower than the page for depth. */
export function ParallaxImage({ src, alt, className, strength = 60 }: { src: string; alt: string; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const yPx = useTransform(scrollYProgress, [0, 1], [-strength, strength])
  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.img src={src} alt={alt} style={{ y: yPx }} className="h-[115%] w-full object-cover -mt-[7%] will-change-transform" />
    </div>
  )
}

export function CountUp({ to, suffix = "", className, duration = 1.6 }: { to: number; suffix?: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(to * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return (
    <span ref={ref} className={className}>
      {val.toLocaleString("fa-IR")}
      {suffix}
    </span>
  )
}

/** Button that gently follows the cursor. */
export function MagneticButton({ children, className, href }: { children: ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useSpring(0, { stiffness: 250, damping: 18 })
  const y = useSpring(0, { stiffness: 250, damping: 18 })
  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        x.set((e.clientX - (r.left + r.width / 2)) * 0.25)
        y.set((e.clientY - (r.top + r.height / 2)) * 0.25)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      whileTap={{ scale: 0.97 }}
      className={cn("inline-flex items-center justify-center gap-2 will-change-transform", className)}
    >
      {children}
    </motion.a>
  )
}

export function Float({ children, className, amplitude = 10, duration = 5, delay = 0 }: { children: ReactNode; className?: string; amplitude?: number; duration?: number; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  )
}

/** Sticky scroll progress bar in the theme's primary color. */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return <motion.div style={{ scaleX, transformOrigin: "right" }} className={cn("fixed top-0 inset-x-0 h-[3px] z-[60] bg-brand", className)} />
}

/** Auto-playing hero slider with crossfade + Ken Burns zoom. */
export function HeroSlider({
  slides,
  interval = 5500,
  className,
  overlay,
  fit = "cover",
}: {
  slides: Array<{ image_url?: string; title?: string; subtitle?: string; link_url?: string; link_text?: string }>
  interval?: number
  className?: string
  overlay?: (slide: any, index: number) => ReactNode
  fit?: "cover" | "contain"
}) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval)
    return () => clearInterval(t)
  }, [slides.length, interval])
  if (slides.length === 0) return null
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {slides.map((s, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1.06 : 1 }}
          transition={{ opacity: { duration: 1.1, ease: "easeInOut" }, scale: { duration: interval / 1000 + 1.5, ease: "linear" } }}
          style={{ pointerEvents: i === index ? "auto" : "none" }}
        >
          {s.image_url && <img src={s.image_url} alt={s.title || ""} className={cn("w-full h-full", fit === "cover" ? "object-cover" : "object-contain")} />}
        </motion.div>
      ))}
      {overlay && <div className="absolute inset-0">{overlay(slides[index], index)}</div>}
      {slides.length > 1 && (
        <div className="absolute bottom-5 inset-x-0 flex justify-center gap-2 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={`اسلاید ${i + 1}`} className="h-1.5 rounded-full bg-white/50 overflow-hidden transition-all" style={{ width: i === index ? 36 : 12 }}>
              {i === index && <motion.span className="block h-full bg-white" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: interval / 1000, ease: "linear" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Horizontal snap carousel with drag. */
export function DragRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0", className)}>
      {children}
    </div>
  )
}

export function Shimmer({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("bg-clip-text text-transparent bg-[linear-gradient(110deg,var(--store-primary),var(--store-secondary),var(--store-primary))] bg-[length:200%_100%] animate-shimmer", className)}>{children}</span>
}
