// Storefront theme registry. One entry per store category. Colors/radius come from the
// store's saved color_scheme (seeded from v8/lib/theme-presets.ts) and are exposed as
// CSS variables by app/store/[slug]/layout.tsx; everything else about a theme's
// personality (fonts, header treatment, decorative motifs, product-card style) lives here.

export type ThemeId = "clothing" | "cosmetics" | "accessories" | "bags-shoes" | "perfumes" | "mobile" | "medical" | "pharmacy"

export interface ThemeDefinition {
  id: ThemeId
  label: string
  /** "shop" themes use cart/checkout; "clinic" adds booking; "pharmacy" adds prescriptions */
  kind: "shop" | "clinic" | "pharmacy"
  /** Header treatment */
  header: "light" | "dark" | "glass" | "editorial"
  /** Page background treatment */
  surface: "white" | "tinted" | "dark"
  /** Product card style */
  card: "editorial" | "soft" | "luxury" | "craft" | "noir" | "tech" | "clinical" | "pharma"
  /** Default hero copy used when the store has no banner text yet */
  heroTitle: string
  heroSubtitle: string
  heroCta: string
  /** Marquee / trust strip words */
  ticker: string[]
  /** Default nav labels */
  shopLabel: string
  /** Trust badges shown under the hero */
  trust: Array<{ icon: string; title: string; text: string }>
  defaults: { primary: string; secondary: string; surface: string; radius: string }
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  clothing: {
    id: "clothing",
    label: "پوشاک",
    kind: "shop",
    header: "editorial",
    surface: "white",
    card: "editorial",
    heroTitle: "کالکشن جدید، همین حالا",
    heroSubtitle: "استایل روزمره با جزئیاتی که دیده می‌شوند. طراحی‌های محدود، پارچه‌های باکیفیت.",
    heroCta: "مشاهده کالکشن",
    ticker: ["ارسال رایگان بالای ۱ میلیون", "۷ روز ضمانت بازگشت", "پارچه‌های درجه یک", "کالکشن محدود", "پرداخت امن"],
    shopLabel: "کالکشن",
    trust: [
      { icon: "truck", title: "ارسال سریع", text: "تحویل ۲ تا ۴ روز کاری" },
      { icon: "refresh", title: "تعویض سایز", text: "۷ روز فرصت تعویض" },
      { icon: "shield", title: "پرداخت امن", text: "درگاه‌های معتبر بانکی" },
    ],
    defaults: { primary: "#18181b", secondary: "#a16207", surface: "#fafaf9", radius: "0.375rem" },
  },
  cosmetics: {
    id: "cosmetics",
    label: "آرایشی و بهداشتی",
    kind: "shop",
    header: "glass",
    surface: "tinted",
    card: "soft",
    heroTitle: "درخشش طبیعی، هر روز",
    heroSubtitle: "محصولات اورجینال مراقبت پوست و آرایش با تضمین اصالت و مشاوره تخصصی.",
    heroCta: "خرید محصولات",
    ticker: ["۱۰۰٪ اورجینال", "مشاوره رایگان پوست", "ارسال با بسته‌بندی ویژه", "تست‌شده روی پوست حساس", "بدون آزمایش حیوانی"],
    shopLabel: "محصولات",
    trust: [
      { icon: "sparkles", title: "تضمین اصالت", text: "کد رهگیری روی هر محصول" },
      { icon: "leaf", title: "فرمول لطیف", text: "مناسب پوست‌های حساس" },
      { icon: "gift", title: "هدیه با هر سفارش", text: "سمپل رایگان" },
    ],
    defaults: { primary: "#db2777", secondary: "#f472b6", surface: "#fdf2f8", radius: "1.5rem" },
  },
  accessories: {
    id: "accessories",
    label: "اکسسوری و جواهرات",
    kind: "shop",
    header: "dark",
    surface: "tinted",
    card: "luxury",
    heroTitle: "جزئیاتی که شما را تعریف می‌کند",
    heroSubtitle: "جواهرات و اکسسوری دست‌ساز با آبکاری ماندگار و طراحی مینیمال.",
    heroCta: "کشف کالکشن",
    ticker: ["آبکاری ۱۸ عیار", "ضدحساسیت", "جعبه هدیه رایگان", "ضمانت رنگ‌ثابتی", "طراحی اختصاصی"],
    shopLabel: "کالکشن",
    trust: [
      { icon: "gem", title: "کیفیت جواهر", text: "ضمانت ۱۲ ماهه رنگ" },
      { icon: "gift", title: "بسته‌بندی هدیه", text: "با کارت پیام شخصی" },
      { icon: "shield", title: "پرداخت امن", text: "زرین‌پال و بله‌پی" },
    ],
    defaults: { primary: "#a16207", secondary: "#78350f", surface: "#fefce8", radius: "0.75rem" },
  },
  "bags-shoes": {
    id: "bags-shoes",
    label: "کیف و کفش",
    kind: "shop",
    header: "light",
    surface: "tinted",
    card: "craft",
    heroTitle: "چرم واقعی، ساخت دست",
    heroSubtitle: "کیف و کفش‌هایی که با هر روز استفاده زیباتر می‌شوند.",
    heroCta: "مشاهده محصولات",
    ticker: ["چرم طبیعی", "دوخت دستی", "ضمانت ۶ ماهه", "ارسال به سراسر ایران", "تعویض سایز رایگان"],
    shopLabel: "فروشگاه",
    trust: [
      { icon: "hand", title: "دست‌ساز", text: "تولید کارگاهی محدود" },
      { icon: "shield", title: "ضمانت اصالت چرم", text: "با گواهی کتبی" },
      { icon: "truck", title: "ارسال رایگان", text: "بالای ۲ میلیون تومان" },
    ],
    defaults: { primary: "#78350f", secondary: "#c2410c", surface: "#fff7ed", radius: "0.875rem" },
  },
  perfumes: {
    id: "perfumes",
    label: "عطر و ادکلن",
    kind: "shop",
    header: "dark",
    surface: "dark",
    card: "noir",
    heroTitle: "رایحه‌ای که به یاد می‌ماند",
    heroSubtitle: "عطرهای اورجینال و نیش با ضمانت اصالت و امکان تست قبل از خرید.",
    heroCta: "کشف رایحه‌ها",
    ticker: ["ضمانت اصالت", "سمپل رایگان", "نیش و برندهای لاکچری", "ماندگاری بالا", "بسته‌بندی لوکس"],
    shopLabel: "رایحه‌ها",
    trust: [
      { icon: "shield", title: "اورجینال", text: "بازگشت وجه در صورت غیراصل بودن" },
      { icon: "wind", title: "تست رایحه", text: "سمپل ۲ میل با هر سفارش" },
      { icon: "gift", title: "بسته‌بندی هدیه", text: "با کارت اختصاصی" },
    ],
    defaults: { primary: "#6d28d9", secondary: "#a78bfa", surface: "#0b0714", radius: "1rem" },
  },
  mobile: {
    id: "mobile",
    label: "موبایل و جانبی",
    kind: "shop",
    header: "glass",
    surface: "white",
    card: "tech",
    heroTitle: "تکنولوژی در دستان شما",
    heroSubtitle: "جدیدترین گوشی‌ها و لوازم جانبی با گارانتی معتبر و قیمت رقابتی.",
    heroCta: "مشاهده محصولات",
    ticker: ["گارانتی ۱۸ ماهه", "ارسال ۲۴ ساعته تهران", "رجیستر شده", "پرداخت اقساطی", "پشتیبانی تخصصی"],
    shopLabel: "محصولات",
    trust: [
      { icon: "shield", title: "گارانتی رسمی", text: "۱۸ ماه شرکتی" },
      { icon: "zap", title: "ارسال فوری", text: "تهران ۲۴ ساعت" },
      { icon: "headphones", title: "پشتیبانی", text: "مشاوره خرید تخصصی" },
    ],
    defaults: { primary: "#2563eb", secondary: "#0ea5e9", surface: "#f0f9ff", radius: "0.5rem" },
  },
  medical: {
    id: "medical",
    label: "مطب و کلینیک",
    kind: "clinic",
    header: "glass",
    surface: "tinted",
    card: "clinical",
    heroTitle: "سلامت شما، در چند کلیک",
    heroSubtitle: "نوبت آنلاین با تقویم شمسی، پرداخت ویزیت و راهنمای هوشمند برای انتخاب متخصص مناسب.",
    heroCta: "رزرو نوبت",
    ticker: ["نوبت‌دهی ۲۴ ساعته", "پرداخت آنلاین ویزیت", "یادآوری پیامکی", "راهنمای هوشمند علائم", "پزشکان متخصص"],
    shopLabel: "خدمات",
    trust: [
      { icon: "calendar", title: "نوبت آنلاین", text: "تقویم شمسی، انتخاب ساعت" },
      { icon: "shield", title: "محرمانگی", text: "اطلاعات شما محفوظ است" },
      { icon: "sparkles", title: "دستیار هوشمند", text: "راهنمایی تا انتخاب متخصص" },
    ],
    defaults: { primary: "#0f766e", secondary: "#0ea5e9", surface: "#f0fdfa", radius: "1rem" },
  },
  pharmacy: {
    id: "pharmacy",
    label: "داروخانه",
    kind: "pharmacy",
    header: "glass",
    surface: "tinted",
    card: "pharma",
    heroTitle: "داروخانه‌ای که همیشه باز است",
    heroSubtitle: "ارسال نسخه، تحویل دارو در محل، مکمل و محصولات بهداشتی با مشاوره داروساز.",
    heroCta: "ارسال نسخه",
    ticker: ["تحویل در محل", "مشاوره داروساز", "پذیرش بیمه", "داروی اورجینال", "پاسخ‌گویی ۲۴ ساعته"],
    shopLabel: "محصولات",
    trust: [
      { icon: "pill", title: "مشاوره داروساز", text: "پاسخ سریع به سوالات دارویی" },
      { icon: "truck", title: "تحویل سریع", text: "ارسال در همان روز" },
      { icon: "shield", title: "دارو اصل", text: "تامین از شرکت‌های معتبر" },
    ],
    defaults: { primary: "#15803d", secondary: "#22c55e", surface: "#f0fdf4", radius: "1.25rem" },
  },
}

export function getTheme(categoryOrThemeId: string | null | undefined): ThemeDefinition {
  const id = (categoryOrThemeId || "") as ThemeId
  return THEMES[id] || THEMES.mobile
}

export function isThemeId(id: string | null | undefined): id is ThemeId {
  return Boolean(id && id in THEMES)
}
