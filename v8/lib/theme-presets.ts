import { STORE_CATEGORIES, type StoreCategorySlug } from "@/lib/store-categories"

// One coded theme per category. Each carries a full small token set (not just an
// accent color) so every category renders with a distinct, tasteful personality
// once applied via CSS variables on the storefront (see app/store/[slug]/layout.tsx
// in v8-storefront, which turns these into --store-primary/secondary/surface/radius).
export interface ThemeTokens {
  primary: string
  secondary: string
  surface: string
  radius: string
}

export interface ThemePreset extends ThemeTokens {
  id: StoreCategorySlug
  label: string
  previewImage: string
  /** @deprecated use `primary` */
  accentColor: string
}

const THEME_TOKENS: Record<StoreCategorySlug, ThemeTokens> = {
  // Editorial fashion: near-black authority, muted gold accent, sharp corners.
  clothing: { primary: "#18181b", secondary: "#a16207", surface: "#fafaf9", radius: "0.375rem" },
  // Soft beauty: warm pink, blush surface, very rounded/pill shapes.
  cosmetics: { primary: "#db2777", secondary: "#f472b6", surface: "#fdf2f8", radius: "1.5rem" },
  // Jewelry/accessories: gold + bronze, cream surface, elegant medium radius.
  accessories: { primary: "#a16207", secondary: "#78350f", surface: "#fefce8", radius: "0.75rem" },
  // Leather craft: warm brown + burnt-orange, parchment surface.
  "bags-shoes": { primary: "#78350f", secondary: "#c2410c", surface: "#fff7ed", radius: "0.875rem" },
  // Luxury fragrance: deep violet + lavender, soft purple surface.
  perfumes: { primary: "#6d28d9", secondary: "#a78bfa", surface: "#faf5ff", radius: "1rem" },
  // Tech/mobile: cool blue + sky, crisp corners.
  mobile: { primary: "#2563eb", secondary: "#0ea5e9", surface: "#f0f9ff", radius: "0.5rem" },
}

const PREVIEW_IMAGES: Record<StoreCategorySlug, string> = {
  clothing: "/theme-previews/clothing.webp",
  cosmetics: "/theme-previews/cosmetics.webp",
  accessories: "/theme-previews/accessories.png",
  "bags-shoes": "/theme-previews/bags-shoes.webp",
  perfumes: "/theme-previews/perfumes.webp",
  mobile: "/theme-previews/mobile.webp",
}

export const THEME_PRESETS: ThemePreset[] = STORE_CATEGORIES.map((c) => ({
  id: c.slug,
  label: c.label,
  previewImage: PREVIEW_IMAGES[c.slug],
  accentColor: THEME_TOKENS[c.slug].primary,
  ...THEME_TOKENS[c.slug],
}))

export function getThemePreset(themeId: string | null | undefined): ThemePreset | null {
  return THEME_PRESETS.find((t) => t.id === themeId) || null
}

// Default landing-page block layout seeded for every theme/page. `page` selects which
// page these blocks belong to (see landing_page_blocks.page); content can be pre-filled
// with real seed assets for a given category (see lib/theme-seed-assets.ts) so new
// stores don't launch empty.
export function getDefaultBlockLayout(
  page: "home" | "about" | "contact" = "home",
  seed?: { bannerImageUrl?: string; bannerTitle?: string; aboutText?: string },
): Array<{ type: string; config: Record<string, any> }> {
  if (page === "about") {
    return [
      {
        type: "banner",
        config: { slides: [{ image_url: seed?.bannerImageUrl || "", title: seed?.bannerTitle || "درباره ما", subtitle: "", link_url: "", link_text: "" }] },
      },
      { type: "text", config: { title: "داستان ما", body: seed?.aboutText || "" } },
    ]
  }

  if (page === "contact") {
    return [
      { type: "contact", config: { title: "تماس با ما", show_phone: true, show_form: true } },
      { type: "store_address", config: { show_map: true } },
      { type: "social_links", config: { title: "ما را در شبکه‌های اجتماعی دنبال کنید" } },
    ]
  }

  return [
    { type: "store_identity", config: {} },
    {
      type: "banner",
      config: { slides: [{ image_url: seed?.bannerImageUrl || "", title: seed?.bannerTitle || "", subtitle: "", link_url: "", link_text: "" }] },
    },
    { type: "categories", config: { title: "دسته‌بندی‌ها", category_ids: [] } },
    { type: "products", config: { title: "محصولات ویژه", mode: "all", category_id: null, product_ids: [], limit: 8 } },
    { type: "text", config: { title: "درباره فروشگاه ما", body: seed?.aboutText || "" } },
    { type: "cta_button", config: { text: "مشاهده همه محصولات", link_url: "/shop", style: "primary" } },
    { type: "social_links", config: { title: "ما را دنبال کنید" } },
    { type: "store_address", config: { show_map: false } },
    { type: "contact", config: { title: "تماس با ما", show_phone: true, show_form: true } },
  ]
}
