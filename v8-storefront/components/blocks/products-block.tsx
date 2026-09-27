import type { Store } from "@/lib/db"
import { listProducts } from "@/lib/db"
import ProductCard from "@/components/product-card"

interface ProductsConfig {
  title?: string
  mode?: "all" | "category"
  category_id?: number | null
  limit?: number
}

export default async function ProductsBlock({ store, config }: { store: Store; config: ProductsConfig }) {
  const { products } = await listProducts(store.id, {
    categoryId: config.mode === "category" ? config.category_id || undefined : undefined,
    limit: config.limit || 8,
    page: 1,
  })

  if (products.length === 0) return null

  return (
    <section className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{config.title || "محصولات"}</h2>
        <a href="/shop" className="text-sm text-brand hover:underline">
          مشاهده همه
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
