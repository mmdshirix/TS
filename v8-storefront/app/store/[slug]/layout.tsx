import type React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getStoreBySlug, getStoreBySlugForPreview, listActiveStories } from "@/lib/db"
import StoreHeader from "@/components/store-header"
import StoreFooter from "@/components/store-footer"
import ChatbotWidgetEmbed from "@/components/chatbot-widget-embed"
import StoreAnalyticsTracker from "@/components/store-analytics-tracker"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import StoryBar from "@/components/story-bar"

async function resolveStore(slug: string) {
  const isPreview = headers().get("x-preview-draft") === "1"
  return isPreview ? getStoreBySlugForPreview(slug) : getStoreBySlug(slug)
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const store = await resolveStore(params.slug)
  if (!store) return {}

  return {
    title: store.name,
    description: store.description || undefined,
    icons: store.favicon_url ? [{ url: store.favicon_url }] : undefined,
  }
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const store = await resolveStore(params.slug)
  if (!store) {
    notFound()
  }

  const stories = await listActiveStories(store.id)
  const scheme = store.color_scheme || {}
  const themeVars = {
    "--store-primary": scheme.primary || "#2563eb",
    "--store-secondary": scheme.secondary || "#0ea5e9",
    "--store-surface": scheme.surface || "#f0f9ff",
    "--store-radius": scheme.radius || "0.5rem",
    ...(scheme.nav ? { "--store-nav": scheme.nav } : {}),
  } as React.CSSProperties

  return (
    <div style={themeVars} className="min-h-screen flex flex-col font-iran-sans">
      <StoreAnalyticsTracker slug={store.slug} />
      <StoreHeader store={store} />
      <StoryBar stories={stories} />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <StoreFooter store={store} />
      <MobileBottomNav />
      {store.chatbot_id && <ChatbotWidgetEmbed chatbotId={store.chatbot_id} autoOpen />}
    </div>
  )
}
