import { NextResponse } from "next/server"
import { getStoreBySlug } from "@/lib/db"
import { getStoreSeo, storeBaseUrl } from "@/lib/seo"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) return new NextResponse("User-agent: *\nDisallow: /", { headers: { "Content-Type": "text/plain" } })
  const seo = await getStoreSeo(store.id)
  const base = storeBaseUrl(store, seo)
  const body = seo.robots_index
    ? `User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /order/\nDisallow: /appointment/\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`
  return new NextResponse(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } })
}
