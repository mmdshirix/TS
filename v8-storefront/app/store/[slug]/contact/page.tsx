import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getStoreBySlug, getStoreBySlugForPreview, listLandingBlocks } from "@/lib/db"
import { RenderBlocks } from "@/components/blocks"
import ContactBlock from "@/components/blocks/contact-block"
import StoreAddressBlock from "@/components/blocks/store-address-block"
import SocialLinksBlock from "@/components/blocks/social-links-block"

export default async function ContactPage({ params }: { params: { slug: string } }) {
  const isPreview = headers().get("x-preview-draft") === "1"
  const store = isPreview ? await getStoreBySlugForPreview(params.slug) : await getStoreBySlug(params.slug)
  if (!store) {
    notFound()
  }

  const blocks = await listLandingBlocks(store.id, "contact")

  if (blocks.length === 0) {
    return (
      <div className="py-4">
        <ContactBlock store={store} config={{ title: "تماس با ما" }} />
        <StoreAddressBlock store={store} config={{ show_map: true }} />
        <SocialLinksBlock store={store} config={{ title: "ما را در شبکه‌های اجتماعی دنبال کنید" }} />
      </div>
    )
  }

  return <RenderBlocks store={store} blocks={blocks} />
}
