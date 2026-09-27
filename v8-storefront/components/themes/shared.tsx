import type { ReactNode } from "react"
import Link from "next/link"
import {
  Truck, RefreshCw, ShieldCheck, Sparkles, Leaf, Gift, Gem, Hand, Wind, Zap, Headphones, CalendarDays, Pill, ArrowLeft,
  Phone, MapPin, Instagram, Send, MessageCircle, Star,
} from "lucide-react"
import type { ProductCategory, ProductWithImage, Store } from "@/lib/db"
import type { ThemeDefinition } from "@/lib/themes"
import { Marquee, Reveal, Stagger, StaggerItem } from "@/components/motion"
import { cn } from "@/lib/utils"
import { discountPercent, formatToman } from "@/lib/landing-content"

const ICONS: Record<string, any> = {
  truck: Truck, refresh: RefreshCw, shield: ShieldCheck, sparkles: Sparkles, leaf: Leaf, gift: Gift, gem: Gem,
  hand: Hand, wind: Wind, zap: Zap, headphones: Headphones, calendar: CalendarDays, pill: Pill,
}

export function TrustIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] || ShieldCheck
  return <Icon className={className} />
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  className,
  light,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: { href: string; label: string }
  align?: "start" | "center"
  className?: string
  light?: boolean
}) {
  return (
    <Reveal className={cn("flex flex-col gap-3 mb-8 sm:mb-10", align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className={cn(align === "center" && "flex flex-col items-center")}>
        {eyebrow && <span className={cn("inline-block text-xs font-bold tracking-widest uppercase mb-2", light ? "text-white/70" : "text-brand")}>{eyebrow}</span>}
        <h2 className={cn("display text-2xl sm:text-3xl md:text-4xl font-black leading-tight", light ? "text-white" : "text-ink")}>{title}</h2>
        {description && <p className={cn("mt-2 max-w-xl text-sm sm:text-base", light ? "text-white/70" : "text-muted")}>{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className={cn("group inline-flex items-center gap-2 text-sm font-medium", light ? "text-white" : "text-brand")}>
          {action.label}
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      )}
    </Reveal>
  )
}

export function Ticker({ items, className, dark }: { items: string[]; className?: string; dark?: boolean }) {
  return (
    <div className={cn("border-y border-theme py-3 text-xs sm:text-sm font-medium", dark ? "bg-black/40 text-white/80" : "bg-card text-ink", className)}>
      <Marquee speed={35}>
        {items.map((t, i) => (
          <span key={i} className="ticker-dot inline-flex items-center whitespace-nowrap">
            {t}
          </span>
        ))}
      </Marquee>
    </div>
  )
}

export function TrustStrip({ theme, className, variant = "cards" }: { theme: ThemeDefinition; className?: string; variant?: "cards" | "inline" | "pills" }) {
  if (variant === "inline") {
    return (
      <Stagger className={cn("grid grid-cols-3 gap-3 sm:gap-6", className)}>
        {theme.trust.map((t) => (
          <StaggerItem key={t.title} className="flex flex-col items-center text-center gap-2">
            <TrustIcon name={t.icon} className="w-6 h-6 text-brand" />
            <span className="text-xs sm:text-sm font-bold text-ink">{t.title}</span>
            <span className="text-[11px] sm:text-xs text-muted hidden sm:block">{t.text}</span>
          </StaggerItem>
        ))}
      </Stagger>
    )
  }
  if (variant === "pills") {
    return (
      <Stagger className={cn("flex flex-wrap gap-2 justify-center", className)}>
        {theme.trust.map((t) => (
          <StaggerItem key={t.title} className="inline-flex items-center gap-2 rounded-full border border-theme bg-card px-4 py-2 text-xs sm:text-sm text-ink">
            <TrustIcon name={t.icon} className="w-4 h-4 text-brand" />
            <span className="font-medium">{t.title}</span>
            <span className="text-muted hidden sm:inline">· {t.text}</span>
          </StaggerItem>
        ))}
      </Stagger>
    )
  }
  return (
    <Stagger className={cn("grid sm:grid-cols-3 gap-4", className)}>
      {theme.trust.map((t) => (
        <StaggerItem key={t.title} className="group flex items-start gap-4 rounded-brand border border-theme bg-card p-5 transition-all hover:-translate-y-1 hover:brand-glow">
          <div className="w-11 h-11 shrink-0 rounded-brand brand-gradient text-white flex items-center justify-center">
            <TrustIcon name={t.icon} className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-ink">{t.title}</div>
            <div className="text-sm text-muted mt-0.5">{t.text}</div>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  )
}

// ---------------------------------------------------------------------------
// Product card — one component, eight personalities
// ---------------------------------------------------------------------------

export function ThemedProductCard({ product, variant, priority }: { product: ProductWithImage; variant: ThemeDefinition["card"]; priority?: boolean }) {
  const off = discountPercent(product.price, product.compare_at_price)
  const href = `/product/${product.slug}`
  const img = product.image_url
  const badge = product.badge || (off > 0 ? `${off.toLocaleString("fa-IR")}٪ تخفیف` : product.inventory_count === 0 ? "ناموجود" : null)
  const rating = Number(product.rating_avg || 0)

  const Media = ({ className, ratio = "aspect-[4/5]" }: { className?: string; ratio?: string }) => (
    <div className={cn("card-media relative overflow-hidden bg-black/5", ratio, className)}>
      {img ? (
        <img src={img} alt={product.name} loading={priority ? "eager" : "lazy"} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted text-xs">بدون تصویر</div>
      )}
      {badge && (
        <span className={cn("absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow", off > 0 ? "bg-brand text-white" : "bg-white/90 text-ink")}>{badge}</span>
      )}
    </div>
  )

  const Price = ({ className }: { className?: string }) => (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="font-black text-ink">{formatToman(product.price)}</span>
      {off > 0 && <span className="text-xs text-muted line-through">{Number(product.compare_at_price).toLocaleString("fa-IR")}</span>}
    </div>
  )

  switch (variant) {
    case "editorial":
      return (
        <Link href={href} className="group block">
          <Media ratio="aspect-[3/4]" className="rounded-none" />
          <div className="pt-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-ink leading-snug line-clamp-2">{product.name}</h3>
              <Price className="mt-1 text-sm" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted mt-1 group-hover:text-brand transition-colors">مشاهده</span>
          </div>
        </Link>
      )
    case "soft":
      return (
        <Link href={href} className="group block rounded-[1.75rem] bg-card border border-theme p-3 transition-all hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-24px_rgba(219,39,119,.45)]">
          <Media ratio="aspect-square" className="rounded-[1.25rem]" />
          <div className="px-1 pt-3 pb-1">
            <h3 className="text-sm font-bold text-ink line-clamp-1">{product.name}</h3>
            {product.description && <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{product.description}</p>}
            <div className="mt-2 flex items-center justify-between">
              <Price className="text-sm" />
              <span className="w-8 h-8 rounded-full brand-gradient text-white grid place-items-center text-lg leading-none">+</span>
            </div>
          </div>
        </Link>
      )
    case "luxury":
      return (
        <Link href={href} className="group relative block overflow-hidden rounded-brand bg-card border border-theme">
          <Media ratio="aspect-[4/5]" />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent text-white translate-y-2 group-hover:translate-y-0 transition-transform">
            <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: "var(--store-secondary)" }}>{formatToman(product.price)}</span>
              <span className="text-[10px] tracking-widest opacity-80">مشاهده ←</span>
            </div>
          </div>
        </Link>
      )
    case "craft":
      return (
        <Link href={href} className="group block rounded-brand overflow-hidden bg-card border-2 border-theme transition-all hover:border-brand">
          <Media ratio="aspect-square" />
          <div className="p-4 border-t-2 border-theme">
            <h3 className="text-sm font-bold text-ink line-clamp-1">{product.name}</h3>
            <div className="mt-2 flex items-center justify-between">
              <Price className="text-sm" />
              {rating > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                  <Star className="w-3.5 h-3.5 fill-current text-brand-secondary" /> {rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </Link>
      )
    case "noir":
      return (
        <Link href={href} className="group relative block rounded-brand p-[1px] bg-gradient-to-b from-white/20 to-transparent">
          <div className="rounded-[inherit] bg-[#130b22] overflow-hidden">
            <Media ratio="aspect-[4/5]" className="bg-gradient-to-b from-[#221238] to-[#0b0714]" />
            <div className="p-4">
              <h3 className="text-sm font-medium text-white line-clamp-1">{product.name}</h3>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm font-bold text-[color:var(--store-secondary)]">{formatToman(product.price)}</span>
                <span className="text-[10px] text-white/50 group-hover:text-white transition-colors">کشف رایحه</span>
              </div>
            </div>
          </div>
          <span className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: "0 0 40px -10px var(--store-primary)" }} />
        </Link>
      )
    case "tech":
      return (
        <Link href={href} className="group block rounded-brand bg-card border border-theme overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
          <Media ratio="aspect-square" className="bg-gradient-to-br from-slate-50 to-slate-100" />
          <div className="p-3.5">
            <h3 className="text-sm font-bold text-ink line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
            <div className="mt-2 flex items-center justify-between">
              <Price className="text-sm" />
              <span className="text-[10px] font-bold text-brand bg-brand-surface rounded-md px-2 py-1">گارانتی</span>
            </div>
          </div>
        </Link>
      )
    case "clinical":
      return (
        <Link href={href} className="group flex gap-4 rounded-brand bg-card border border-theme p-4 transition-all hover:border-brand hover:shadow-lg">
          <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-brand-surface">
            {img ? <img src={img} alt={product.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full grid place-items-center text-brand"><Sparkles className="w-6 h-6" /></div>}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-ink line-clamp-1">{product.name}</h3>
            {product.description && <p className="text-xs text-muted line-clamp-2 mt-1">{product.description}</p>}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-black text-brand">{formatToman(product.price)}</span>
              <span className="text-[11px] text-muted">جزئیات ←</span>
            </div>
          </div>
        </Link>
      )
    case "pharma":
    default:
      return (
        <Link href={href} className="group block rounded-brand bg-card border border-theme overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(21,128,61,.5)]">
          <Media ratio="aspect-square" className="bg-white" />
          <div className="p-3.5">
            <h3 className="text-sm font-bold text-ink line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
            <div className="mt-2 flex items-center justify-between">
              <Price className="text-sm" />
              <span className="w-8 h-8 rounded-xl bg-brand text-white grid place-items-center text-lg leading-none">+</span>
            </div>
          </div>
        </Link>
      )
  }
}

export function ProductGrid({ products, variant, cols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" }: { products: ProductWithImage[]; variant: ThemeDefinition["card"]; cols?: string }) {
  return (
    <Stagger className={cn("grid gap-4 sm:gap-6", cols)}>
      {products.map((p, i) => (
        <StaggerItem key={p.id}>
          <ThemedProductCard product={p} variant={variant} priority={i < 4} />
        </StaggerItem>
      ))}
    </Stagger>
  )
}

export function CategoryTiles({ categories, variant = "tiles" }: { categories: ProductCategory[]; variant?: "tiles" | "circles" | "chips" | "editorial" }) {
  if (categories.length === 0) return null
  if (variant === "circles") {
    return (
      <Stagger className="flex gap-5 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center sm:flex-wrap">
        {categories.map((c) => (
          <StaggerItem key={c.id} className="shrink-0">
            <Link href={`/category/${c.slug}`} className="group flex flex-col items-center gap-2 w-24">
              <span className="w-20 h-20 rounded-full p-[3px] brand-gradient">
                <span className="block w-full h-full rounded-full overflow-hidden bg-card border-4 border-[var(--store-bg)]">
                  {c.image_url ? <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <span className="w-full h-full grid place-items-center text-brand font-bold">{c.name.slice(0, 1)}</span>}
                </span>
              </span>
              <span className="text-xs font-medium text-ink text-center line-clamp-1">{c.name}</span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    )
  }
  if (variant === "chips") {
    return (
      <Stagger className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <StaggerItem key={c.id}>
            <Link href={`/category/${c.slug}`} className="inline-flex items-center gap-2 rounded-full border border-theme bg-card px-4 py-2 text-sm text-ink hover:border-brand hover:text-brand transition-colors">
              {c.image_url && <img src={c.image_url} alt="" className="w-6 h-6 rounded-full object-cover" />}
              {c.name}
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    )
  }
  if (variant === "editorial") {
    return (
      <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.slice(0, 4).map((c, i) => (
          <StaggerItem key={c.id} className={cn(i === 0 && "col-span-2 row-span-2")}>
            <Link href={`/category/${c.slug}`} className="group relative block h-full min-h-[180px] overflow-hidden bg-black/5">
              {c.image_url && <img src={c.image_url} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 right-4 text-white">
                <div className={cn("font-black", i === 0 ? "text-2xl" : "text-base")}>{c.name}</div>
                <div className="text-[11px] opacity-80 mt-0.5">مشاهده ←</div>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    )
  }
  return (
    <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((c) => (
        <StaggerItem key={c.id}>
          <Link href={`/category/${c.slug}`} className="group relative block aspect-[5/4] overflow-hidden rounded-brand border border-theme bg-card">
            {c.image_url ? (
              <img src={c.image_url} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 brand-gradient opacity-80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white">
              <span className="font-bold">{c.name}</span>
              <ArrowLeft className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  )
}

export function AboutSection({ title, body, image, reverse, light }: { title: string; body: string; image?: string | null; reverse?: boolean; light?: boolean }) {
  return (
    <section className="container py-14 sm:py-20">
      <div className={cn("grid md:grid-cols-2 gap-8 md:gap-14 items-center", reverse && "md:[&>*:first-child]:order-2")}>
        <Reveal>
          <h2 className={cn("display text-2xl sm:text-4xl font-black leading-tight", light ? "text-white" : "text-ink")}>{title}</h2>
          <p className={cn("mt-5 leading-8 whitespace-pre-line text-sm sm:text-base", light ? "text-white/70" : "text-muted")}>{body}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] brand-gradient blob" aria-hidden />
            <div className="relative aspect-[4/3] rounded-brand overflow-hidden border border-theme bg-card">
              {image ? <img src={image} alt={title} className="w-full h-full object-cover" /> : <div className="w-full h-full brand-gradient opacity-90" />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function ContactSection({ store, kicker = "در تماس باشید" }: { store: Store; kicker?: string }) {
  const ig = store.social_links?.instagram
  const tg = store.social_links?.telegram
  const wa = store.social_links?.whatsapp
  return (
    <section className="container pb-16">
      <Reveal className="relative overflow-hidden rounded-[2rem] p-8 sm:p-12 text-white brand-gradient noise">
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs font-bold tracking-widest opacity-80">{kicker}</div>
            <h3 className="display text-2xl sm:text-3xl font-black mt-2">با {store.name} در ارتباط باشید</h3>
            <p className="text-white/80 mt-3 text-sm sm:text-base">سوالی دارید؟ همین حالا با ما تماس بگیرید یا از دستیار هوشمند فروشگاه بپرسید.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {store.contact_phone && (
                <a href={`tel:${store.contact_phone}`} className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-5 py-2.5 text-sm font-bold hover:bg-white/90 transition" dir="ltr">
                  <Phone className="w-4 h-4" /> {store.contact_phone}
                </a>
              )}
              <a href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition">
                <MessageCircle className="w-4 h-4" /> فرم تماس
              </a>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            {store.contact_address && (
              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
                <MapPin className="w-5 h-5 shrink-0" />
                <span>{store.contact_address}</span>
              </div>
            )}
            {(ig || tg || wa) && (
              <div className="flex gap-3">
                {ig && <a href={`https://instagram.com/${String(ig).replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-2xl bg-white/10 p-4 flex items-center gap-2 hover:bg-white/20 transition"><Instagram className="w-5 h-5" /> اینستاگرام</a>}
                {tg && <a href={`https://t.me/${String(tg).replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-2xl bg-white/10 p-4 flex items-center gap-2 hover:bg-white/20 transition"><Send className="w-5 h-5" /> تلگرام</a>}
                {wa && <a href={`https://wa.me/${String(wa).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-2xl bg-white/10 p-4 flex items-center gap-2 hover:bg-white/20 transition"><MessageCircle className="w-5 h-5" /> واتساپ</a>}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function AiConciergeCard({ title, text, cta = "شروع گفتگو", dark }: { title: string; text: string; cta?: string; dark?: boolean }) {
  return (
    <Reveal className={cn("relative overflow-hidden rounded-[2rem] border border-theme p-6 sm:p-8", dark ? "bg-white/5 text-white" : "bg-card")}>
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full brand-gradient blob" aria-hidden />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="relative w-16 h-16 shrink-0">
          <span className="absolute inset-0 rounded-full brand-gradient animate-pulse-ring" />
          <span className="relative w-16 h-16 rounded-full brand-gradient text-white grid place-items-center"><Sparkles className="w-7 h-7" /></span>
        </div>
        <div className="flex-1">
          <h3 className={cn("text-lg font-black", dark ? "text-white" : "text-ink")}>{title}</h3>
          <p className={cn("text-sm mt-1", dark ? "text-white/70" : "text-muted")}>{text}</p>
        </div>
        <OpenChatButton label={cta} />
      </div>
    </Reveal>
  )
}

export function OpenChatButton({ label, className }: { label: string; className?: string }) {
  // The chatbot widget exposes window.ChatbotWidget; a tiny inline listener in
  // components/open-chat-listener.tsx turns every [data-open-chat] click into .open().
  return (
    <a href="#chat" data-open-chat className={cn("inline-flex items-center gap-2 rounded-full brand-gradient text-white px-5 py-3 text-sm font-bold shadow-lg hover:opacity-90 transition", className)}>
      <Sparkles className="w-4 h-4" /> {label}
    </a>
  )
}

export function Stat({ value, label, suffix, light }: { value: ReactNode; label: string; suffix?: string; light?: boolean }) {
  return (
    <div className="text-center">
      <div className={cn("display text-3xl sm:text-4xl font-black", light ? "text-white" : "brand-gradient-text")}>
        {value}
        {suffix}
      </div>
      <div className={cn("text-xs sm:text-sm mt-1", light ? "text-white/60" : "text-muted")}>{label}</div>
    </div>
  )
}
