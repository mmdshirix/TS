"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, Share2, Star, ShoppingCart, Play, Loader2 } from "lucide-react"
import type { Product, ProductImage, ProductVariant } from "@/lib/db"

export default function ProductDetail({
  product,
  images,
  variants,
}: {
  product: Product
  images: ProductImage[]
  variants: ProductVariant[]
}) {
  const [activeImage, setActiveImage] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(variants[0]?.id ?? null)
  const [liked, setLiked] = useState(false)
  const [cartMessage, setCartMessage] = useState("")
  const [addingToCart, setAddingToCart] = useState(false)
  const router = useRouter()

  const variant = variants.find((v) => v.id === selectedVariant)
  const price = variant?.price_override ?? product.price

  const handleAddToCart = async () => {
    setAddingToCart(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, variant_id: selectedVariant, quantity: 1 }),
      })
      if (!res.ok) throw new Error()
      setCartMessage("به سبد خرید اضافه شد")
      router.refresh()
    } catch {
      setCartMessage("خطا در افزودن به سبد خرید")
    } finally {
      setAddingToCart(false)
      setTimeout(() => setCartMessage(""), 2500)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: window.location.href })
      } catch {
        // user cancelled share sheet, nothing to do
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCartMessage("لینک کپی شد")
      setTimeout(() => setCartMessage(""), 2000)
    }
  }

  return (
    <div className="container py-8 pb-28">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative">
            {showVideo && product.video_url ? (
              <video src={product.video_url} controls autoPlay className="w-full h-full object-cover" />
            ) : images[activeImage] ? (
              <img src={images[activeImage].url || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">بدون تصویر</div>
            )}
            {product.video_url && !showVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                پخش ویدیو
              </button>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setActiveImage(i)
                    setShowVideo(false)
                  }}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 ${
                    i === activeImage && !showVideo ? "border-brand" : "border-transparent"
                  }`}
                >
                  <img src={img.url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setLiked((l) => !l)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center ${liked ? "text-red-500 border-red-200 bg-red-50" : "text-gray-400"}`}
                aria-label="پسندیدن"
              >
                <Heart className="w-4.5 h-4.5" fill={liked ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full border flex items-center justify-center text-gray-400"
                aria-label="اشتراک‌گذاری"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {product.rating_count > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{Number(product.rating_avg).toFixed(1)}</span>
              <span>({product.rating_count} نظر)</span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            {product.compare_at_price && Number(product.compare_at_price) > Number(price) && (
              <span className="text-gray-400 line-through">{Number(product.compare_at_price).toLocaleString()} تومان</span>
            )}
            <span className="text-2xl font-bold text-gray-900">{Number(price).toLocaleString()} تومان</span>
          </div>

          {variants.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">نوع</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    className={`px-4 py-2 rounded-xl border text-sm ${v.id === selectedVariant ? "border-brand text-brand bg-blue-50" : "text-gray-600"}`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div className="mt-6 text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</div>
          )}

          {product.type === "physical" && product.inventory_count !== null && (
            <p className="text-sm text-gray-400 mt-4">
              {product.inventory_count > 0 ? `${product.inventory_count} عدد موجود` : "ناموجود"}
            </p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="hidden md:flex mt-8 w-full bg-brand text-white rounded-xl py-3 font-medium items-center justify-center gap-2 disabled:opacity-70"
          >
            {addingToCart ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <ShoppingCart className="w-4.5 h-4.5" />}
            افزودن به سبد خرید
          </button>
          {cartMessage && <p className="hidden md:block text-center text-xs text-gray-500 mt-2">{cartMessage}</p>}
        </div>
      </div>

      {/* Sticky mobile add-to-cart bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t p-3 z-30">
        {cartMessage && <p className="text-center text-xs text-gray-500 mb-1">{cartMessage}</p>}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="w-full bg-brand text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {addingToCart ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <ShoppingCart className="w-4.5 h-4.5" />}
          افزودن به سبد خرید · {Number(price).toLocaleString()} تومان
        </button>
      </div>
    </div>
  )
}
