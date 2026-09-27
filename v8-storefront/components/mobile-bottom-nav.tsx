"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Store, ShoppingCart, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/explorer", label: "اکسپلور", icon: Compass },
  { href: "/shop", label: "فروشگاه", icon: Store },
  { href: "/cart", label: "سبد خرید", icon: ShoppingCart },
]

declare global {
  interface Window {
    ChatbotWidget?: { open: () => void; close: () => void; toggle: () => void }
  }
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        const total = (data.items || []).reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartCount(total)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="md:hidden fixed bottom-4 inset-x-4 z-40 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => window.ChatbotWidget?.toggle()}
        aria-label="دستیار هوش مصنوعی"
        className="flex-shrink-0 w-14 h-14 rounded-full bg-brand-secondary text-white flex items-center justify-center shadow-lg shadow-black/20 hover:opacity-90 transition-opacity"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      <nav className="flex-1 max-w-sm flex items-center justify-around bg-store-nav rounded-full shadow-lg shadow-black/20 px-1 py-1.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full text-[11px] font-medium transition-colors",
                active ? "bg-white text-gray-900" : "text-white/85 hover:text-white",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
              {item.href === "/cart" && cartCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
