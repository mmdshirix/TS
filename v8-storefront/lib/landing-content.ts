// Turns the store's drag-and-drop landing blocks into a typed content model that the
// designed themes render. The builder still controls *what* is shown (slides, texts,
// CTA, contact info); the theme controls *how* it looks.

import type { LandingBlock, Store } from "@/lib/db"
import type { ThemeDefinition } from "@/lib/themes"

export interface HeroSlide {
  image_url?: string
  title?: string
  subtitle?: string
  link_url?: string
  link_text?: string
}

export interface LandingContent {
  hero: HeroSlide[]
  heroTitle: string
  heroSubtitle: string
  heroCta: { text: string; href: string }
  about: { title: string; body: string } | null
  texts: Array<{ title: string; body: string }>
  productsTitle: string
  productsLimit: number
  productsCategoryId: number | null
  categoriesTitle: string
  showCategories: boolean
  cta: { text: string; href: string } | null
  showContact: boolean
  showAddress: boolean
  showSocial: boolean
  socialTitle: string
}

export function buildLandingContent(store: Store, blocks: LandingBlock[], theme: ThemeDefinition): LandingContent {
  const banner = blocks.find((b) => b.type === "banner")
  const slides: HeroSlide[] = ((banner?.config?.slides as HeroSlide[]) || []).filter((s) => s.image_url || s.title)
  const textBlocks = blocks.filter((b) => b.type === "text")
  const products = blocks.find((b) => b.type === "products")
  const categories = blocks.find((b) => b.type === "categories")
  const cta = blocks.find((b) => b.type === "cta_button")
  const social = blocks.find((b) => b.type === "social_links")

  const firstSlide = slides[0]
  const heroTitle = firstSlide?.title || store.tagline || theme.heroTitle
  const heroSubtitle = firstSlide?.subtitle || store.description || theme.heroSubtitle
  const heroCta = {
    text: firstSlide?.link_text || theme.heroCta,
    href: firstSlide?.link_url || (theme.kind === "clinic" ? "/book" : theme.kind === "pharmacy" ? "/prescription" : "/shop"),
  }

  const texts = textBlocks
    .map((b) => ({ title: String(b.config?.title || ""), body: String(b.config?.body || "") }))
    .filter((t) => t.title || t.body)

  return {
    hero: slides,
    heroTitle,
    heroSubtitle,
    heroCta,
    about: texts[0] || (store.description ? { title: `درباره ${store.name}`, body: store.description } : null),
    texts: texts.slice(1),
    productsTitle: String(products?.config?.title || (theme.kind === "clinic" ? "خدمات و ویزیت‌ها" : "محصولات ویژه")),
    productsLimit: Number(products?.config?.limit || 8),
    productsCategoryId: products?.config?.mode === "category" ? Number(products?.config?.category_id) || null : null,
    categoriesTitle: String(categories?.config?.title || "دسته‌بندی‌ها"),
    showCategories: Boolean(categories) || blocks.length === 0,
    cta: cta ? { text: String(cta.config?.text || "مشاهده همه"), href: String(cta.config?.link_url || "/shop") } : null,
    showContact: blocks.some((b) => b.type === "contact") || blocks.length === 0,
    showAddress: blocks.some((b) => b.type === "store_address"),
    showSocial: blocks.some((b) => b.type === "social_links") || blocks.length === 0,
    socialTitle: String(social?.config?.title || "ما را دنبال کنید"),
  }
}

export function formatToman(value: number | string | null | undefined): string {
  const n = Number(value || 0)
  return `${n.toLocaleString("fa-IR")} تومان`
}

export function discountPercent(price: number | string, compareAt: number | string | null | undefined): number {
  const p = Number(price)
  const c = Number(compareAt || 0)
  if (!c || c <= p) return 0
  return Math.round(100 - (p / c) * 100)
}
