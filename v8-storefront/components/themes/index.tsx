import type { LandingBlock, Store } from "@/lib/db"
import { listCategories, listProductsWithImages, countActiveProducts, listActiveStories } from "@/lib/db"
import { getTheme } from "@/lib/themes"
import { buildLandingContent } from "@/lib/landing-content"
import { getClinicSettings, listDoctors } from "@/lib/clinic-db"
import { getPharmacySettings } from "@/lib/pharmacy-db"
import type { ThemeHomeProps } from "@/components/themes/types"
import ClothingHome from "@/components/themes/clothing/home"
import CosmeticsHome from "@/components/themes/cosmetics/home"
import AccessoriesHome from "@/components/themes/accessories/home"
import BagsShoesHome from "@/components/themes/bags-shoes/home"
import PerfumesHome from "@/components/themes/perfumes/home"
import MobileHome from "@/components/themes/mobile/home"
import MedicalHome from "@/components/themes/medical/home"
import PharmacyHome from "@/components/themes/pharmacy/home"

/**
 * Server entry point: loads everything a themed landing needs in parallel and renders
 * the dedicated design for the store's category. Landing blocks (from the dashboard
 * builder) drive the content; the theme drives the presentation.
 */
export default async function ThemeHome({ store, blocks }: { store: Store; blocks: LandingBlock[] }) {
  const theme = getTheme(store.theme_id || store.category)
  const content = buildLandingContent(store, blocks, theme)

  const [products, newest, categories, stories, productCount] = await Promise.all([
    listProductsWithImages(store.id, { limit: content.productsLimit, categoryId: content.productsCategoryId, sort: "popular" }),
    listProductsWithImages(store.id, { limit: 8, sort: "newest" }),
    listCategories(store.id),
    listActiveStories(store.id),
    countActiveProducts(store.id),
  ])

  const props: ThemeHomeProps = { store, theme, content, products, newest, categories, stories, productCount }

  switch (theme.id) {
    case "clothing":
      return <ClothingHome {...props} />
    case "cosmetics":
      return <CosmeticsHome {...props} />
    case "accessories":
      return <AccessoriesHome {...props} />
    case "bags-shoes":
      return <BagsShoesHome {...props} />
    case "perfumes":
      return <PerfumesHome {...props} />
    case "medical": {
      const [doctors, clinic] = await Promise.all([listDoctors(store.id), getClinicSettings(store.id)])
      return <MedicalHome {...props} doctors={doctors} clinic={clinic} />
    }
    case "pharmacy": {
      const pharmacy = await getPharmacySettings(store.id)
      return <PharmacyHome {...props} pharmacy={pharmacy} />
    }
    case "mobile":
    default:
      return <MobileHome {...props} />
  }
}
