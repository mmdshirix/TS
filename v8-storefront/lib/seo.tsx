import type { Metadata } from "next"
import { getSql, type Store, type Product } from "@/lib/db"
import type { ThemeDefinition } from "@/lib/themes"

export interface StoreSeo {
  meta_title: string | null
  meta_description: string | null
  keywords: string | null
  og_image_url: string | null
  canonical_domain: string | null
  robots_index: boolean
  robots_follow: boolean
  google_site_verification: string | null
  google_analytics_id: string | null
  twitter_handle: string | null
  structured_data_enabled: boolean
  sitemap_enabled: boolean
  business_type: string | null
  locale: string
  page_overrides: Record<string, { title?: string; description?: string }>
  head_scripts: string | null
}

const DEFAULT_SEO: StoreSeo = {
  meta_title: null,
  meta_description: null,
  keywords: null,
  og_image_url: null,
  canonical_domain: null,
  robots_index: true,
  robots_follow: true,
  google_site_verification: null,
  google_analytics_id: null,
  twitter_handle: null,
  structured_data_enabled: true,
  sitemap_enabled: true,
  business_type: null,
  locale: "fa_IR",
  page_overrides: {},
  head_scripts: null,
}

const cache = new Map<number, { at: number; seo: StoreSeo }>()

export async function getStoreSeo(storeId: number): Promise<StoreSeo> {
  const hit = cache.get(storeId)
  if (hit && Date.now() - hit.at < 60_000) return hit.seo
  let seo = DEFAULT_SEO
  try {
    const sql = getSql()
    const r = await sql`SELECT * FROM store_seo_settings WHERE store_id = ${storeId}`
    if (r.length) {
      const row = r[0] as any
      seo = { ...DEFAULT_SEO, ...row, page_overrides: row.page_overrides || {} }
    }
  } catch {
    /* table may not exist yet */
  }
  cache.set(storeId, { at: Date.now(), seo })
  return seo
}

export function storeBaseUrl(store: Store, seo?: StoreSeo): string {
  if (seo?.canonical_domain) return `https://${seo.canonical_domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
  if (store.custom_domain) return `https://${store.custom_domain.replace(/^https?:\/\//, "")}`
  const base = process.env.NEXT_PUBLIC_STOREFRONT_BASE_DOMAIN || process.env.STOREFRONT_BASE_DOMAIN || "tsll.ir"
  return `https://${store.slug}.${base}`
}

function truncate(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

export async function buildStoreMetadata(
  store: Store,
  opts: { path: string; title?: string; description?: string; image?: string | null; type?: "website" | "article" | "product"; noIndex?: boolean } = { path: "/" },
): Promise<Metadata> {
  const seo = await getStoreSeo(store.id)
  const base = storeBaseUrl(store, seo)
  const pageKey = opts.path === "/" ? "home" : opts.path.replace(/^\//, "").split("/")[0]
  const override = seo.page_overrides?.[pageKey]

  const siteTitle = seo.meta_title || store.name
  const title = override?.title || opts.title
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const description = truncate(override?.description || opts.description || seo.meta_description || store.description || `${store.name} — خرید آنلاین با پشتیبانی هوشمند`, 160)
  const image = opts.image || seo.og_image_url || store.logo_url || null
  const url = `${base}${opts.path === "/" ? "" : opts.path}`
  const index = seo.robots_index && !opts.noIndex

  return {
    metadataBase: new URL(base),
    title: fullTitle,
    description,
    keywords: seo.keywords ? seo.keywords.split(/[,،]/).map((k) => k.trim()).filter(Boolean) : undefined,
    alternates: { canonical: url },
    robots: { index, follow: seo.robots_follow, googleBot: { index, follow: seo.robots_follow } },
    icons: store.favicon_url ? [{ url: store.favicon_url }] : store.logo_url ? [{ url: store.logo_url }] : undefined,
    verification: seo.google_site_verification ? { google: seo.google_site_verification } : undefined,
    openGraph: {
      type: opts.type === "product" ? "website" : opts.type || "website",
      locale: seo.locale || "fa_IR",
      siteName: store.name,
      title: fullTitle,
      description,
      url,
      images: image ? [{ url: image, alt: title || store.name }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: fullTitle,
      description,
      images: image ? [image] : undefined,
      site: seo.twitter_handle || undefined,
    },
    other: { "theme-color": store.color_scheme?.primary || "#2563eb" },
  }
}

function businessType(store: Store, theme: ThemeDefinition, seo: StoreSeo) {
  if (seo.business_type) return seo.business_type
  if (theme.kind === "clinic") return "MedicalClinic"
  if (theme.kind === "pharmacy") return "Pharmacy"
  return "Store"
}

/** Organization / LocalBusiness JSON-LD for every store page. */
export async function StoreJsonLd({ store, theme }: { store: Store; theme: ThemeDefinition }) {
  const seo = await getStoreSeo(store.id)
  if (!seo.structured_data_enabled) return null
  const base = storeBaseUrl(store, seo)
  const data: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": businessType(store, theme, seo),
    name: store.name,
    url: base,
    description: seo.meta_description || store.description || undefined,
    image: seo.og_image_url || store.logo_url || undefined,
    logo: store.logo_url || undefined,
    telephone: store.contact_phone || undefined,
    address: store.contact_address ? { "@type": "PostalAddress", streetAddress: store.contact_address, addressCountry: "IR" } : undefined,
    sameAs: [
      store.social_links?.instagram ? `https://instagram.com/${String(store.social_links.instagram).replace("@", "")}` : null,
      store.social_links?.telegram ? `https://t.me/${String(store.social_links.telegram).replace("@", "")}` : null,
    ].filter(Boolean),
    potentialAction: theme.kind === "shop" ? { "@type": "SearchAction", target: `${base}/shop?q={search_term_string}`, "query-input": "required name=search_term_string" } : undefined,
  }
  const site = { "@context": "https://schema.org", "@type": "WebSite", name: store.name, url: base, inLanguage: "fa-IR" }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(site) }} />
      {seo.google_analytics_id && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${seo.google_analytics_id}`} />
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${seo.google_analytics_id}');` }} />
        </>
      )}
      {seo.head_scripts && <div dangerouslySetInnerHTML={{ __html: seo.head_scripts }} />}
    </>
  )
}

export function ProductJsonLd({ store, product, image, base }: { store: Store; product: Product; image: string | null; base: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.meta_description || product.description || undefined,
    image: image || undefined,
    sku: product.sku || undefined,
    brand: { "@type": "Brand", name: store.name },
    aggregateRating: Number(product.rating_count) > 0 ? { "@type": "AggregateRating", ratingValue: Number(product.rating_avg), reviewCount: Number(product.rating_count) } : undefined,
    offers: {
      "@type": "Offer",
      url: `${base}/product/${product.slug}`,
      priceCurrency: "IRR",
      price: Math.round(Number(product.price) * 10),
      availability: product.inventory_count === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: store.name },
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
