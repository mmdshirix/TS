import Link from "next/link"
import { ArrowLeft, Cpu, BatteryCharging, Camera, Shield, Zap } from "lucide-react"
import type { ThemeHomeProps } from "@/components/themes/types"
import { Reveal, SplitText, HeroSlider, Stagger, StaggerItem, CountUp, TiltCard } from "@/components/motion"
import { SectionHeading, Ticker, TrustStrip, ProductGrid, CategoryTiles, AboutSection, ContactSection, AiConciergeCard, Stat } from "@/components/themes/shared"
import { formatToman } from "@/lib/landing-content"

/**
 * MOBILE & GADGETS — tech.
 * Electric blue gradients, bento grid, spec chips, deal-of-the-day tilt card, neon scan line.
 */
export default function MobileHome({ store, theme, content, products, newest, categories, productCount }: ThemeHomeProps) {
  const deal = products.find((p) => p.compare_at_price && Number(p.compare_at_price) > Number(p.price)) || products[0]
  const heroImg = content.hero[0]?.image_url

  return (
    <div data-theme="mobile">
      {/* HERO bento */}
      <section className="container pt-6 sm:pt-10">
        <div className="grid lg:grid-cols-3 gap-4">
          <Reveal className="lg:col-span-2 relative rounded-brand overflow-hidden min-h-[380px] sm:min-h-[480px] brand-gradient animate-gradient text-white">
            {content.hero.length > 0 && <HeroSlider slides={content.hero} className="absolute inset-0 opacity-90" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div aria-hidden className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-scan pointer-events-none" />
            <div className="absolute bottom-0 p-6 sm:p-10 max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-md bg-white/15 backdrop-blur px-3 py-1 text-xs font-bold"><Zap className="w-3.5 h-3.5" /> {store.name}</span>
              <h1 className="display text-3xl sm:text-5xl font-black leading-tight mt-4">
                <SplitText text={content.heroTitle} />
              </h1>
              <p className="mt-3 text-white/85 text-sm sm:text-base leading-7">{content.heroSubtitle}</p>
              <Link href={content.heroCta.href} className="mt-6 inline-flex items-center gap-2 rounded-brand bg-white text-[var(--store-primary)] px-6 py-3 text-sm font-black hover:scale-105 transition">
                {content.heroCta.text} <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-rows-2 gap-4">
            {deal && (
              <Reveal delay={0.1}>
                <TiltCard className="group h-full rounded-brand">
                  <Link href={`/product/${deal.slug}`} className="flex h-full flex-col rounded-brand border border-theme bg-card p-5 overflow-hidden">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-brand">پیشنهاد امروز</span>
                      <span className="rounded-md bg-red-500 text-white px-2 py-0.5 font-bold">ویژه</span>
                    </div>
                    <div className="flex-1 grid place-items-center py-3">
                      {deal.image_url ? <img src={deal.image_url} alt={deal.name} className="max-h-32 object-contain drop-shadow-xl group-hover:scale-110 transition" /> : <Cpu className="w-16 h-16 text-brand" />}
                    </div>
                    <div className="text-sm font-bold text-ink line-clamp-1">{deal.name}</div>
                    <div className="text-brand font-black mt-1">{formatToman(deal.price)}</div>
                  </Link>
                </TiltCard>
              </Reveal>
            )}
            <Reveal delay={0.2} className="rounded-brand border border-theme bg-[#0b1220] text-white p-5 relative overflow-hidden">
              <div aria-hidden className="absolute inset-0 dot-grid opacity-40" />
              <div className="relative grid grid-cols-3 gap-2">
                <Stat light value={<CountUp to={Math.max(productCount, 40)} />} suffix="+" label="محصول" />
                <Stat light value={<CountUp to={18} />} label="ماه گارانتی" />
                <Stat light value={<CountUp to={24} />} suffix="h" label="ارسال تهران" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <Ticker items={theme.ticker} />
      </div>

      {content.showCategories && categories.length > 0 && (
        <section className="container py-12">
          <CategoryTiles categories={categories} variant="chips" />
        </section>
      )}

      {products.length > 0 && (
        <section className="container pb-16">
          <SectionHeading eyebrow="پرفروش" title={content.productsTitle} action={{ href: "/shop", label: "همه" }} />
          <ProductGrid products={products} variant={theme.card} />
        </section>
      )}

      {/* SPEC PICKER */}
      <section className="container pb-16">
        <Reveal className="rounded-brand border border-theme bg-card p-8 sm:p-10 relative overflow-hidden">
          <div aria-hidden className="absolute -right-24 -top-24 w-72 h-72 rounded-full blob" style={{ background: "var(--store-secondary)" }} />
          <div className="relative">
            <SectionHeading eyebrow="انتخاب هوشمند" title="چی برات مهم‌تره؟" description="یکی را انتخاب کن؛ دستیار هوشمند بهترین گزینه‌ها را از بین محصولات فروشگاه فیلتر می‌کند." />
            <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Camera, t: "دوربین عالی", q: "گوشی با بهترین دوربین" },
                { icon: BatteryCharging, t: "باتری قوی", q: "گوشی با باتری قوی" },
                { icon: Cpu, t: "قدرت پردازش", q: "گوشی گیمینگ قدرتمند" },
                { icon: Shield, t: "اقتصادی", q: "گوشی اقتصادی و به‌صرفه" },
              ].map(({ icon: Icon, t, q }) => (
                <StaggerItem key={t}>
                  <a href="#chat" data-open-chat data-prompt={q} className="group flex items-center gap-3 rounded-brand border border-theme bg-[var(--store-bg)] p-4 hover:border-brand transition">
                    <span className="w-10 h-10 rounded-brand brand-gradient text-white grid place-items-center group-hover:scale-110 transition"><Icon className="w-5 h-5" /></span>
                    <span className="text-sm font-bold text-ink">{t}</span>
                  </a>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>
      </section>

      {newest.length > 0 && (
        <section className="container pb-16">
          <SectionHeading eyebrow="تازه‌ها" title="جدیدترین محصولات" action={{ href: "/shop", label: "همه" }} />
          <ProductGrid products={newest} variant={theme.card} />
        </section>
      )}

      <section className="container pb-16 space-y-8">
        <TrustStrip theme={theme} />
        <AiConciergeCard title="مشاور خرید تخصصی" text="مقایسه مدل‌ها، بررسی سازگاری لوازم جانبی و پاسخ به سوالات فنی، در چند ثانیه." cta="مشاوره بگیر" />
      </section>

      {content.about && <AboutSection title={content.about.title} body={content.about.body} image={store.logo_url || heroImg} />}
      {content.showContact && <ContactSection store={store} />}
    </div>
  )
}
