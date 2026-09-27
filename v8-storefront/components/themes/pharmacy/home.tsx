import Link from "next/link"
import { ArrowLeft, Upload, Truck, Clock, ShieldCheck, Search, Pill, Baby, Sun, Leaf, Thermometer, BadgeCheck, MapPin, PhoneCall } from "lucide-react"
import type { ThemeHomeProps } from "@/components/themes/types"
import type { PharmacySettings } from "@/lib/pharmacy-db"
import { Reveal, SplitText, Stagger, StaggerItem, CountUp, Float, HeroSlider } from "@/components/motion"
import { SectionHeading, Ticker, TrustStrip, ProductGrid, CategoryTiles, AboutSection, ContactSection, Stat } from "@/components/themes/shared"
import PharmacistAdvisor from "@/components/pharmacy/advisor-widget"

export interface PharmacyHomeProps extends ThemeHomeProps {
  pharmacy: PharmacySettings
}

const QUICK_CATS = [
  { icon: Thermometer, label: "سرماخوردگی", q: "سرماخوردگی" },
  { icon: Pill, label: "مکمل و ویتامین", q: "ویتامین" },
  { icon: Sun, label: "ضدآفتاب", q: "ضدآفتاب" },
  { icon: Baby, label: "مادر و کودک", q: "کودک" },
  { icon: Leaf, label: "گیاهی", q: "گیاهی" },
]

/**
 * PHARMACY — the flagship.
 * Fresh green on mint with a glass "command bar" (search + prescription upload),
 * 24/7 pulse badge, capsule marquee, category shelf, pharmacist AI, delivery flow,
 * insurance strip and pharmacist credentials.
 */
export default function PharmacyHome({ store, theme, content, products, newest, categories, pharmacy, productCount }: PharmacyHomeProps) {
  const heroImg = content.hero[0]?.image_url

  return (
    <div data-theme="pharmacy">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_color-mix(in_srgb,var(--store-secondary)_28%,transparent)_0%,transparent_55%)]" />
        <div aria-hidden className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full blob" style={{ background: "var(--store-primary)" }} />
        <div className="relative container pt-10 sm:pt-16 pb-12">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full glass border border-theme px-4 py-1.5 text-xs font-bold text-brand">
                  <Pill className="w-4 h-4" /> {store.name}
                </span>
                {pharmacy.is_24h && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand text-white px-3 py-1.5 text-xs font-bold">
                    <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-white animate-ping" /><span className="relative w-2 h-2 rounded-full bg-white" /></span>
                    شبانه‌روزی
                  </span>
                )}
                {pharmacy.license_no && <span className="inline-flex items-center gap-1 text-xs text-muted"><BadgeCheck className="w-4 h-4 text-brand" /> مجوز {pharmacy.license_no}</span>}
              </div>
              <h1 className="display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] mt-5 text-ink">
                <SplitText text={content.heroTitle} />
              </h1>
              <p className="mt-5 text-muted leading-8 max-w-lg">{content.heroSubtitle}</p>

              {/* Command bar */}
              <div className="mt-8 glass border border-theme rounded-[1.75rem] p-2 shadow-xl shadow-emerald-900/5 flex flex-col sm:flex-row gap-2">
                <form action="/shop" className="flex-1 flex items-center gap-2 rounded-[1.25rem] bg-[var(--store-bg)] px-4">
                  <Search className="w-5 h-5 text-muted shrink-0" />
                  <input name="q" placeholder="جستجوی دارو، مکمل یا محصول بهداشتی…" className="flex-1 bg-transparent py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none" />
                </form>
                {pharmacy.accepts_prescriptions && (
                  <Link href="/prescription" className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] brand-gradient text-white px-6 py-3.5 text-sm font-bold hover:opacity-90 transition">
                    <Upload className="w-4 h-4" /> ارسال نسخه
                  </Link>
                )}
              </div>

              <Stagger className="mt-4 flex flex-wrap gap-2">
                {QUICK_CATS.map(({ icon: Icon, label, q }) => (
                  <StaggerItem key={label}>
                    <Link href={`/shop?q=${encodeURIComponent(q)}`} className="inline-flex items-center gap-2 rounded-full border border-theme bg-card px-3.5 py-2 text-xs font-medium text-ink hover:border-brand hover:text-brand transition">
                      <Icon className="w-4 h-4 text-brand" /> {label}
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>

            <div className="relative h-[380px] sm:h-[460px]">
              <Reveal delay={0.1} className="absolute inset-4 rounded-[3rem] overflow-hidden border border-theme bg-card shadow-2xl">
                {content.hero.length > 0 ? <HeroSlider slides={content.hero} className="absolute inset-0" /> : heroImg ? <img src={heroImg} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full brand-gradient" />}
              </Reveal>
              <Float amplitude={10} className="absolute -right-2 top-8">
                <div className="glass border border-theme rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl brand-gradient text-white grid place-items-center"><Truck className="w-5 h-5" /></div>
                  <div className="text-xs"><div className="font-bold text-ink">تحویل در محل</div><div className="text-muted">{pharmacy.delivery_enabled ? "ارسال همان روز" : "تحویل حضوری"}</div></div>
                </div>
              </Float>
              <Float amplitude={12} delay={0.7} className="absolute -left-2 bottom-10">
                <div className="glass border border-theme rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-surface text-brand grid place-items-center"><ShieldCheck className="w-5 h-5" /></div>
                  <div className="text-xs"><div className="font-bold text-ink">داروی اورجینال</div><div className="text-muted">تامین از شرکت‌های معتبر</div></div>
                </div>
              </Float>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl">
            <Stat value={<CountUp to={Math.max(productCount, 100)} />} suffix="+" label="کالای موجود" />
            <Stat value={<CountUp to={pharmacy.is_24h ? 24 : 16} />} suffix=" ساعت" label="پاسخ‌گویی" />
            <Stat value={<CountUp to={pharmacy.insurance_types.length || 4} />} label="بیمه طرف قرارداد" />
          </div>
        </div>
      </section>

      <Ticker items={theme.ticker} />

      {/* CATEGORY SHELF */}
      {content.showCategories && categories.length > 0 && (
        <section className="container py-14">
          <SectionHeading eyebrow="قفسه‌ها" title={content.categoriesTitle} action={{ href: "/shop", label: "همه محصولات" }} />
          <CategoryTiles categories={categories} variant="tiles" />
        </section>
      )}

      {/* AI PHARMACIST */}
      {pharmacy.ai_advisor_enabled && (
        <section className="container pb-14">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8 items-center">
            <Reveal>
              <span className="text-xs font-bold tracking-widest text-brand">مشاوره</span>
              <h2 className="display text-3xl sm:text-4xl font-black mt-2 text-ink leading-tight">سوال دارویی داری؟ همین حالا بپرس.</h2>
              <p className="text-muted mt-4 leading-8">داروساز هوشمند بر اساس موجودی همین داروخانه پاسخ می‌دهد؛ برای موارد حساس شما را به داروساز مسئول{pharmacy.pharmacist_name ? ` (${pharmacy.pharmacist_name})` : ""} ارجاع می‌دهد.</p>
              <ul className="mt-5 space-y-2 text-sm text-ink">
                {["راهنمای مصرف و نگهداری", "بررسی تداخل‌های رایج", "پیشنهاد محصول مناسب"].map((t) => (
                  <li key={t} className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-brand" /> {t}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <PharmacistAdvisor />
            </Reveal>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="container pb-16">
          <SectionHeading eyebrow="پرفروش" title={content.productsTitle} action={{ href: "/shop", label: "همه" }} />
          <ProductGrid products={products} variant={theme.card} />
        </section>
      )}

      {/* PRESCRIPTION FLOW */}
      {pharmacy.accepts_prescriptions && (
        <section className="relative overflow-hidden py-16 text-white brand-gradient noise">
          <div className="container relative">
            <SectionHeading light eyebrow="نسخه آنلاین" title="نسخه‌ات را بفرست، دارو را درِ خانه بگیر" description="عکس نسخه یا کد نسخه الکترونیک را ارسال کنید؛ داروساز بررسی می‌کند و هزینه را اعلام می‌کند." align="center" />
            <Stagger className="grid sm:grid-cols-4 gap-4">
              {[
                { icon: Upload, t: "ارسال نسخه", d: "عکس یا کد نسخه" },
                { icon: Pill, t: "بررسی داروساز", d: "تایید و اعلام قیمت" },
                { icon: ShieldCheck, t: "پرداخت امن", d: "آنلاین یا در محل" },
                { icon: Truck, t: "تحویل", d: pharmacy.delivery_enabled ? "ارسال همان روز" : "تحویل حضوری" },
              ].map(({ icon: Icon, t, d }, i) => (
                <StaggerItem key={t} className="rounded-[1.5rem] border border-white/20 bg-white/10 backdrop-blur p-5">
                  <div className="flex items-center justify-between">
                    <Icon className="w-7 h-7" />
                    <span className="text-3xl font-black opacity-30">{(i + 1).toLocaleString("fa-IR")}</span>
                  </div>
                  <div className="font-bold mt-4">{t}</div>
                  <div className="text-sm text-white/75 mt-1">{d}</div>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal className="mt-8 text-center">
              <Link href="/prescription" className="inline-flex items-center gap-2 rounded-full bg-white text-[var(--store-primary)] px-8 py-4 text-sm font-black hover:scale-105 transition shadow-xl">
                <Upload className="w-5 h-5" /> ارسال نسخه <ArrowLeft className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section className="container py-16">
          <SectionHeading eyebrow="تازه‌ها" title="جدیدترین محصولات" action={{ href: "/shop", label: "همه" }} />
          <ProductGrid products={newest} variant={theme.card} />
        </section>
      )}

      {/* INSURANCE + TRUST */}
      <section className="container pb-16 space-y-8">
        {pharmacy.insurance_types.length > 0 && (
          <Reveal className="rounded-[1.75rem] border border-theme bg-card p-6 flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-ink ml-2">پذیرش بیمه:</span>
            {pharmacy.insurance_types.map((i) => (
              <span key={i} className="rounded-full bg-brand-surface text-brand text-xs font-bold px-3 py-1.5">{i}</span>
            ))}
          </Reveal>
        )}
        <TrustStrip theme={theme} />
        <Reveal className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-[1.5rem] border border-theme bg-card p-5 flex items-center gap-3"><Clock className="w-6 h-6 text-brand" /><div className="text-sm"><div className="font-bold text-ink">ساعات کاری</div><div className="text-muted">{pharmacy.is_24h ? "۲۴ ساعته، ۷ روز هفته" : "هر روز ۸ صبح تا ۱۲ شب"}</div></div></div>
          {store.contact_address && <div className="rounded-[1.5rem] border border-theme bg-card p-5 flex items-center gap-3"><MapPin className="w-6 h-6 text-brand" /><div className="text-sm"><div className="font-bold text-ink">آدرس</div><div className="text-muted line-clamp-1">{store.contact_address}</div></div></div>}
          {(pharmacy.emergency_phone || store.contact_phone) && <a href={`tel:${pharmacy.emergency_phone || store.contact_phone}`} className="rounded-[1.5rem] border border-theme bg-card p-5 flex items-center gap-3 hover:border-brand transition"><PhoneCall className="w-6 h-6 text-brand" /><div className="text-sm"><div className="font-bold text-ink">تماس فوری</div><div className="text-muted" dir="ltr">{pharmacy.emergency_phone || store.contact_phone}</div></div></a>}
        </Reveal>
      </section>

      {content.about && <AboutSection title={content.about.title} body={content.about.body} image={store.logo_url || heroImg} reverse />}
      {content.showContact && <ContactSection store={store} kicker="داروخانه در خدمت شماست" />}
    </div>
  )
}
