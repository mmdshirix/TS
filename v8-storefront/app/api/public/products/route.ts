import { NextResponse, type NextRequest } from "next/server"
import { getStoreBySlug, listProducts, getProductPrimaryImage } from "@/lib/db"

export const dynamic = "force-dynamic"

// Public, cross-origin JSON feed of a store's active products — meant for embedding
// on external sites (e.g. the talksell-connect WordPress plugin's [talksell_products]
// shortcode), not just this app's own pages. No auth: only publishes what's already
// public on the storefront itself.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const slug = params.get("store")
  if (!slug) {
    return NextResponse.json({ error: "پارامتر store الزامی است" }, { status: 400, headers: CORS_HEADERS })
  }

  const store = await getStoreBySlug(slug)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404, headers: CORS_HEADERS })
  }

  const page = Math.max(1, Number(params.get("page")) || 1)
  const limit = Math.min(24, Number(params.get("limit")) || 12)
  const search = params.get("search") || undefined

  const { products, total } = await listProducts(store.id, { search, page, limit })
  const withImages = await Promise.all(
    products.map(async (p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      compare_at_price: p.compare_at_price,
      image_url: await getProductPrimaryImage(p.id),
      url: `https://${store.slug}.tsll.ir/product/${p.slug}`,
    })),
  )

  return NextResponse.json(
    { store: { name: store.name, slug: store.slug }, products: withImages, total, page, limit },
    { headers: CORS_HEADERS },
  )
}
