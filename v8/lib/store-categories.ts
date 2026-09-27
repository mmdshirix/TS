// Store categories / templates offered by the platform. Each slug maps to a dedicated,
// hand-designed storefront theme in v8-storefront (components/themes/<slug>) plus a
// token set in lib/theme-presets.ts. `kind` tells the dashboard which extra modules
// (clinic booking, pharmacy prescriptions) to surface for that store.
export const STORE_CATEGORIES = [
  { slug: "clothing", label: "پوشاک و لباس", kind: "shop", emoji: "👗", tagline: "ادیتوریال، مینیمال، مدرن" },
  { slug: "cosmetics", label: "آرایشی و بهداشتی", kind: "shop", emoji: "💄", tagline: "لطیف، درخشان، حس زیبایی" },
  { slug: "accessories", label: "اکسسوری و جواهرات", kind: "shop", emoji: "💍", tagline: "لاکچری، طلایی، جزئیات ظریف" },
  { slug: "bags-shoes", label: "کیف و کفش", kind: "shop", emoji: "👜", tagline: "چرم، گرم، دست‌ساز" },
  { slug: "perfumes", label: "عطر و ادکلن", kind: "shop", emoji: "🧴", tagline: "تیره، رازآلود، حس بویایی" },
  { slug: "mobile", label: "موبایل و جانبی", kind: "shop", emoji: "📱", tagline: "تکنولوژی، سریع، نئونی" },
  { slug: "medical", label: "مطب و کلینیک پزشکی", kind: "clinic", emoji: "🩺", tagline: "نوبت‌دهی آنلاین + دستیار هوشمند" },
  { slug: "pharmacy", label: "داروخانه آنلاین", kind: "pharmacy", emoji: "💊", tagline: "نسخه آنلاین، مشاوره داروساز" },
] as const

export type StoreCategorySlug = (typeof STORE_CATEGORIES)[number]["slug"]
export type StoreKind = (typeof STORE_CATEGORIES)[number]["kind"]

export function getStoreCategory(slug: string | null | undefined) {
  return STORE_CATEGORIES.find((c) => c.slug === slug) || null
}

export function getStoreKind(slug: string | null | undefined): StoreKind {
  return getStoreCategory(slug)?.kind || "shop"
}
