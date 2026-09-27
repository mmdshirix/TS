import type { ComponentType } from "react"
import type { Store, LandingBlock } from "@/lib/db"
import StoreIdentityBlock from "@/components/blocks/store-identity-block"
import BannerBlock from "@/components/blocks/banner-block"
import TextBlock from "@/components/blocks/text-block"
import ProductsBlock from "@/components/blocks/products-block"
import CategoriesBlock from "@/components/blocks/categories-block"
import ContactBlock from "@/components/blocks/contact-block"
import CtaButtonBlock from "@/components/blocks/cta-button-block"
import StoreAddressBlock from "@/components/blocks/store-address-block"
import SocialLinksBlock from "@/components/blocks/social-links-block"

export const BLOCK_COMPONENTS: Record<string, ComponentType<any>> = {
  store_identity: StoreIdentityBlock,
  banner: BannerBlock,
  text: TextBlock,
  products: ProductsBlock,
  categories: CategoriesBlock,
  contact: ContactBlock,
  cta_button: CtaButtonBlock,
  store_address: StoreAddressBlock,
  social_links: SocialLinksBlock,
}

export function RenderBlocks({ store, blocks }: { store: Store; blocks: LandingBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type]
        if (!Component) return null
        return <Component key={block.id} store={store} config={block.config || {}} />
      })}
    </>
  )
}
