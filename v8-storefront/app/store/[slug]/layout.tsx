import type React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getStoreBySlug, getStoreBySlugForPreview, listActiveStories } from "@/lib/db"
import { getTheme } from "@/lib/themes"
import { buildStoreMetadata, StoreJsonLd } from "@/lib/seo"
import StoreHeader from "@/components/store-header"
import StoreFooter from "@/components/store-footer"
import ChatbotWidgetEmbed from "@/components/chatbot-widget-embed"
import StoreAnalyticsTracker from "@/components/store-analytics-tracker"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import StoryBar from "@/components/story-bar"
import OpenChatListener from "@/components/open-chat-listener"

async function resolveStore(slug: string) {
  const isPreview = headers().get("x-preview-draft") === "1"
  return isPreview ? getStoreBySlugForPreview(slug) : getStoreBySlug(slug)
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const store = await resolveStore(params.slug)
  if (!store) return {}
  return buildStoreMetadata(store, { path: "/" })
}

export default async function StoreLayout({ children, params }: { children: React.ReactNode; params: { slug: string } }) {
  const store = await resolveStore(params.slug)
  if (!store) {
    notFound()
  }

  const theme = getTheme(store.theme_id || store.category)
  const stories = await listActiveStories(store.id)
  const scheme = store.color_scheme || {}
  const themeVars = {
    "--store-primary": scheme.primary || theme.defaults.primary,
    "--store-secondary": scheme.secondary || theme.defaults.secondary,
    "--store-surface": scheme.surface || theme.defaults.surface,
    "--store-radius": scheme.radius || theme.defaults.radius,
    ...(scheme.nav ? { "--store-nav": scheme.nav } : {}),
  } as React.CSSProperties

  return (
    <div style={themeVars} data-theme={theme.id} data-surface={theme.surface} className="theme-root min-h-screen flex flex-col font-iran-sans">
      <StoreJsonLd store={store} theme={theme} />
      <StoreAnalyticsTracker slug={store.slug} />
      <OpenChatListener />
      <StoreHeader store={store} theme={theme} />
      <StoryBar stories={stories} />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <StoreFooter store={store} theme={theme} />
      <MobileBottomNav theme={theme} />
      {store.chatbot_id && <ChatbotWidgetEmbed chatbotId={store.chatbot_id} autoOpen={theme.kind === "shop"} />}
    </div>
  )
}
