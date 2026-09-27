import Link from "next/link"
import { ArrowLeft, Wind, Flower2, Trees, Citrus } from "lucide-react"
import type { ThemeHomeProps } from "@/components/themes/types"
import { Reveal, SplitText, HeroSlider, Float, Stagger, StaggerItem, DragRow } from "@/components/motion"
import { SectionHeading, Ticker, TrustStrip, ProductGrid, CategoryTiles, AboutSection, ContactSection, AiConciergeCard, ThemedProductCard } from "@/components/themes/shared"

/**
 * PERFUMES — noir luxury.
 * Deep violet on near-black, glowing bottle spotlight, scent-family selector,
 * horizontal drag rail.
 */
export default function PerfumesHome({ store, theme, content, products, newest, categories }: ThemeHomeProps) {
  const heroImg = content.hero[0]?.image_url
  const bottle = newest.find((p) => p.image_url)

  return (
    <div data-theme="perfumes" className="text-white">
      {/* HERO */}
      <section className="relative min-h-[90svh] overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#2a1548_0%,_#0b0714_60%)]" />
        <div aria-hidden className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blob" style={{ background: "var(--store-primary)" }} />
        {content.hero.length > 0 && <HeroSlider slides={content.hero} className="absolute inset-0 opacity-40 mix-blend-screen" />}
        <div className="relative container min-h-[90svh] grid lg:grid-cols-2 items-center gap-10 py-20">
          <Reveal>
            <span className="text-[11px] tracking-[0.4em] uppercase text-white/50">{store.name}</span>
            <h1 className="display text-4xl sm:text-6xl leading-[1.1] mt-4">
              <SplitText text={content.heroTitle} />
            </h1>
            <p className="mt-6 text-white/65 leading-8 max-w-lg">{content.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={content.heroCta.href} className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white brand-gradient shadow-[0_0_50px_-12px_var(--store-primary)]">
                {content.heroCta.text} <ArrowLeft className="w-4 h-4" />
              </Link>
              <a href="#families" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm hover:bg-white/5 transition">
                <Wind className="w-4 h-4" /> رایحه‌ات رو پیدا کن
              </a>
            </div>
          </Reveal>
          <div className="relative h-[420px] hidden lg:block">
            {bottle && (
              <Float amplitude={16} duration={7} className="absolute inset-0 grid place-items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-3xl opacity-70" style={{ background: "var(--store-secondary)" }} />
                  <img src={bottle.image_url!} alt={bottle.name} className="relative h-[380px] object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,.7)]" />
                </div>
              </Float>
            )}
          </div>
        </div>
      </section>

      <Ticker items={theme.ticker} dark />

      {/* SCENT FAMILIES */}
      <section id="families" className="container py-16">
        <SectionHeading light eyebrow="خانواده رایحه" title="امروز چه حسی داری؟" align="center" />
        <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Flower2, t: "گلی", d: "لطیف و رمانتیک", q: "عطر گلی" },
            { icon: Trees, t: "چوبی", d: "گرم و عمیق", q: "عطر چوبی" },
            { icon: Citrus, t: "مرکباتی", d: "تازه و پرانرژی", q: "عطر مرکباتی" },
            { icon: Wind, t: "شرقی", d: "شیرین و رازآلود", q: "عطر شرقی" },
          ].map(({ icon: Icon, t, d, q }) => (
            <StaggerItem key={t}>
              <a href="#chat" data-open-chat data-prompt={`${q} پیشنهاد بده`} className="group block rounded-brand border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition">
                <div className="w-12 h-12 rounded-full brand-gradient grid place-items-center group-hover:scale-110 transition"><Icon className="w-6 h-6" /></div>
                <div className="font-bold mt-4">{t}</div>
                <div className="text-sm text-white/50 mt-1">{d}</div>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {products.length > 0 && (
        <section className="container pb-16">
          <SectionHeading light eyebrow="منتخب" title={content.productsTitle} action={{ href: "/shop", label: "همه رایحه‌ها" }} />
          <DragRow>
            {products.map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-[220px] sm:w-[260px]">
                <ThemedProductCard product={p} variant={theme.card} />
              </div>
            ))}
          </DragRow>
        </section>
      )}

      {content.showCategories && categories.length > 0 && (
        <section className="container pb-16">
          <SectionHeading light eyebrow="دسته‌بندی" title={content.categoriesTitle} />
          <CategoryTiles categories={categories} variant="chips" />
        </section>
      )}

      {newest.length > 0 && (
        <section className="container pb-16">
          <SectionHeading light eyebrow="تازه‌ها" title="جدیدترین‌ها" action={{ href: "/shop", label: "همه" }} />
          <ProductGrid products={newest} variant={theme.card} />
        </section>
      )}

      <section className="container pb-16 space-y-8">
        <TrustStrip theme={theme} />
        <AiConciergeCard dark title="مشاور رایحه" text="بر اساس سلیقه، فصل و مناسبت، رایحه مناسب را از بین عطرهای فروشگاه پیشنهاد می‌دهد." cta="پیدا کردن رایحه" />
      </section>

      {content.about && <AboutSection light title={content.about.title} body={content.about.body} image={store.logo_url || heroImg} />}
      {content.showContact && <ContactSection store={store} />}
    </div>
  )
}
