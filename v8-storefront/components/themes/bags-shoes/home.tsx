import Link from "next/link"
import { ArrowLeft, Scissors, Ruler, Package } from "lucide-react"
import type { ThemeHomeProps } from "@/components/themes/types"
import { Reveal, SplitText, HeroSlider, ParallaxImage, Stagger, StaggerItem } from "@/components/motion"
import { SectionHeading, Ticker, TrustStrip, ProductGrid, CategoryTiles, AboutSection, ContactSection, AiConciergeCard } from "@/components/themes/shared"

/**
 * BAGS & SHOES — leather craft.
 * Warm parchment, stitched borders, split hero with tag, "how it's made" steps,
 * horizontal category rail.
 */
export default function BagsShoesHome({ store, theme, content, products, newest, categories }: ThemeHomeProps) {
  const heroImg = content.hero[0]?.image_url
  const secondary = content.hero[1]?.image_url || newest[1]?.image_url

  return (
    <div data-theme="bags-shoes">
      {/* HERO split */}
      <section className="container pt-6 sm:pt-10">
        <div className="grid lg:grid-cols-12 gap-4">
          <Reveal className="lg:col-span-7 relative rounded-brand overflow-hidden border-2 border-theme min-h-[380px] sm:min-h-[520px]">
            {content.hero.length > 0 ? <HeroSlider slides={content.hero} className="absolute inset-0" /> : <div className="absolute inset-0 brand-gradient" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 p-6 sm:p-10 text-white max-w-xl">
              <span className="inline-block rounded-md bg-white text-black text-[11px] font-black px-2 py-1 rotate-[-2deg] mb-4">دست‌ساز · چرم طبیعی</span>
              <h1 className="display text-3xl sm:text-5xl font-black leading-tight">
                <SplitText text={content.heroTitle} />
              </h1>
              <p className="mt-3 text-white/80 leading-7 text-sm sm:text-base">{content.heroSubtitle}</p>
              <Link href={content.heroCta.href} className="mt-6 inline-flex items-center gap-2 rounded-brand bg-white text-black px-6 py-3 text-sm font-bold hover:bg-[var(--store-secondary)] hover:text-white transition">
                {content.heroCta.text} <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
          <div className="lg:col-span-5 grid grid-rows-2 gap-4">
            <Reveal delay={0.1} className="relative rounded-brand overflow-hidden border-2 border-theme min-h-[200px]">
              {secondary ? <ParallaxImage src={secondary} alt="" className="absolute inset-0" strength={30} /> : <div className="absolute inset-0 bg-[var(--store-secondary)]" />}
              <div className="absolute inset-0 bg-black/20" />
              <Link href="/shop" className="absolute bottom-4 right-4 text-white font-bold flex items-center gap-2">
                کالکشن کفش <ArrowLeft className="w-4 h-4" />
              </Link>
            </Reveal>
            <Reveal delay={0.2} className="rounded-brand border-2 border-dashed border-theme bg-card p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-brand tracking-widest">ضمانت ما</div>
                <div className="display text-2xl font-black text-ink mt-1">۶ ماه ضمانت دوخت و رنگ</div>
                <p className="text-sm text-muted mt-2">اگر دوخت باز شد یا رنگ داد، تعمیر یا تعویض رایگان.</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted mt-4">
                <span className="inline-flex items-center gap-1"><Scissors className="w-4 h-4 text-brand" /> دوخت دستی</span>
                <span className="inline-flex items-center gap-1"><Ruler className="w-4 h-4 text-brand" /> سایز دقیق</span>
                <span className="inline-flex items-center gap-1"><Package className="w-4 h-4 text-brand" /> ارسال امن</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="mt-10">
        <Ticker items={theme.ticker} />
      </div>

      {content.showCategories && categories.length > 0 && (
        <section className="container py-14">
          <SectionHeading eyebrow="دسته‌بندی" title={content.categoriesTitle} action={{ href: "/shop", label: "همه" }} />
          <CategoryTiles categories={categories} variant="tiles" />
        </section>
      )}

      {products.length > 0 && (
        <section className="container pb-16">
          <SectionHeading eyebrow="پرفروش" title={content.productsTitle} action={{ href: "/shop", label: "مشاهده همه" }} />
          <ProductGrid products={products} variant={theme.card} />
        </section>
      )}

      {/* HOW IT'S MADE */}
      <section className="bg-[var(--store-primary)] text-white py-16 relative overflow-hidden noise">
        <div className="container relative">
          <SectionHeading light eyebrow="پشت صحنه" title="از پوست تا محصول نهایی" description="هر قطعه در کارگاه ما با دست ساخته می‌شود." align="center" />
          <Stagger className="grid sm:grid-cols-4 gap-6">
            {[
              { n: "۰۱", t: "انتخاب چرم", d: "چرم طبیعی درجه یک با دباغی گیاهی" },
              { n: "۰۲", t: "برش الگو", d: "برش دقیق با الگوی اختصاصی" },
              { n: "۰۳", t: "دوخت دستی", d: "دوخت زین‌دوزی با نخ مومی" },
              { n: "۰۴", t: "کنترل کیفیت", d: "بازبینی نهایی و بسته‌بندی" },
            ].map((s) => (
              <StaggerItem key={s.n} className="rounded-brand border border-white/20 p-5 bg-white/5 backdrop-blur">
                <div className="display text-3xl font-black opacity-40">{s.n}</div>
                <div className="font-bold mt-2">{s.t}</div>
                <div className="text-sm text-white/70 mt-1">{s.d}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {newest.length > 0 && (
        <section className="container py-16">
          <SectionHeading eyebrow="تازه‌ها" title="جدیدترین محصولات" action={{ href: "/shop", label: "همه" }} />
          <ProductGrid products={newest} variant={theme.card} />
        </section>
      )}

      <section className="container pb-16 space-y-8">
        <TrustStrip theme={theme} />
        <AiConciergeCard title="راهنمای سایز و انتخاب" text="نمی‌دانید چه سایزی بگیرید یا کدام مدل به استایل شما می‌خورد؟ دستیار هوشمند کمک می‌کند." cta="راهنمایی بگیر" />
      </section>

      {content.about && <AboutSection title={content.about.title} body={content.about.body} image={store.logo_url || heroImg} reverse />}
      {content.showContact && <ContactSection store={store} />}
    </div>
  )
}
