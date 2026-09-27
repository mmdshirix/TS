import { notFound } from "next/navigation"
import { getStoreBySlug, listCategories, listProducts, getCategoryBySlug, listProductImages } from "@/lib/db"
import ProductListing from "@/components/product-listing"
import { Search } from "lucide-react"

const PAGE_SIZE = 12

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { q?: string; category?: string; page?: string }
}) {
  const store = await getStoreBySlug(params.slug)
  if (!store) {
    notFound()
  }

  const [categories, activeCategory] = await Promise.all([
    listCategories(store.id),
    searchParams.category ? getCategoryBySlug(store.id, searchParams.category) : Promise.resolve(null),
  ])

  const page = Math.max(1, Number(searchParams.page) || 1)
  const { products, total } = await listProducts(store.id, {
    search: searchParams.q,
    categoryId: activeCategory?.id,
    page,
    limit: PAGE_SIZE,
  })

  const productsWithImages = await Promise.all(
    products.map(async (product) => ({
      ...product,
      imageUrl: (await listProductImages(product.id))[0]?.url || null,
    })),
  )

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">فروشگاه</h1>

      <form className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="جستجوی محصول..."
            className="w-full rounded-xl border pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:border-brand"
          />
        </div>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/shop"
            className={`px-4 py-1.5 rounded-full text-sm border ${!activeCategory ? "bg-brand text-white border-brand" : "text-gray-600"}`}
          >
            همه
          </a>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm border ${activeCategory?.id === c.id ? "bg-brand text-white border-brand" : "text-gray-600"}`}
            >
              {c.name}
            </a>
          ))}
        </div>
      )}

      <ProductListing products={productsWithImages} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/shop?${new URLSearchParams({ ...(searchParams.q ? { q: searchParams.q } : {}), ...(searchParams.category ? { category: searchParams.category } : {}), page: String(p) })}`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border ${p === page ? "bg-brand text-white border-brand" : "text-gray-600"}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
