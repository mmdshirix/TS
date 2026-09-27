import type { Store } from "@/lib/db"
import { listCategories } from "@/lib/db"

export default async function CategoriesBlock({ store, config }: { store: Store; config: { title?: string } }) {
  const categories = await listCategories(store.id)
  if (categories.length === 0) return null

  const hasImages = categories.some((c) => c.image_url)

  return (
    <section className="container py-10">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{config.title || "دسته‌بندی‌ها"}</h2>
      {hasImages ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/category/${category.slug}`}
              className="group overflow-hidden rounded-brand border bg-brand-surface transition-shadow hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden bg-gray-100">
                {category.image_url ? (
                  <img
                    src={category.image_url || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="p-3 text-center text-sm font-medium text-gray-800 group-hover:text-brand">{category.name}</div>
            </a>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/category/${category.slug}`}
              className="px-5 py-2.5 rounded-brand border text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors"
            >
              {category.name}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
