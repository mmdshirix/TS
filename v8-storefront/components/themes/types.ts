import type { ProductCategory, ProductWithImage, Store, StoreStory } from "@/lib/db"
import type { LandingContent } from "@/lib/landing-content"
import type { ThemeDefinition } from "@/lib/themes"

export interface ThemeHomeProps {
  store: Store
  theme: ThemeDefinition
  content: LandingContent
  products: ProductWithImage[]
  newest: ProductWithImage[]
  categories: ProductCategory[]
  stories: StoreStory[]
  productCount: number
}
