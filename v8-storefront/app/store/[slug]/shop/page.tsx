import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Search } from "lucide-react"
import { getStoreBySlug, listCategories, listProducts, getCategoryBySlug, listProductImages } from "@/lib/db"
import { getTheme } from "@/lib/themes"
import { buildStoreMetadata, BreadcrumbJsonLd, storeBaseUrl } from "@/lib/seo"
import ProductListing from "@/components/product-listing"
import { Reveal } from "@/components/motion"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 12

export async function generateMetadata({ params, searchParams }: { params: { slug: string }; searchParams: { q?: string; category?: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return {}
  const theme = getTheme(store.theme_id || store.category)
  return buildStoreMetadata(store, {
    path: "/shop",
    title: searchParams.q ? `جستجوی «${searchParams.q}»` : theme.shopLabel,
    description: `همه ${theme.shopLabel} ${store.name} با قیمت و موجودی به‌روز`,
    noIndex: Boolean(searchParams.q),
  })
}

export default async function ShopPage({ params, searchParams }: { params: { slug: string }; searchParams: { q?: string; category?: string; page?: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()
  const theme = getTheme(store.theme_id || store.category)

  const [categories, activeCategory] = await Promise.all([
    listCategories(store.id),
    searchParams.category ? getCategoryBySlug(store.id, searchParams.category) : Promise.resolve(null),
  ])

  const page = Math.max(1, Number(searchParams.page) || 1)
  const { products, total } = await listProducts(store.id, { search: searchParams.q, categoryId: activeCategory?.id, page, limit: PAGE_SIZE })
  const productsWithImages = await Promise.all(products.map(async (p) => ({ ...p, image_url: (await listProductImages(p.id))[0]?.url || null })))
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const base = storeBaseUrl(store)

  return (
    <div className="container py-10">
      <BreadcrumbJsonLd items={[{ name: store.name, url: base }, { name: theme.shopLabel, url: `${base}/shop` }]} />
      <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold tracking-widest text-brand">{store.name}</span>
          <h1 className="display text-3xl sm:text-4xl font-black text-ink mt-1">{searchParams.q ? `نتایج «${searchParams.q}»` : theme.shopLabel}</h1>
        </div>
        <form className="w-full sm:max-w-sm">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input type="text" name="q" defaultValue={searchParams.q} placeholder="جستجوی محصول…" className="w-full rounded-full border border-theme bg-card pr-10 pl-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand" />
          </div>
        </form>
      </Reveal>

      {categories.length > 0 && (
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <a href="/shop" className={cn("shrink-0 px-4 py-1.5 rounded-full text-sm border transition", !activeCategory ? "brand-gradient text-white border-transparent" : "border-theme text-ink hover:border-brand")}>همه</a>
          {categories.map((c) => (
            <a key={c.id} href={`/shop?category=${c.slug}`} className={cn("shrink-0 px-4 py-1.5 rounded-full text-sm border transition", activeCategory?.id === c.id ? "brand-gradient text-white border-transparent" : "border-theme text-ink hover:border-brand")}>
              {c.name}
            </a>
          ))}
        </div>
      )}

      <ProductListing products={productsWithImages} variant={theme.card} />

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-10" aria-label="صفحه‌بندی">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/shop?${new URLSearchParams({ ...(searchParams.q ? { q: searchParams.q } : {}), ...(searchParams.category ? { category: searchParams.category } : {}), page: String(p) })}`}
              className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-sm border", p === page ? "brand-gradient text-white border-transparent" : "border-theme text-ink")}
            >
              {p.toLocaleString("fa-IR")}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
