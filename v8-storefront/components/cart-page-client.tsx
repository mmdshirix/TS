"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Minus, Plus, Trash2, Loader2, ShoppingBag } from "lucide-react"

interface CartItem {
  id: number
  product_id: number
  product_name: string
  product_slug: string
  price: number
  quantity: number
  image_url: string | null
  variant_name: string | null
}

export default function CartPageClient() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  const load = async () => {
    const res = await fetch("/api/cart")
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const updateQuantity = async (itemId: number, quantity: number) => {
    setUpdating(itemId)
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" })
    } else {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)))
      await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })
    }
    setUpdating(null)
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">سبد خرید</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">سبد خرید شما خالی است</p>
          <Link href="/shop" className="text-brand hover:underline text-sm">
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-2xl border p-3">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url || "/placeholder.svg"} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product_slug}`} className="font-medium text-gray-900 hover:text-brand truncate block">
                    {item.product_name}
                  </Link>
                  {item.variant_name && <p className="text-xs text-gray-500 mt-0.5">{item.variant_name}</p>}
                  <p className="text-sm font-bold text-gray-900 mt-1">{Number(item.price).toLocaleString()} تومان</p>
                </div>
                <div className="flex items-center gap-2 border rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={updating === item.id}
                    className="p-2 text-gray-500 hover:text-brand"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-sm w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={updating === item.id}
                    className="p-2 text-gray-500 hover:text-brand"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <span className="text-gray-500">جمع کل</span>
            <span className="text-xl font-bold text-gray-900">{subtotal.toLocaleString()} تومان</span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 w-full bg-brand text-white rounded-xl py-3 font-medium flex items-center justify-center"
          >
            ادامه فرآیند خرید
          </Link>
        </>
      )}
    </div>
  )
}
