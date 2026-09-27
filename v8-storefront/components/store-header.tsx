"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import type { Store } from "@/lib/db"
import type { ThemeDefinition } from "@/lib/themes"
import { ShoppingBag, Menu, X, Search, Sparkles, CalendarDays, Upload, Phone } from "lucide-react"
import CartIcon from "@/components/cart-icon"
import { cn } from "@/lib/utils"

function navLinks(theme: ThemeDefinition) {
  if (theme.kind === "clinic") {
    return [
      { href: "/", label: "خانه" },
      { href: "/book", label: "رزرو نوبت" },
      { href: "/shop", label: "خدمات" },
      { href: "/about", label: "درباره مطب" },
      { href: "/contact", label: "تماس" },
    ]
  }
  if (theme.kind === "pharmacy") {
    return [
      { href: "/", label: "خانه" },
      { href: "/shop", label: "محصولات" },
      { href: "/prescription", label: "ارسال نسخه" },
      { href: "/about", label: "درباره داروخانه" },
      { href: "/contact", label: "تماس" },
    ]
  }
  return [
    { href: "/", label: "خانه" },
    { href: "/shop", label: theme.shopLabel },
    { href: "/explorer", label: "اکسپلور" },
    { href: "/about", label: "درباره ما" },
    { href: "/contact", label: "تماس با ما" },
  ]
}

function StoreLogo({ store, size = "w-9 h-9" }: { store: Store; size?: string }) {
  return store.logo_url ? (
    <img src={store.logo_url} alt={store.name} className={`${size} rounded-brand object-cover`} />
  ) : (
    <div className={`${size} rounded-brand brand-gradient flex items-center justify-center text-white`}>
      <ShoppingBag className="w-4 h-4" />
    </div>
  )
}

export default function StoreHeader({ store, theme }: { store: Store; theme: ThemeDefinition }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const links = navLinks(theme)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`)
    setSearchOpen(false)
  }

  const dark = theme.header === "dark" || theme.surface === "dark"
  const editorial = theme.header === "editorial"

  const primaryAction =
    theme.kind === "clinic" ? (
      <Link href="/book" className="hidden sm:inline-flex items-center gap-2 rounded-full brand-gradient text-white px-4 py-2 text-xs font-bold shadow hover:opacity-90 transition">
        <CalendarDays className="w-4 h-4" /> رزرو نوبت
      </Link>
    ) : theme.kind === "pharmacy" ? (
      <Link href="/prescription" className="hidden sm:inline-flex items-center gap-2 rounded-full brand-gradient text-white px-4 py-2 text-xs font-bold shadow hover:opacity-90 transition">
        <Upload className="w-4 h-4" /> ارسال نسخه
      </Link>
    ) : (
      <a href="#chat" data-open-chat className="hidden sm:inline-flex items-center gap-2 rounded-full brand-gradient text-white px-4 py-2 text-xs font-bold shadow hover:opacity-90 transition">
        <Sparkles className="w-4 h-4" /> دستیار خرید
      </a>
    )

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300 border-b",
        dark ? "text-white border-white/10" : "text-ink border-theme",
        scrolled ? (dark ? "bg-black/70 backdrop-blur-xl" : "glass shadow-[0_8px_30px_-20px_rgba(0,0,0,.3)]") : dark ? "bg-transparent border-transparent" : editorial ? "bg-transparent border-transparent" : "bg-[var(--store-bg)]",
      )}
    >
      {/* Top strip (editorial themes) */}
      {editorial && !scrolled && (
        <div className="hidden md:block text-[11px] tracking-[0.25em] text-center py-1.5 border-b border-theme text-muted">
          {theme.ticker[0]} · {theme.ticker[1]}
        </div>
      )}
      <div className={cn("container flex items-center justify-between gap-4", editorial ? "h-[68px]" : "h-16")}>
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <StoreLogo store={store} />
          <div className="leading-tight">
            <span className={cn("block font-black truncate max-w-[150px] sm:max-w-none", editorial && "tracking-tight text-lg")}>{store.name}</span>
            {store.tagline && <span className={cn("hidden sm:block text-[11px]", dark ? "text-white/60" : "text-muted")}>{store.tagline}</span>}
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 text-sm rounded-lg transition-colors",
                  active ? "text-brand font-bold" : dark ? "text-white/75 hover:text-white" : "text-muted hover:text-ink",
                )}
              >
                {link.label}
                {active && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand" />}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          {primaryAction}
          {theme.kind !== "clinic" && (
            <button type="button" onClick={() => setSearchOpen((o) => !o)} className={cn("p-2 rounded-lg", dark ? "hover:bg-white/10" : "hover:bg-black/5")} aria-label="جستجو">
              <Search className="w-5 h-5" />
            </button>
          )}
          {theme.kind === "clinic" ? (
            store.contact_phone ? (
              <a href={`tel:${store.contact_phone}`} className={cn("p-2 rounded-lg", dark ? "hover:bg-white/10" : "hover:bg-black/5")} aria-label="تماس">
                <Phone className="w-5 h-5" />
              </a>
            ) : null
          ) : (
            <CartIcon />
          )}
          <button type="button" onClick={() => setMenuOpen((o) => !o)} className={cn("md:hidden p-2 rounded-lg", dark ? "hover:bg-white/10" : "hover:bg-black/5")} aria-label="منو">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-theme">
            <form onSubmit={handleSearch} className="container py-3 flex items-center gap-2">
              <Search className="w-4 h-4 opacity-60" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجوی محصول…"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              <button type="submit" className="text-xs font-bold text-brand">جستجو</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={cn("md:hidden overflow-hidden border-t", dark ? "bg-black/80 border-white/10" : "glass border-theme")}>
            <div className="container flex flex-col py-2">
              {links.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={link.href} className={cn("block px-2 py-3 text-sm border-b last:border-b-0", dark ? "border-white/10" : "border-theme")}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="py-3">
                {theme.kind === "clinic" ? (
                  <Link href="/book" className="flex items-center justify-center gap-2 rounded-full brand-gradient text-white py-3 text-sm font-bold"><CalendarDays className="w-4 h-4" /> رزرو نوبت</Link>
                ) : theme.kind === "pharmacy" ? (
                  <Link href="/prescription" className="flex items-center justify-center gap-2 rounded-full brand-gradient text-white py-3 text-sm font-bold"><Upload className="w-4 h-4" /> ارسال نسخه</Link>
                ) : (
                  <a href="#chat" data-open-chat className="flex items-center justify-center gap-2 rounded-full brand-gradient text-white py-3 text-sm font-bold"><Sparkles className="w-4 h-4" /> دستیار خرید</a>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
