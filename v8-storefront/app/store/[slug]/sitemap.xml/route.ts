import { NextResponse } from "next/server"
import { getStoreBySlug, listCategories, listProductsWithImages } from "@/lib/db"
import { getStoreSeo, storeBaseUrl } from "@/lib/seo"
import { getTheme } from "@/lib/themes"
import { listDoctors } from "@/lib/clinic-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function url(loc: string, lastmod?: string, priority = "0.6", changefreq = "weekly") {
  return `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) return new NextResponse("Not found", { status: 404 })
  const seo = await getStoreSeo(store.id)
  if (!seo.sitemap_enabled || !seo.robots_index) return new NextResponse("Sitemap disabled", { status: 404 })

  const base = storeBaseUrl(store, seo)
  const theme = getTheme(store.theme_id || store.category)
  const [categories, products] = await Promise.all([listCategories(store.id), listProductsWithImages(store.id, { limit: 48 * 10 })])

  const entries = [
    url(base, undefined, "1.0", "daily"),
    url(`${base}/shop`, undefined, "0.9", "daily"),
    url(`${base}/about`, undefined, "0.5", "monthly"),
    url(`${base}/contact`, undefined, "0.5", "monthly"),
    ...(theme.kind === "shop" ? [url(`${base}/explorer`, undefined, "0.6", "weekly")] : []),
    ...(theme.kind === "clinic" ? [url(`${base}/book`, undefined, "0.9", "daily")] : []),
    ...(theme.kind === "pharmacy" ? [url(`${base}/prescription`, undefined, "0.8", "monthly")] : []),
    ...categories.map((c) => url(`${base}/category/${encodeURIComponent(c.slug)}`, undefined, "0.7", "weekly")),
    ...products.map((p) => url(`${base}/product/${encodeURIComponent(p.slug)}`, p.created_at, "0.8", "weekly")),
  ]

  if (theme.kind === "clinic") {
    const doctors = await listDoctors(store.id)
    entries.push(...doctors.map((d) => url(`${base}/book/${encodeURIComponent(d.slug)}`, undefined, "0.8", "weekly")))
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`
  return new NextResponse(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } })
}
