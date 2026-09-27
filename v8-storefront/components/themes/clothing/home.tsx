import Link from "next/link"
import { ArrowLeft, ArrowDown } from "lucide-react"
import type { ThemeHomeProps } from "@/components/themes/types"
import { HeroSlider, Reveal, SplitText, ParallaxImage, ScrollProgress, Marquee } from "@/components/motion"
import { SectionHeading, Ticker, TrustStrip, ProductGrid, CategoryTiles, AboutSection, ContactSection, AiConciergeCard } from "@/components/themes/shared"

/**
 * CLOTHING — editorial fashion.
 * Full-bleed hero with oversized outlined headline, monochrome type, asymmetric
 * category mosaic, big product imagery with minimal chrome.
 */
export default function ClothingHome({ store, theme, content, products, newest, categories }: ThemeHomeProps) {
  const heroImage = content.hero[0]?.image_url
  const second = content.hero[1]?.image_url || newest[0]?.image_url

  return (
    <div data-theme="clothing">
      <ScrollProgress />

      {/* HERO */}
      <section className="relative min-h-[88svh] overflow-hidden bg-[var(--store-bg)]">
        {content.hero.length > 0 ? (
          <HeroSlider slides={content.hero} className="absolute inset-0" />
        ) : (
          <div className="absolute inset-0 line-grid" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        <div className="relative container min-h-[88svh] flex flex-col justify-end pb-14 sm:pb-20 pt-32">
          <Reveal className="max-w-3xl text-white">
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-white/70 mb-4">
              <span className="w-8 h-px bg-white/60" /> {store.name} · کالکشن جدید
            </span>
            <h1 className="display text-4xl sm:text-6xl md:text-7xl leading-[1.05]">
              <SplitText text={content.heroTitle} />
            </h1>
            <p className="mt-5 text-sm sm:text-lg text-white/80 max-w-xl leading-8">{content.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={content.heroCta.href} className="group inline-flex items-center gap-3 bg-white text-black px-7 py-3.5 text-sm font-bold rounded-brand">
                {content.heroCta.text}
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-white/90 border-b border-white/40 pb-1 hover:border-white transition">
                مشاهده همه محصولات
              </Link>
            </div>
          </Reveal>
          <div className="absolute bottom-6 left-6 hidden sm:flex items-center gap-2 text-white/60 text-xs">
            <ArrowDown className="w-4 h-4 animate-bounce" /> اسکرول کنید
          </div>
        </div>
      </section>

      <Ticker items={theme.ticker} />

      {/* Oversized outline headline strip */}
      <section className="py-10 sm:py-14 overflow-hidden">
        <Marquee speed={60}>
          {["NEW SEASON", store.name, "LIMITED", "EDITORIAL", "ESSENTIALS"].map((w, i) => (
            <span key={i} className="display text-6xl sm:text-8xl text-outline whitespace-nowrap px-4">
              {w}
            </span>
          ))}
        </Marquee>
      </section>

      {/* CATEGORIES */}
      {content.showCategories && categories.length > 0 && (
        <section className="container pb-16">
          <SectionHeading eyebrow="دسته‌بندی" title={content.categoriesTitle} action={{ href: "/shop", label: "همه محصولات" }} />
          <CategoryTiles categories={categories} variant="editorial" />
        </section>
      )}

      {/* FEATURED */}
      {products.length > 0 && (
        <section className="container pb-20">
          <SectionHeading eyebrow="منتخب" title={content.productsTitle} description="قطعاتی که این هفته بیشتر از همه دوست داشته شدند." action={{ href: "/shop", label: "مشاهده همه" }} />
          <ProductGrid products={products} variant={theme.card} cols="grid-cols-2 lg:grid-cols-4" />
        </section>
      )}

      {/* LOOKBOOK split */}
      {second && (
        <section className="grid md:grid-cols-2 min-h-[70vh]">
          <ParallaxImage src={second} alt="لوک‌بوک" className="min-h-[50vh]" />
          <div className="flex flex-col justify-center p-8 sm:p-16 bg-[color:var(--store-primary)] text-white">
            <Reveal>
              <span className="text-[11px] tracking-[0.3em] uppercase opacity-70">لوک‌بوک</span>
              <h2 className="display text-3xl sm:text-5xl mt-3 leading-tight">هر روز، یک استایل تازه</h2>
              <p className="mt-5 text-white/75 leading-8 max-w-md">ست‌های پیشنهادی ما را ببینید و با چند کلیک استایل کامل را به سبد اضافه کنید.</p>
              <Link href="/shop" className="mt-8 inline-flex items-center gap-2 border border-white/50 px-6 py-3 text-sm hover:bg-white hover:text-black transition">
                مشاهده کالکشن <ArrowLeft className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newest.length > 0 && (
        <section className="container py-20">
          <SectionHeading eyebrow="تازه‌ها" title="جدیدترین‌ها" action={{ href: "/shop", label: "همه" }} />
          <ProductGrid products={newest} variant={theme.card} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
        </section>
      )}

      <section className="container pb-16">
        <TrustStrip theme={theme} variant="inline" />
      </section>

      {content.about && <AboutSection title={content.about.title} body={content.about.body} image={store.logo_url || heroImage} />}

      <section className="container pb-16">
        <AiConciergeCard title="استایلیست هوشمند" text="سایز، رنگ یا ست کردن؟ دستیار هوشمند فروشگاه پاسخ می‌دهد و محصول مناسب را پیشنهاد می‌کند." cta="از استایلیست بپرس" />
      </section>

      {content.showContact && <ContactSection store={store} />}
    </div>
  )
}
