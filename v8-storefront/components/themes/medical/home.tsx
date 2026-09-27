import Link from "next/link"
import { ArrowLeft, CalendarDays, Clock, ShieldCheck, Stethoscope, Phone, HeartPulse, Star, BadgeCheck } from "lucide-react"
import type { ThemeHomeProps } from "@/components/themes/types"
import type { Doctor, ClinicSettings } from "@/lib/clinic-db"
import { Reveal, SplitText, Stagger, StaggerItem, CountUp, Float } from "@/components/motion"
import { SectionHeading, Ticker, TrustStrip, ProductGrid, AboutSection, ContactSection, Stat } from "@/components/themes/shared"
import TriageWidget from "@/components/clinic/triage-widget"
import { formatToman } from "@/lib/landing-content"

export interface MedicalHomeProps extends ThemeHomeProps {
  doctors: Doctor[]
  clinic: ClinicSettings
}

function EcgLine() {
  return (
    <svg viewBox="0 0 600 80" className="w-full h-16 text-brand" fill="none" aria-hidden>
      <path className="animate-ecg" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M0 40 H120 L140 40 L150 20 L165 60 L180 10 L195 70 L210 40 H300 L320 40 L330 25 L345 55 L360 15 L375 65 L390 40 H480 L500 40 L510 22 L525 58 L540 12 L555 68 L570 40 H600" />
    </svg>
  )
}

/**
 * MEDICAL — calm clinical.
 * Teal/navy, soft glass panels, animated ECG line, specialists rail with live
 * "next available" hint, AI triage widget front-and-center, insurance strip.
 */
export default function MedicalHome({ store, theme, content, products, categories, doctors, clinic }: MedicalHomeProps) {
  const heroImg = content.hero[0]?.image_url
  const feeLabel = clinic.default_fee > 0 ? formatToman(clinic.default_fee) : null

  return (
    <div data-theme="medical">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 dot-grid opacity-60" />
        <div aria-hidden className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blob" style={{ background: "var(--store-secondary)" }} />
        <div className="relative container pt-10 sm:pt-16 pb-10 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass border border-theme px-4 py-1.5 text-xs font-bold text-brand">
              <HeartPulse className="w-4 h-4" /> {store.name}
              {clinic.booking_enabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {clinic.booking_enabled && <span className="text-emerald-700">نوبت‌دهی فعال</span>}
            </span>
            <h1 className="display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] mt-5 text-ink">
              <SplitText text={content.heroTitle} />
            </h1>
            <p className="mt-5 text-muted leading-8 max-w-lg">{content.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="inline-flex items-center gap-2 rounded-2xl brand-gradient text-white px-7 py-3.5 text-sm font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-shadow">
                <CalendarDays className="w-4 h-4" /> رزرو نوبت آنلاین
              </Link>
              <a href="#triage" className="inline-flex items-center gap-2 rounded-2xl glass border border-theme px-6 py-3.5 text-sm font-medium text-ink hover:border-brand transition">
                <Stethoscope className="w-4 h-4 text-brand" /> کدام متخصص؟
              </a>
            </div>
            <div className="mt-8"><EcgLine /></div>
            <div className="grid grid-cols-3 gap-4 max-w-md">
              <Stat value={<CountUp to={Math.max(doctors.length, 1)} />} label="پزشک متخصص" />
              <Stat value={<CountUp to={clinic.slot_minutes || 20} />} suffix=" دقیقه" label="مدت هر ویزیت" />
              <Stat value={<CountUp to={24} />} suffix="/۷" label="رزرو آنلاین" />
            </div>
          </Reveal>

          <div className="relative">
            <Reveal delay={0.1} className="relative rounded-[2.5rem] overflow-hidden border border-theme bg-card shadow-2xl">
              <div className="aspect-[4/3] bg-brand-surface">
                {heroImg ? <img src={heroImg} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full brand-gradient opacity-90" />}
              </div>
            </Reveal>
            <Float amplitude={8} className="absolute -bottom-6 -right-2 sm:right-6">
              <div className="glass border border-theme rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl brand-gradient text-white grid place-items-center"><Clock className="w-5 h-5" /></div>
                <div className="text-xs">
                  <div className="font-bold text-ink">نزدیک‌ترین نوبت</div>
                  <div className="text-muted">همین امروز · انتخاب ساعت دلخواه</div>
                </div>
              </div>
            </Float>
            {feeLabel && (
              <Float amplitude={10} delay={0.8} className="absolute -top-5 -left-2 sm:left-6">
                <div className="glass border border-theme rounded-2xl px-4 py-3 shadow-xl text-xs">
                  <div className="text-muted">هزینه ویزیت از</div>
                  <div className="font-black text-brand text-base">{feeLabel}</div>
                </div>
              </Float>
            )}
          </div>
        </div>
      </section>

      <Ticker items={theme.ticker} />

      {/* AI TRIAGE */}
      {clinic.ai_triage_enabled && (
        <section id="triage" className="container py-14">
          <SectionHeading eyebrow="دستیار هوشمند" title="نمی‌دانید به چه متخصصی مراجعه کنید؟" description="علائم را بنویسید؛ در چند ثانیه تخصص مناسب و پزشک پیشنهادی را می‌بینید و مستقیم نوبت می‌گیرید." align="center" />
          <div className="max-w-3xl mx-auto">
            <TriageWidget />
          </div>
        </section>
      )}

      {/* DOCTORS */}
      {doctors.length > 0 && (
        <section className="container pb-16">
          <SectionHeading eyebrow="پزشکان" title="تیم پزشکی ما" action={{ href: "/book", label: "همه پزشکان" }} />
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.slice(0, 6).map((d) => (
              <StaggerItem key={d.id}>
                <Link href={`/book/${d.slug}`} className="group flex gap-4 rounded-[1.75rem] border border-theme bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-brand">
                  <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-brand-surface grid place-items-center">
                    {d.photo_url ? <img src={d.photo_url} alt={d.name} className="w-full h-full object-cover" /> : <Stethoscope className="w-8 h-8 text-brand" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-ink line-clamp-1">{d.title ? `${d.title} ` : ""}{d.name}</h3>
                      <BadgeCheck className="w-4 h-4 text-brand shrink-0" />
                    </div>
                    <div className="text-sm text-brand font-medium mt-0.5">{d.specialty}</div>
                    {d.bio && <p className="text-xs text-muted line-clamp-2 mt-1.5">{d.bio}</p>}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted">{d.consultation_fee ? formatToman(d.consultation_fee) : feeLabel || "ویزیت"}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-brand">رزرو نوبت <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /></span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden py-16 text-white" style={{ background: "linear-gradient(135deg, #0f766e 0%, #134e4a 60%, #0b3b57 100%)" }}>
        <div aria-hidden className="absolute inset-0 line-grid opacity-20" />
        <div className="container relative">
          <SectionHeading light eyebrow="فرآیند" title="رزرو نوبت در ۳ قدم" align="center" />
          <Stagger className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "۱", icon: Stethoscope, t: "انتخاب پزشک", d: "با کمک راهنمای هوشمند یا مستقیم از فهرست پزشکان" },
              { n: "۲", icon: CalendarDays, t: "انتخاب زمان", d: "تقویم شمسی، ساعت‌های خالی به‌روز" },
              { n: "۳", icon: ShieldCheck, t: "پرداخت و تایید", d: "پرداخت آنلاین ویزیت و دریافت کد نوبت" },
            ].map(({ n, icon: Icon, t, d }) => (
              <StaggerItem key={n} className="relative rounded-[1.75rem] border border-white/15 bg-white/5 backdrop-blur p-6">
                <div className="absolute -top-4 right-6 w-9 h-9 rounded-full bg-white text-[#0f766e] font-black grid place-items-center shadow">{n}</div>
                <Icon className="w-8 h-8 opacity-90" />
                <div className="font-bold mt-4">{t}</div>
                <div className="text-sm text-white/70 mt-1 leading-6">{d}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* SERVICES (products = visit types) */}
      {products.length > 0 && (
        <section className="container py-16">
          <SectionHeading eyebrow="خدمات" title={content.productsTitle} action={{ href: "/shop", label: "همه خدمات" }} />
          <ProductGrid products={products} variant={theme.card} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
        </section>
      )}

      {/* INSURANCE + TRUST */}
      <section className="container pb-16 space-y-8">
        {clinic.insurance_types.length > 0 && (
          <Reveal className="rounded-[1.75rem] border border-theme bg-card p-6 flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-ink ml-2">بیمه‌های طرف قرارداد:</span>
            {clinic.insurance_types.map((i) => (
              <span key={i} className="rounded-full bg-brand-surface text-brand text-xs font-bold px-3 py-1.5">{i}</span>
            ))}
          </Reveal>
        )}
        <TrustStrip theme={theme} />
      </section>

      {/* TESTIMONIAL-like reassurance */}
      <section className="container pb-16">
        <Reveal className="grid md:grid-cols-3 gap-4">
          {[
            { q: "نوبت‌گیری واقعاً ساده بود؛ همان روز ویزیت شدم.", n: "مریم .ر" },
            { q: "راهنمای هوشمند دقیقاً متخصص درست را پیشنهاد داد.", n: "علی .م" },
            { q: "یادآوری پیامکی نوبت خیلی کمک کرد.", n: "سارا .ک" },
          ].map((t) => (
            <div key={t.n} className="rounded-[1.5rem] border border-theme bg-card p-5">
              <div className="flex gap-0.5 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
              <p className="text-sm text-ink mt-3 leading-7">«{t.q}»</p>
              <div className="text-xs text-muted mt-3">{t.n}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {content.about && <AboutSection title={content.about.title} body={content.about.body} image={store.logo_url || heroImg} />}

      {clinic.emergency_note && (
        <section className="container pb-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-3">
            <Phone className="w-5 h-5 shrink-0" /> {clinic.emergency_note}
          </div>
        </section>
      )}

      {content.showContact && <ContactSection store={store} kicker="ساعات کاری و تماس" />}
    </div>
  )
}
