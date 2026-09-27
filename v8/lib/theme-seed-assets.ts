import type { StoreCategorySlug } from "@/lib/store-categories"

// Real seed images copied from thems/<category>/ into public/theme-seed/<slug>/ so new
// stores launch with a populated look instead of an empty shell. Filenames here must
// match what actually exists under public/theme-seed — see that folder if this list
// needs to change.
export interface ThemeSeedAssets {
  banners: string[]
  products: { name: string; file: string }[]
  categories: { name: string; file: string }[]
}

const SEED_ASSETS: Record<StoreCategorySlug, ThemeSeedAssets> = {
  clothing: {
    banners: ["banner-1.webp", "banner-2.webp"],
    products: [
      { name: "پیراهن کلاسیک", file: "product-1.jpg" },
      { name: "کت اسپرت", file: "product-2.webp" },
      { name: "شلوار جین", file: "product-3.jpg" },
      { name: "تی‌شرت ساده", file: "product-4.jpg" },
    ],
    categories: [
      { name: "پیراهن", file: "category-1.webp" },
      { name: "شلوار", file: "category-2.webp" },
      { name: "کت و ژاکت", file: "category-3.webp" },
      { name: "اکسسوری پوشاک", file: "category-4.webp" },
    ],
  },
  cosmetics: {
    banners: ["banner-1.png", "banner-2.png", "banner-3.png"],
    products: [
      { name: "کرم مرطوب‌کننده", file: "product-1.jpg" },
      { name: "رژ لب مات", file: "product-2.jpg" },
      { name: "سرم ویتامین C", file: "product-3.jpg" },
      { name: "پالت سایه چشم", file: "product-4.jpg" },
    ],
    categories: [
      { name: "مراقبت پوست", file: "category-1.png" },
      { name: "آرایش صورت", file: "category-2.png" },
      { name: "مراقبت مو", file: "category-3.png" },
      { name: "عطر و بادی اسپلش", file: "category-4.png" },
    ],
  },
  accessories: {
    banners: ["banner-1.png", "banner-2.png", "banner-3.png"],
    products: [
      { name: "دستبند طلایی", file: "product-1.png" },
      { name: "گردنبند مینیمال", file: "product-2.png" },
      { name: "گوشواره مروارید", file: "product-3.png" },
      { name: "ساعت مچی کلاسیک", file: "product-4.png" },
    ],
    categories: [
      { name: "دستبند", file: "category-1.png" },
      { name: "گردنبند", file: "category-2.png" },
      { name: "گوشواره", file: "category-3.png" },
      { name: "ساعت", file: "category-4.png" },
    ],
  },
  "bags-shoes": {
    banners: ["banner-1.webp", "banner-2.webp", "banner-3.webp"],
    products: [
      { name: "کیف دستی چرم", file: "product-1.webp" },
      { name: "کفش اسپرت", file: "product-2.webp" },
      { name: "کیف پول", file: "product-3.webp" },
      { name: "کفش رسمی", file: "product-4.webp" },
    ],
    categories: [
      { name: "کیف زنانه", file: "category-1.webp" },
      { name: "کفش مردانه", file: "category-2.webp" },
      { name: "کیف پول و اکسسوری", file: "category-3.webp" },
      { name: "کفش اسپرت", file: "category-4.webp" },
    ],
  },
  perfumes: {
    banners: ["banner-1.png", "banner-2.png", "banner-3.png"],
    products: [
      { name: "ادکلن مردانه", file: "product-1.jpeg" },
      { name: "عطر زنانه", file: "product-2.png" },
      { name: "اسپری خوش‌بوکننده", file: "product-3.jpeg" },
      { name: "ست هدیه عطر", file: "product-4.jpeg" },
    ],
    categories: [],
  },
  mobile: {
    banners: ["banner-1.png", "banner-2.png", "banner-3.png"],
    products: [
      { name: "قاب گوشی", file: "product-1.jpg" },
      { name: "هندزفری بی‌سیم", file: "product-2.jpg" },
      { name: "پاوربانک", file: "product-3.jpg" },
      { name: "شارژر فست شارژ", file: "product-4.jpeg" },
    ],
    categories: [
      { name: "قاب و کاور", file: "category-1.png" },
      { name: "هدفون و هندزفری", file: "category-2.png" },
      { name: "شارژر و کابل", file: "category-3.png" },
      { name: "لوازم جانبی", file: "category-4.png" },
    ],
  },
}

export function getThemeSeedAssets(category: string | null | undefined): ThemeSeedAssets | null {
  return SEED_ASSETS[category as StoreCategorySlug] || null
}

export function seedAssetUrl(slug: StoreCategorySlug, file: string): string {
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "")
  return `${base}/theme-seed/${slug}/${file}`
}
