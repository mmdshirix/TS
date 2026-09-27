import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getStoreBySlug, getCategoryBySlug, listProducts, listProductImages } from "@/lib/db"
import { getTheme } from "@/lib/themes"
import { buildStoreMetadata, BreadcrumbJsonLd, storeBaseUrl } from "@/lib/seo"
import ProductListing from "@/components/product-listing"
import { Reveal } from "@/components/motion"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 12

export async function generateMetadata({ params }: { params: { slug: string; categorySlug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return {}
  const category = await getCategoryBySlug(store.id, params.categorySlug)
  return buildStoreMetadata(store, {
    path: `/category/${params.categorySlug}`,
    title: category?.name || "دسته‌بندی",
    description: category?.description || (category ? `خرید ${category.name} از ${store.name}` : undefined),
    image: category?.image_url,
  })
}

export default async function CategoryPage({ params, searchParams }: { params: { slug: string; categorySlug: string }; searchParams: { page?: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()
  const category = await getCategoryBySlug(store.id, params.categorySlug)
  if (!category) notFound()
  const theme = getTheme(store.theme_id || store.category)

  const page = Math.max(1, Number(searchParams.page) || 1)
  const { products, total } = await listProducts(store.id, { categoryId: category.id, page, limit: PAGE_SIZE })
  const productsWithImages = await Promise.all(products.map(async (p) => ({ ...p, image_url: (await listProductImages(p.id))[0]?.url || null })))
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const base = storeBaseUrl(store)

  return (
    <div className="container py-10">
      <BreadcrumbJsonLd items={[{ name: store.name, url: base }, { name: theme.shopLabel, url: `${base}/shop` }, { name: category.name, url: `${base}/category/${category.slug}` }]} />
      <Reveal className="relative overflow-hidden rounded-[2rem] border border-theme bg-card mb-8 min-h-[160px] flex items-end">
        {category.image_url && <img src={category.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--store-bg)] via-transparent to-transparent" />
        <div className="relative p-6 sm:p-8">
          <span className="text-xs font-bold tracking-widest text-brand">دسته‌بندی</span>
          <h1 className="display text-3xl sm:text-4xl font-black text-ink mt-1">{category.name}</h1>
          {category.description && <p className="text-muted mt-2 max-w-xl">{category.description}</p>}
        </div>
      </Reveal>
      <ProductListing products={productsWithImages} variant={theme.card} />
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-10" aria-label="صفحه‌بندی">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`/category/${category.slug}?page=${p}`} className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-sm border", p === page ? "brand-gradient text-white border-transparent" : "border-theme text-ink")}>
              {p.toLocaleString("fa-IR")}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
