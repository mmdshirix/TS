"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Store } from "@/lib/db"
import { ShoppingBag, Menu, X, Search } from "lucide-react"
import CartIcon from "@/components/cart-icon"

const NAV_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/shop", label: "فروشگاه" },
  { href: "/explorer", label: "اکسپلور" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
]

// On mobile, Home/Explore/Store live in the fixed bottom nav (see mobile-bottom-nav.tsx);
// About/Contact move in here so the bottom nav stays capped at 4 items.
const MOBILE_MENU_LINKS = [
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
]

function StoreLogo({ store, size = "w-9 h-9" }: { store: Store; size?: string }) {
  return store.logo_url ? (
    <img src={store.logo_url || "/placeholder.svg"} alt={store.name} className={`${size} rounded-brand object-cover`} />
  ) : (
    <div className={`${size} rounded-brand bg-brand flex items-center justify-center text-white`}>
      <ShoppingBag className="w-4.5 h-4.5" />
    </div>
  )
}

function useHeaderState() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`)
    setSearchOpen(false)
  }

  return { menuOpen, setMenuOpen, searchOpen, setSearchOpen, query, setQuery, handleSearch }
}

function MobileMenu({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  if (!menuOpen) return null
  return (
    <div className="md:hidden border-t bg-white">
      <nav className="container flex flex-col py-2">
        {MOBILE_MENU_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="px-2 py-3 text-sm text-gray-700 hover:text-brand border-b last:border-b-0"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

function ClassicHeader({ store }: { store: Store }) {
  const { menuOpen, setMenuOpen, searchOpen, setSearchOpen, query, setQuery, handleSearch } = useHeaderState()

  return (
    <header className="border-b sticky top-0 bg-white/90 backdrop-blur z-40">
      <div className="container flex items-center justify-between h-16 gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <StoreLogo store={store} />
          <span className="font-bold text-gray-900 truncate max-w-[140px] sm:max-w-none">{store.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-2.5 sm:px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-brand hover:bg-gray-50 whitespace-nowrap transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden md:block">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="جستجوی محصول..."
                  className="w-48 px-3 py-1.5 text-sm rounded-brand border focus:outline-none focus:border-brand"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-gray-600 hover:text-brand hover:bg-gray-50"
                aria-label="جستجو"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>
          <CartIcon />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
            aria-label="منو"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="md:hidden container pb-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی محصول..."
            className="flex-1 px-3 py-1.5 text-sm rounded-brand border focus:outline-none focus:border-brand"
          />
        </form>
      </div>

      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </header>
  )
}

function CenteredHeader({ store }: { store: Store }) {
  const { menuOpen, setMenuOpen, searchOpen, setSearchOpen, query, setQuery, handleSearch } = useHeaderState()

  return (
    <header className="border-b sticky top-0 bg-white/90 backdrop-blur z-40">
      <div className="container flex items-center justify-between h-14">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
          aria-label="منو"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="hidden md:block w-24" />

        <Link href="/" className="flex flex-col items-center gap-1">
          <StoreLogo store={store} size="w-8 h-8" />
          <span className="font-bold text-gray-900 text-sm truncate max-w-[160px]">{store.name}</span>
        </Link>

        <div className="flex items-center gap-1 w-24 justify-end">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className="p-2 rounded-lg text-gray-600 hover:text-brand hover:bg-gray-50"
            aria-label="جستجو"
          >
            <Search className="w-5 h-5" />
          </button>
          <CartIcon />
        </div>
      </div>

      <nav className="hidden md:flex items-center justify-center gap-1 sm:gap-2 border-t py-1.5">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-brand hover:bg-gray-50 whitespace-nowrap transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {searchOpen && (
        <div className="container pb-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی محصول..."
              className="flex-1 px-3 py-1.5 text-sm rounded-brand border focus:outline-none focus:border-brand"
            />
          </form>
        </div>
      )}

      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </header>
  )
}

function MinimalHeader({ store }: { store: Store }) {
  const { menuOpen, setMenuOpen, query, setQuery, handleSearch } = useHeaderState()

  return (
    <header className="border-b sticky top-0 bg-white/90 backdrop-blur z-40">
      <div className="container flex items-center gap-2 h-14">
        <Link href="/" className="flex-shrink-0">
          <StoreLogo store={store} size="w-8 h-8" />
        </Link>

        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-3 h-9">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در فروشگاه..."
            className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
          />
        </form>

        <CartIcon />
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 flex-shrink-0"
          aria-label="منو"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t bg-white">
          <nav className="container flex flex-col py-2">
            {[...NAV_LINKS.filter((l) => l.href !== "/"), ...[]].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-2 py-3 text-sm text-gray-700 hover:text-brand border-b last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default function StoreHeader({ store }: { store: Store }) {
  const headerStyle = store.color_scheme?.header_style || "classic"

  if (headerStyle === "centered") return <CenteredHeader store={store} />
  if (headerStyle === "minimal") return <MinimalHeader store={store} />
  return <ClassicHeader store={store} />
}
