"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutGrid, List } from "lucide-react"
import type { ProductWithImage } from "@/lib/db"
import type { ThemeDefinition } from "@/lib/themes"
import { ThemedProductCard } from "@/components/themes/shared"
import { Stagger, StaggerItem } from "@/components/motion"
import { discountPercent, formatToman } from "@/lib/landing-content"

export default function ProductListing({ products, variant = "tech" }: { products: ProductWithImage[]; variant?: ThemeDefinition["card"] }) {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted">{products.length.toLocaleString("fa-IR")} محصول</span>
        <div className="inline-flex rounded-xl border border-theme overflow-hidden">
          <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-brand text-white" : "text-muted"}`} aria-label="نمایش شبکه‌ای">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-brand text-white" : "text-muted"}`} aria-label="نمایش لیستی">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-muted py-16">محصولی یافت نشد</p>
      ) : view === "grid" ? (
        <Stagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <ThemedProductCard product={product} variant={variant} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Stagger className="space-y-3">
          {products.map((product) => {
            const off = discountPercent(product.price, product.compare_at_price)
            return (
              <StaggerItem key={product.id}>
                <Link href={`/product/${product.slug}`} className="flex items-center gap-4 rounded-brand border border-theme bg-card p-3 hover:border-brand transition">
                  <div className="w-20 h-20 rounded-xl bg-black/5 overflow-hidden flex-shrink-0">
                    {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted text-xs">بدون تصویر</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-ink truncate">{product.name}</h3>
                    {product.description && <p className="text-sm text-muted line-clamp-1 mt-1">{product.description}</p>}
                  </div>
                  <div className="flex-shrink-0 text-left">
                    {off > 0 && <p className="text-xs text-muted line-through">{Number(product.compare_at_price).toLocaleString("fa-IR")}</p>}
                    <p className="font-bold text-ink">{formatToman(product.price)}</p>
                  </div>
                </Link>
              </StaggerItem>
            )
          })}
        </Stagger>
      )}
    </div>
  )
}
