import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getStoreBySlug, getStoreBySlugForPreview, listLandingBlocks } from "@/lib/db"
import { RenderBlocks } from "@/components/blocks"
import ThemeHome from "@/components/themes"
import { isThemeId } from "@/lib/themes"

export default async function StoreHomePage({ params, searchParams }: { params: { slug: string }; searchParams?: { layout?: string } }) {
  const isPreview = headers().get("x-preview-draft") === "1"
  const store = isPreview ? await getStoreBySlugForPreview(params.slug) : await getStoreBySlug(params.slug)
  if (!store) {
    notFound()
  }

  const blocks = await listLandingBlocks(store.id)
  const useTheme = isThemeId(store.theme_id || store.category) && searchParams?.layout !== "blocks" && store.settings?.landing_mode !== "blocks"

  if (useTheme) {
    return <ThemeHome store={store} blocks={blocks} />
  }

  if (blocks.length === 0) {
    return <div className="container py-24 text-center text-gray-400">این فروشگاه هنوز صفحه اصلی خود را طراحی نکرده است.</div>
  }

  return <RenderBlocks store={store} blocks={blocks} />
}
