import { notFound } from "next/navigation"
import { getStoreBySlug, getCategoryBySlug, listProducts, listProductImages } from "@/lib/db"
import ProductListing from "@/components/product-listing"

const PAGE_SIZE = 12

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string; categorySlug: string }
  searchParams: { page?: string }
}) {
  const store = await getStoreBySlug(params.slug)
  if (!store) {
    notFound()
  }

  const category = await getCategoryBySlug(store.id, params.categorySlug)
  if (!category) {
    notFound()
  }

  const page = Math.max(1, Number(searchParams.page) || 1)
  const { products, total } = await listProducts(store.id, { categoryId: category.id, page, limit: PAGE_SIZE })

  const productsWithImages = await Promise.all(
    products.map(async (product) => ({
      ...product,
      imageUrl: (await listProductImages(product.id))[0]?.url || null,
    })),
  )

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{category.name}</h1>
      <ProductListing products={productsWithImages} />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/category/${category.slug}?page=${p}`}
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
