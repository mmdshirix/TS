"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutGrid, List } from "lucide-react"
import type { Product } from "@/lib/db"

interface ProductWithImage extends Product {
  imageUrl: string | null
}

export default function ProductListing({ products }: { products: ProductWithImage[] }) {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-xl border overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`p-2 ${view === "grid" ? "bg-brand text-white" : "text-gray-500"}`}
            aria-label="نمایش شبکه‌ای"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 ${view === "list" ? "bg-brand text-white" : "text-gray-500"}`}
            aria-label="نمایش لیستی"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-400 py-16">محصولی یافت نشد</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((product) => {
            const hasDiscount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
            const discountPercent = hasDiscount
              ? Math.round(100 - (Number(product.price) / Number(product.compare_at_price)) * 100)
              : 0
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group rounded-2xl border overflow-hidden hover:shadow-md transition-shadow bg-white"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">بدون تصویر</div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-1">
                      {discountPercent}٪
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {Number(product.compare_at_price).toLocaleString()}
                      </span>
                    )}
                    <p className="text-sm font-bold text-gray-900">{Number(product.price).toLocaleString()} تومان</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const hasDiscount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="flex items-center gap-4 rounded-2xl border p-3 hover:shadow-md transition-shadow bg-white"
              >
                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">بدون تصویر</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  {product.description && <p className="text-sm text-gray-500 line-clamp-1 mt-1">{product.description}</p>}
                </div>
                <div className="flex-shrink-0 text-left">
                  {hasDiscount && (
                    <p className="text-xs text-gray-400 line-through">{Number(product.compare_at_price).toLocaleString()}</p>
                  )}
                  <p className="font-bold text-gray-900">{Number(product.price).toLocaleString()} تومان</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
