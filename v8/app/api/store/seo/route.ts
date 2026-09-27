import { NextResponse, type NextRequest } from "next/server"
import { requireStore } from "@/lib/store-route"
import { getStoreSeoSettings, upsertStoreSeoSettings, auditStoreSeo } from "@/lib/seo-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const [settings, audit] = await Promise.all([getStoreSeoSettings(ctx.store.id), auditStoreSeo(ctx.store.id)])
  return NextResponse.json({ settings, audit, store: { name: ctx.store.name, slug: ctx.store.slug, description: ctx.store.description, logo_url: ctx.store.logo_url } })
}

export async function PUT(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const body = await request.json().catch(() => ({}))
  const clean = (v: unknown) => (typeof v === "string" ? v.trim() || null : v === null ? null : undefined)
  const settings = await upsertStoreSeoSettings(ctx.store.id, {
    meta_title: clean(body.meta_title) as any,
    meta_description: clean(body.meta_description) as any,
    keywords: clean(body.keywords) as any,
    og_image_url: clean(body.og_image_url) as any,
    canonical_domain: clean(body.canonical_domain) as any,
    robots_index: typeof body.robots_index === "boolean" ? body.robots_index : undefined,
    robots_follow: typeof body.robots_follow === "boolean" ? body.robots_follow : undefined,
    google_site_verification: clean(body.google_site_verification) as any,
    google_analytics_id: clean(body.google_analytics_id) as any,
    twitter_handle: clean(body.twitter_handle) as any,
    structured_data_enabled: typeof body.structured_data_enabled === "boolean" ? body.structured_data_enabled : undefined,
    sitemap_enabled: typeof body.sitemap_enabled === "boolean" ? body.sitemap_enabled : undefined,
    business_type: clean(body.business_type) as any,
    page_overrides: body.page_overrides && typeof body.page_overrides === "object" ? body.page_overrides : undefined,
    head_scripts: clean(body.head_scripts) as any,
  })
  const audit = await auditStoreSeo(ctx.store.id)
  return NextResponse.json({ settings, audit })
}
