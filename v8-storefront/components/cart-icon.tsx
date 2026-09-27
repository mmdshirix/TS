"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

export default function CartIcon() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        const total = (data.items || []).reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCount(total)
      })
      .catch(() => {})
  }, [])

  return (
    <Link href="/cart" className="relative p-2 text-gray-600 hover:text-brand" aria-label="سبد خرید">
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -left-0.5 bg-brand text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  )
}
