import { NextResponse, type NextRequest } from "next/server"

// Hostnames that should render the root marketing page (app/page.tsx) instead of
// being treated as a store subdomain.
const ROOT_HOSTS = ["tsll.ir", "www.tsll.ir", "localhost:3001", "localhost", "127.0.0.1:3001", "127.0.0.1"]

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  if (url.pathname.startsWith("/store/") || url.pathname.startsWith("/_next")) {
    // Owner-only draft preview (used by the admin dashboard's live-preview iframe):
    // ?preview=1 lets an unpublished store render at its direct /store/<slug> path.
    // Does not affect subdomain traffic, which never sends this query param.
    if (url.searchParams.get("preview") === "1") {
      const previewHeaders = new Headers(request.headers)
      previewHeaders.set("x-preview-draft", "1")
      return NextResponse.next({ request: { headers: previewHeaders } })
    }
    return NextResponse.next()
  }

  // Dev convenience: append ?store=<slug> to any URL to preview a store without
  // needing real DNS or a *.localhost hosts entry.
  const devStoreOverride = url.searchParams.get("store")
  const slug = devStoreOverride || (ROOT_HOSTS.includes(hostname) ? null : hostname.split(".")[0] || null)

  if (!slug) {
    return NextResponse.next()
  }

  // API routes stay at their real path (app/api/**) and resolve the store from this
  // header instead of a rewritten URL — keeps route handlers flat regardless of tenant.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-store-slug", slug)

  if (url.pathname.startsWith("/api/")) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Alias the plural "/products" path (old links, bookmarks, external integrations)
  // to the real routes so it never 404s: "/products" -> "/shop", "/products/x" -> "/product/x".
  let pathname = url.pathname
  if (pathname === "/products") {
    pathname = "/shop"
  } else if (pathname.startsWith("/products/")) {
    pathname = `/product/${pathname.slice("/products/".length)}`
  }

  const rewritten = url.clone()
  rewritten.pathname = `/store/${slug}${pathname}`
  if (devStoreOverride) rewritten.searchParams.delete("store")
  return NextResponse.rewrite(rewritten, { request: { headers: requestHeaders } })
}

export const config = {
  // Paths containing a dot are static assets and skip the middleware, except the two
  // SEO files every store serves at its root (rewritten to /store/<slug>/sitemap.xml …).
  matcher: ["/((?!_next|favicon.ico|theme-previews|.*\\..*).*)", "/sitemap.xml", "/robots.txt"],
}
