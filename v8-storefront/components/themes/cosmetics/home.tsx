import Link from "next/link"
import { ArrowLeft, Sparkles, Droplets, Sun, Heart } from "lucide-react"
import type { ThemeHomeProps } from "@/components/themes/types"
import { Reveal, SplitText, Float, Stagger, StaggerItem, HeroSlider } from "@/components/motion"
import { SectionHeading, Ticker, TrustStrip, ProductGrid, CategoryTiles, AboutSection, ContactSection, AiConciergeCard, Stat } from "@/components/themes/shared"
import { CountUp } from "@/components/motion"

/**
 * COSMETICS — soft beauty.
 * Blush gradient blobs, pill shapes, floating product "bubbles", skin-type quiz CTA.
 */
export default function CosmeticsHome({ store, theme, content, products, newest, categories, productCount }: ThemeHomeProps) {
  const heroImg = content.hero[0]?.image_url
  const floaters = newest.filter((p) => p.image_url).slice(0, 3)

  return (
    <div data-theme="cosmetics" className="relative">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[120vh] overflow-hidden -z-0">
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full blob" style={{ background: "var(--store-secondary)" }} />
        <div className="absolute top-[40vh] -left-40 w-[420px] h-[420px] rounded-full blob" style={{ background: "var(--store-primary)" }} />
      </div>

      {/* HERO */}
      <section className="relative container pt-10 sm:pt-16 pb-12 grid lg:grid-cols-2 gap-10 items-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-card border border-theme px-4 py-1.5 text-xs font-bold text-brand">
            <Sparkles className="w-3.5 h-3.5" /> {store.name} · اورجینال و تضمینی
          </span>
          <h1 className="display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] mt-5 text-ink">
            <SplitText text={content.heroTitle} />
          </h1>
          <p className="mt-5 text-muted leading-8 max-w-lg">{content.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={content.heroCta.href} className="inline-flex items-center gap-2 rounded-full brand-gradient text-white px-7 py-3.5 text-sm font-bold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-shadow">
              {content.heroCta.text} <ArrowLeft className="w-4 h-4" />
            </Link>
            <a href="#quiz" className="inline-flex items-center gap-2 rounded-full bg-card border border-theme px-6 py-3.5 text-sm font-medium text-ink hover:border-brand transition">
              <Droplets className="w-4 h-4 text-brand" /> پوستم چه نوعیه؟
            </a>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            <Stat value={<CountUp to={Math.max(productCount, 12)} />} suffix="+" label="محصول اورجینال" />
            <Stat value={<CountUp to={98} />} suffix="٪" label="رضایت مشتریان" />
            <Stat value={<CountUp to={24} />} suffix="h" label="ارسال سریع" />
          </div>
        </Reveal>

        <div className="relative h-[420px] sm:h-[520px]">
          <Reveal delay={0.1} className="absolute inset-6 rounded-[3rem] overflow-hidden brand-gradient animate-gradient">
            {content.hero.length > 0 ? (
              <HeroSlider slides={content.hero} className="absolute inset-0 mix-blend-luminosity opacity-90" />
            ) : heroImg ? (
              <img src={heroImg} alt="" className="w-full h-full object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </Reveal>
          {floaters.map((p, i) => (
            <Float key={p.id} amplitude={12} duration={5 + i} delay={i * 0.6} className={["absolute -right-2 top-6", "absolute -left-2 top-1/2", "absolute right-10 -bottom-2"][i]}>
              <Link href={`/product/${p.slug}`} className="flex items-center gap-3 rounded-full glass border border-theme p-2 pr-4 shadow-xl hover:scale-105 transition">
                <img src={p.image_url!} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="text-xs">
                  <div className="font-bold text-ink line-clamp-1 max-w-[120px]">{p.name}</div>
                  <div className="text-brand font-bold">{Number(p.price).toLocaleString("fa-IR")} تومان</div>
                </div>
              </Link>
            </Float>
          ))}
        </div>
      </section>

      <Ticker items={theme.ticker} />

      {content.showCategories && categories.length > 0 && (
        <section className="container py-14">
          <SectionHeading eyebrow="دسته‌بندی" title={content.categoriesTitle} align="center" />
          <CategoryTiles categories={categories} variant="circles" />
        </section>
      )}

      {products.length > 0 && (
        <section className="container pb-16">
          <SectionHeading eyebrow="پرفروش" title={content.productsTitle} action={{ href: "/shop", label: "همه محصولات" }} />
          <ProductGrid products={products} variant={theme.card} />
        </section>
      )}

      {/* Skin quiz CTA */}
      <section id="quiz" className="container pb-16">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-card border border-theme p-8 sm:p-12">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full blob" style={{ background: "var(--store-secondary)" }} />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <span className="text-xs font-bold tracking-widest text-brand">روتین شخصی</span>
              <h3 className="display text-2xl sm:text-4xl font-black mt-2 text-ink">روتین مراقبت پوستت رو با هوش مصنوعی بساز</h3>
              <p className="text-muted mt-3 leading-7 max-w-xl">نوع پوست، نگرانی اصلی و بودجه‌ات رو بگو؛ دستیار هوشمند از بین محصولات فروشگاه یک روتین ۳ مرحله‌ای پیشنهاد می‌دهد.</p>
              <Stagger className="mt-6 flex flex-wrap gap-2">
                {[
                  { icon: Droplets, t: "پوست خشک" },
                  { icon: Sun, t: "لک و آفتاب" },
                  { icon: Heart, t: "حساس" },
                  { icon: Sparkles, t: "ضد چروک" },
                ].map(({ icon: Icon, t }) => (
                  <StaggerItem key={t}>
                    <a href="#chat" data-open-chat data-prompt={`روتین مراقبت پوست برای ${t} پیشنهاد بده`} className="inline-flex items-center gap-2 rounded-full border border-theme bg-[var(--store-bg)] px-4 py-2 text-sm text-ink hover:border-brand hover:text-brand transition">
                      <Icon className="w-4 h-4" /> {t}
                    </a>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
            <a href="#chat" data-open-chat className="inline-flex items-center justify-center gap-2 rounded-full brand-gradient text-white px-8 py-4 text-sm font-bold shadow-xl shadow-pink-500/30 hover:scale-105 transition">
              <Sparkles className="w-5 h-5" /> شروع مشاوره رایگان
            </a>
          </div>
        </Reveal>
      </section>

      {newest.length > 0 && (
        <section className="container pb-16">
          <SectionHeading eyebrow="تازه رسیده" title="جدیدترین محصولات" action={{ href: "/shop", label: "همه" }} />
          <ProductGrid products={newest} variant={theme.card} />
        </section>
      )}

      <section className="container pb-16">
        <TrustStrip theme={theme} />
      </section>

      {content.about && <AboutSection title={content.about.title} body={content.about.body} image={store.logo_url || heroImg} reverse />}
      {content.showContact && <ContactSection store={store} />}
    </div>
  )
}
