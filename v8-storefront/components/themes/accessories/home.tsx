import Link from "next/link"
import { ArrowLeft, Gem } from "lucide-react"
import type { ThemeHomeProps } from "@/components/themes/types"
import { Reveal, SplitText, TiltCard, HeroSlider, Stagger, StaggerItem } from "@/components/motion"
import { SectionHeading, Ticker, TrustStrip, ProductGrid, CategoryTiles, AboutSection, ContactSection, AiConciergeCard } from "@/components/themes/shared"
import { formatToman } from "@/lib/landing-content"

/**
 * ACCESSORIES / JEWELRY — luxury gold on cream.
 * Dark hero band with gold hairlines, serif-feel spacing, tilt spotlight cards,
 * "gift finder" section.
 */
export default function AccessoriesHome({ store, theme, content, products, newest, categories }: ThemeHomeProps) {
  const spotlight = products.slice(0, 3)
  const heroImg = content.hero[0]?.image_url

  return (
    <div data-theme="accessories">
      {/* HERO — dark band */}
      <section className="relative overflow-hidden bg-[#141008] text-white">
        <div aria-hidden className="absolute inset-0 opacity-30 dot-grid" />
        <div aria-hidden className="absolute -top-40 right-1/3 w-[600px] h-[600px] rounded-full blob" style={{ background: "var(--store-primary)" }} />
        <div className="relative container py-16 sm:py-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <Reveal>
            <div className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase" style={{ color: "var(--store-secondary)" }}>
              <span className="w-10 h-px bg-current" /> {store.name}
            </div>
            <h1 className="display text-4xl sm:text-5xl lg:text-6xl leading-[1.15] mt-5">
              <SplitText text={content.heroTitle} />
            </h1>
            <p className="mt-6 text-white/70 leading-8 max-w-lg">{content.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={content.heroCta.href} className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-brand text-black" style={{ background: "var(--store-secondary)" }}>
                {content.heroCta.text} <ArrowLeft className="w-4 h-4" />
              </Link>
              <a href="#gift" className="inline-flex items-center gap-2 px-6 py-3.5 text-sm rounded-brand border border-white/25 hover:bg-white/5 transition">
                <Gem className="w-4 h-4" /> راهنمای هدیه
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="relative">
            <div className="absolute inset-0 rounded-full border border-white/10 scale-110 animate-spin-slow" style={{ borderStyle: "dashed" }} aria-hidden />
            <div className="relative aspect-square rounded-full overflow-hidden border border-white/20 shadow-[0_0_120px_-30px_var(--store-secondary)]">
              {content.hero.length > 0 ? <HeroSlider slides={content.hero} className="absolute inset-0" /> : heroImg ? <img src={heroImg} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full brand-gradient" />}
            </div>
          </Reveal>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--store-secondary)] to-transparent" />
      </section>

      <Ticker items={theme.ticker} />

      {/* SPOTLIGHT — tilt cards */}
      {spotlight.length > 0 && (
        <section className="container py-16">
          <SectionHeading eyebrow="اسپات‌لایت" title={content.productsTitle} description="قطعات منتخب این فصل، با آبکاری ماندگار و طراحی اختصاصی." action={{ href: "/shop", label: "مشاهده کالکشن" }} />
          <Stagger className="grid md:grid-cols-3 gap-6">
            {spotlight.map((p) => (
              <StaggerItem key={p.id}>
                <TiltCard className="group rounded-brand">
                  <Link href={`/product/${p.slug}`} className="block rounded-brand bg-card border border-theme overflow-hidden shadow-sm">
                    <div className="aspect-[4/5] overflow-hidden bg-[radial-gradient(ellipse_at_center,_#fff_0%,_var(--store-surface)_70%)] p-8 grid place-items-center">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="max-h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110" /> : <Gem className="w-16 h-16 text-brand" />}
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="font-bold text-ink">{p.name}</h3>
                      <div className="mt-1 text-brand font-black">{formatToman(p.price)}</div>
                    </div>
                  </Link>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {content.showCategories && categories.length > 0 && (
        <section className="container pb-16">
          <SectionHeading eyebrow="کالکشن‌ها" title={content.categoriesTitle} align="center" />
          <CategoryTiles categories={categories} variant="tiles" />
        </section>
      )}

      {/* GIFT FINDER */}
      <section id="gift" className="bg-[#141008] text-white py-16">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="text-[11px] tracking-[0.35em] uppercase" style={{ color: "var(--store-secondary)" }}>راهنمای هدیه</span>
            <h2 className="display text-3xl sm:text-4xl mt-3 leading-tight">هدیه‌ای که هیچ‌وقت فراموش نمی‌شود</h2>
            <p className="mt-4 text-white/70 leading-8">مناسبت، سلیقه و بودجه را بگویید؛ دستیار هوشمند از بین قطعات فروشگاه، بهترین پیشنهاد را با بسته‌بندی هدیه آماده می‌کند.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["سالگرد", "تولد", "ولنتاین", "زیر ۱ میلیون", "ست کامل"].map((t) => (
                <a key={t} href="#chat" data-open-chat data-prompt={`پیشنهاد هدیه برای ${t}`} className="rounded-full border border-white/20 px-4 py-2 text-sm hover:border-[var(--store-secondary)] hover:text-[var(--store-secondary)] transition">
                  {t}
                </a>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <AiConciergeCard dark title="مشاور شخصی جواهر" text="پاسخ فوری به سوالات جنس، آبکاری، سایز و نگهداری." cta="گفتگو با مشاور" />
          </Reveal>
        </div>
      </section>

      {newest.length > 0 && (
        <section className="container py-16">
          <SectionHeading eyebrow="تازه‌ها" title="جدیدترین قطعات" action={{ href: "/shop", label: "همه" }} />
          <ProductGrid products={newest} variant={theme.card} />
        </section>
      )}

      <section className="container pb-16">
        <TrustStrip theme={theme} />
      </section>

      {content.about && <AboutSection title={content.about.title} body={content.about.body} image={store.logo_url || heroImg} />}
      {content.showContact && <ContactSection store={store} />}
    </div>
  )
}
