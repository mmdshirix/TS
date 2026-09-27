import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getStoreBySlug, getStoreBySlugForPreview, listLandingBlocks } from "@/lib/db"
import { RenderBlocks } from "@/components/blocks"

export default async function AboutPage({ params }: { params: { slug: string } }) {
  const isPreview = headers().get("x-preview-draft") === "1"
  const store = isPreview ? await getStoreBySlugForPreview(params.slug) : await getStoreBySlug(params.slug)
  if (!store) {
    notFound()
  }

  const blocks = await listLandingBlocks(store.id, "about")

  if (blocks.length === 0) {
    return (
      <div className="container py-14 max-w-2xl text-center">
        {store.logo_url && (
          <img src={store.logo_url || "/placeholder.svg"} alt={store.name} className="w-16 h-16 rounded-brand object-cover mx-auto mb-4" />
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">درباره {store.name}</h1>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {store.description || "این فروشگاه هنوز توضیحاتی برای بخش درباره ما ثبت نکرده است."}
        </p>
      </div>
    )
  }

  return <RenderBlocks store={store} blocks={blocks} />
}
