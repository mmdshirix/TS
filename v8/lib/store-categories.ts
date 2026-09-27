// The 6 store categories required by the platform spec, matching the theme
// reference folders under /thems. theme_id mirrors the category slug for now
// (Phase 2 introduces real per-category coded themes).
export const STORE_CATEGORIES = [
  { slug: "clothing", label: "پوشاک و لباس" },
  { slug: "cosmetics", label: "آرایشی و بهداشتی" },
  { slug: "accessories", label: "اکسسوری و جواهرات" },
  { slug: "bags-shoes", label: "کیف و کفش" },
  { slug: "perfumes", label: "عطر و ادکلن" },
  { slug: "mobile", label: "موبایل و جانبی" },
] as const

export type StoreCategorySlug = (typeof STORE_CATEGORIES)[number]["slug"]
