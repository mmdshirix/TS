import Link from "next/link"
import type { Product } from "@/lib/db"
import { getProductPrimaryImage } from "@/lib/db"

export default async function ProductCard({ product }: { product: Product }) {
  const imageUrl = await getProductPrimaryImage(product.id)

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group rounded-brand border overflow-hidden hover:shadow-md transition-shadow bg-white"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">بدون تصویر</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
            <span className="text-xs text-gray-400 line-through">{Number(product.compare_at_price).toLocaleString()}</span>
          )}
          <span className="text-sm font-bold text-gray-900">{Number(product.price).toLocaleString()} تومان</span>
        </div>
      </div>
    </Link>
  )
}
