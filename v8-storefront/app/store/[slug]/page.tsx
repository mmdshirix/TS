import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getStoreBySlug, getStoreBySlugForPreview, listLandingBlocks } from "@/lib/db"
import { RenderBlocks } from "@/components/blocks"

export default async function StoreHomePage({ params }: { params: { slug: string } }) {
  const isPreview = headers().get("x-preview-draft") === "1"
  const store = isPreview ? await getStoreBySlugForPreview(params.slug) : await getStoreBySlug(params.slug)
  if (!store) {
    notFound()
  }

  const blocks = await listLandingBlocks(store.id)

  if (blocks.length === 0) {
    return (
      <div className="container py-24 text-center text-gray-400">
        این فروشگاه هنوز صفحه اصلی خود را طراحی نکرده است.
      </div>
    )
  }

  return <RenderBlocks store={store} blocks={blocks} />
}
