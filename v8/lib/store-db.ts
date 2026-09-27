import { getSql, createChatbot } from "@/lib/db"
import { getDefaultBlockLayout } from "@/lib/theme-presets"
import { getThemeSeedAssets, seedAssetUrl } from "@/lib/theme-seed-assets"
import type { StoreCategorySlug } from "@/lib/store-categories"

// --- TYPE DEFINITIONS ---

export interface Store {
  id: number
  user_id: number
  chatbot_id: number | null
  name: string
  slug: string
  description: string | null
  category: string | null
  status: "draft" | "published"
  theme_id: string | null
  favicon_url: string | null
  logo_url: string | null
  color_scheme: Record<string, any>
  contact_phone: string | null
  contact_address: string | null
  social_links: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  id: number
  store_id: number
  name: string
  slug: string
  parent_id: number | null
  image_url: string | null
  created_at: string
}

export interface Product {
  id: number
  store_id: number
  category_id: number | null
  name: string
  slug: string
  type: "physical" | "digital" | "service"
  price: number
  compare_at_price: number | null
  description: string | null
  sku: string | null
  inventory_count: number | null
  digital_download_url: string | null
  video_url: string | null
  status: "active" | "draft"
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: number
  product_id: number
  url: string
  sort_order: number
}

export interface ProductVariant {
  id: number
  product_id: number
  name: string
  price_override: number | null
  inventory_count: number | null
}

export const LANDING_BLOCK_TYPES = [
  "banner",
  "text",
  "products",
  "categories",
  "contact",
  "cta_button",
  "store_address",
  "social_links",
  "store_identity",
]

export interface LandingBlock {
  id: number
  store_id: number
  type: string
  page: string
  position: number
  enabled: boolean
  config: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CheckoutFieldSetting {
  id: number
  store_id: number
  field_key: string
  label: string
  required: boolean
  enabled: boolean
  sort_order: number
}

const DEFAULT_CHECKOUT_FIELDS: Array<{ field_key: string; label: string; required: boolean }> = [
  { field_key: "full_name", label: "نام و نام خانوادگی", required: true },
  { field_key: "phone", label: "شماره تماس", required: true },
  { field_key: "province", label: "استان", required: true },
  { field_key: "city", label: "شهر", required: true },
  { field_key: "address", label: "آدرس کامل", required: true },
  { field_key: "postal_code", label: "کد پستی", required: false },
  { field_key: "notes", label: "توضیحات سفارش", required: false },
]

function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return base || `store-${Date.now()}`
}

// --- STORE FUNCTIONS ---

export async function createStore(data: {
  user_id: number
  name: string
  description?: string
  category?: string
  chatbot_id?: number | null
}): Promise<Store> {
  const sql = getSql()
  if (!data.name || data.name.trim() === "") {
    throw new Error("نام فروشگاه الزامی است")
  }

  let slug = slugify(data.name)
  const existing = await sql`SELECT id FROM stores WHERE slug = ${slug}`
  if (existing.length > 0) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
  }

  // theme_id mirrors category for now (one default theme per category, see lib/theme-presets.ts)
  const themeId = data.category || null

  const result = await sql`
    INSERT INTO stores (user_id, chatbot_id, name, slug, description, category, status, theme_id)
    VALUES (${data.user_id}, ${data.chatbot_id || null}, ${data.name.trim()}, ${slug}, ${data.description || null}, ${data.category || null}, 'draft', ${themeId})
    RETURNING *
  `
  const store = result[0] as unknown as Store

  for (const field of DEFAULT_CHECKOUT_FIELDS) {
    await sql`
      INSERT INTO checkout_field_settings (store_id, field_key, label, required, enabled, sort_order)
      VALUES (${store.id}, ${field.field_key}, ${field.label}, ${field.required}, TRUE, ${DEFAULT_CHECKOUT_FIELDS.indexOf(field)})
      ON CONFLICT (store_id, field_key) DO NOTHING
    `
  }

  // Auto-create a dedicated chatbot for this store, named after it, before seeding
  // products — createProduct() already calls syncProductToChatbotKnowledgeBase()
  // internally, which only does anything once store.chatbot_id is set, so linking
  // the chatbot first means every seeded (and later, manually added) product mirrors
  // into its knowledge base automatically via that existing mechanism.
  // Wrapped defensively: a chatbot/knowledge-base hiccup must never block store creation.
  try {
    const chatbot = await createChatbot({
      name: data.name.trim(),
      user_id: data.user_id,
      business_info: data.description || null,
      welcome_message: `سلام 👋 به فروشگاه ${data.name.trim()} خوش آمدید! چطور می‌توانم کمکتان کنم؟`,
    })
    await sql`UPDATE stores SET chatbot_id = ${chatbot.id} WHERE id = ${store.id}`
    store.chatbot_id = chatbot.id
  } catch (error) {
    console.error("Error auto-creating chatbot for store:", error)
  }

  try {
    await seedThemeContent(store.id, data.category)
    await seedDefaultLandingBlocks(store.id, data.category)
  } catch (error) {
    console.error("Error seeding theme content for store:", error)
  }

  return store
}

// Populates a brand-new store with real sample categories/products for its chosen
// theme (see lib/theme-seed-assets.ts) so it doesn't launch empty. Everything created
// here is just normal, editable/deletable rows — no "seeded" flag.
async function seedThemeContent(storeId: number, category?: string): Promise<void> {
  const assets = getThemeSeedAssets(category)
  if (!assets) return
  const slug = category as StoreCategorySlug

  for (const cat of assets.categories) {
    await createCategory({ store_id: storeId, name: cat.name, image_url: seedAssetUrl(slug, cat.file) })
  }

  for (const prod of assets.products) {
    const product = await createProduct({
      store_id: storeId,
      name: prod.name,
      price: 500000,
      status: "active",
    })
    await addProductImage(product.id, seedAssetUrl(slug, prod.file), 0)
  }
}

export async function getStoreByUserId(userId: number): Promise<Store | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM stores WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1`
  return result.length > 0 ? (result[0] as unknown as Store) : null
}

export async function getStoreById(id: number): Promise<Store | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM stores WHERE id = ${id}`
  return result.length > 0 ? (result[0] as unknown as Store) : null
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM stores WHERE slug = ${slug}`
  return result.length > 0 ? (result[0] as unknown as Store) : null
}

export async function updateStore(id: number, updates: Partial<Store>): Promise<Store | null> {
  const sql = getSql()
  const current = await getStoreById(id)
  if (!current) return null

  const result = await sql`
    UPDATE stores SET
      name = ${updates.name ?? current.name},
      description = ${updates.description ?? current.description},
      category = ${updates.category ?? current.category},
      status = ${updates.status ?? current.status},
      theme_id = ${updates.theme_id ?? current.theme_id},
      favicon_url = ${updates.favicon_url ?? current.favicon_url},
      logo_url = ${updates.logo_url ?? current.logo_url},
      color_scheme = ${JSON.stringify(updates.color_scheme ?? current.color_scheme ?? {})},
      contact_phone = ${updates.contact_phone ?? current.contact_phone},
      contact_address = ${updates.contact_address ?? current.contact_address},
      social_links = ${JSON.stringify(updates.social_links ?? current.social_links ?? {})},
      chatbot_id = ${updates.chatbot_id !== undefined ? updates.chatbot_id : current.chatbot_id},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result.length > 0 ? (result[0] as unknown as Store) : null
}

// --- CATEGORY FUNCTIONS ---

export async function createCategory(data: {
  store_id: number
  name: string
  parent_id?: number | null
  image_url?: string | null
}): Promise<ProductCategory> {
  const sql = getSql()
  let slug = slugify(data.name)
  const existing = await sql`SELECT id FROM product_categories WHERE store_id = ${data.store_id} AND slug = ${slug}`
  if (existing.length > 0) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
  }
  const result = await sql`
    INSERT INTO product_categories (store_id, name, slug, parent_id, image_url)
    VALUES (${data.store_id}, ${data.name.trim()}, ${slug}, ${data.parent_id || null}, ${data.image_url || null})
    RETURNING *
  `
  return result[0] as unknown as ProductCategory
}

export async function updateCategory(
  id: number,
  data: { name?: string; parent_id?: number | null; image_url?: string | null },
): Promise<ProductCategory | null> {
  const sql = getSql()
  const result = await sql`
    UPDATE product_categories SET
      name = COALESCE(${data.name ?? null}, name),
      parent_id = ${data.parent_id !== undefined ? data.parent_id : sql`parent_id`},
      image_url = ${data.image_url !== undefined ? data.image_url : sql`image_url`}
    WHERE id = ${id}
    RETURNING *
  `
  return result.length > 0 ? (result[0] as unknown as ProductCategory) : null
}

export async function listCategoriesByStore(storeId: number): Promise<ProductCategory[]> {
  const sql = getSql()
  const result = await sql`SELECT * FROM product_categories WHERE store_id = ${storeId} ORDER BY created_at ASC`
  return result as unknown as ProductCategory[]
}

export async function deleteCategory(id: number): Promise<boolean> {
  const sql = getSql()
  await sql`DELETE FROM product_categories WHERE id = ${id}`
  return true
}

// --- PRODUCT FUNCTIONS ---

export async function createProduct(data: {
  store_id: number
  category_id?: number | null
  name: string
  type?: "physical" | "digital" | "service"
  price: number
  compare_at_price?: number | null
  description?: string | null
  sku?: string | null
  inventory_count?: number | null
  digital_download_url?: string | null
  video_url?: string | null
  status?: "active" | "draft"
}): Promise<Product> {
  const sql = getSql()
  if (!data.name || data.name.trim() === "") {
    throw new Error("نام محصول الزامی است")
  }

  let slug = slugify(data.name)
  const existing = await sql`SELECT id FROM products WHERE store_id = ${data.store_id} AND slug = ${slug}`
  if (existing.length > 0) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
  }

  const result = await sql`
    INSERT INTO products (
      store_id, category_id, name, slug, type, price, compare_at_price,
      description, sku, inventory_count, digital_download_url, video_url, status
    ) VALUES (
      ${data.store_id}, ${data.category_id || null}, ${data.name.trim()}, ${slug},
      ${data.type || "physical"}, ${data.price}, ${data.compare_at_price || null},
      ${data.description || null}, ${data.sku || null}, ${data.inventory_count ?? null},
      ${data.digital_download_url || null}, ${data.video_url || null}, ${data.status || "draft"}
    )
    RETURNING *
  `
  const product = result[0] as unknown as Product
  await syncProductToChatbotKnowledgeBase(product.id)
  return product
}

export async function getProduct(id: number): Promise<Product | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM products WHERE id = ${id}`
  return result.length > 0 ? (result[0] as unknown as Product) : null
}

export async function listProductsByStore(storeId: number): Promise<(Product & { image_url: string | null })[]> {
  const sql = getSql()
  const result = await sql`
    SELECT p.*, (
      SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1
    ) as image_url
    FROM products p
    WHERE p.store_id = ${storeId}
    ORDER BY p.created_at DESC
  `
  return result as unknown as (Product & { image_url: string | null })[]
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
  const sql = getSql()
  const current = await getProduct(id)
  if (!current) return null

  const result = await sql`
    UPDATE products SET
      category_id = ${updates.category_id !== undefined ? updates.category_id : current.category_id},
      name = ${updates.name ?? current.name},
      type = ${updates.type ?? current.type},
      price = ${updates.price ?? current.price},
      compare_at_price = ${updates.compare_at_price !== undefined ? updates.compare_at_price : current.compare_at_price},
      description = ${updates.description !== undefined ? updates.description : current.description},
      sku = ${updates.sku !== undefined ? updates.sku : current.sku},
      inventory_count = ${updates.inventory_count !== undefined ? updates.inventory_count : current.inventory_count},
      digital_download_url = ${updates.digital_download_url !== undefined ? updates.digital_download_url : current.digital_download_url},
      video_url = ${updates.video_url !== undefined ? updates.video_url : current.video_url},
      status = ${updates.status ?? current.status},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  const product = result.length > 0 ? (result[0] as unknown as Product) : null
  if (product) {
    await syncProductToChatbotKnowledgeBase(product.id)
  }
  return product
}

export async function deleteProduct(id: number): Promise<boolean> {
  const sql = getSql()
  await removeProductChatbotMirror(id)
  await sql`DELETE FROM products WHERE id = ${id}`
  return true
}

// --- PRODUCT IMAGE FUNCTIONS ---

export async function addProductImage(productId: number, url: string, sortOrder = 0): Promise<ProductImage> {
  const sql = getSql()
  const result = await sql`
    INSERT INTO product_images (product_id, url, sort_order)
    VALUES (${productId}, ${url}, ${sortOrder})
    RETURNING *
  `
  return result[0] as unknown as ProductImage
}

export async function listProductImages(productId: number): Promise<ProductImage[]> {
  const sql = getSql()
  const result = await sql`SELECT * FROM product_images WHERE product_id = ${productId} ORDER BY sort_order ASC`
  return result as unknown as ProductImage[]
}

export async function deleteProductImage(id: number): Promise<boolean> {
  const sql = getSql()
  await sql`DELETE FROM product_images WHERE id = ${id}`
  return true
}

// --- PRODUCT VARIANT FUNCTIONS ---

export async function addProductVariant(data: {
  product_id: number
  name: string
  price_override?: number | null
  inventory_count?: number | null
}): Promise<ProductVariant> {
  const sql = getSql()
  const result = await sql`
    INSERT INTO product_variants (product_id, name, price_override, inventory_count)
    VALUES (${data.product_id}, ${data.name}, ${data.price_override || null}, ${data.inventory_count ?? null})
    RETURNING *
  `
  return result[0] as unknown as ProductVariant
}

export async function listProductVariants(productId: number): Promise<ProductVariant[]> {
  const sql = getSql()
  const result = await sql`SELECT * FROM product_variants WHERE product_id = ${productId} ORDER BY id ASC`
  return result as unknown as ProductVariant[]
}

export async function deleteProductVariant(id: number): Promise<boolean> {
  const sql = getSql()
  await sql`DELETE FROM product_variants WHERE id = ${id}`
  return true
}

// --- CHECKOUT FIELD SETTINGS ---

export async function listCheckoutFields(storeId: number): Promise<CheckoutFieldSetting[]> {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM checkout_field_settings WHERE store_id = ${storeId} ORDER BY sort_order ASC
  `
  return result as unknown as CheckoutFieldSetting[]
}

export async function updateCheckoutField(
  id: number,
  updates: Partial<Pick<CheckoutFieldSetting, "label" | "required" | "enabled" | "sort_order">>,
): Promise<CheckoutFieldSetting | null> {
  const sql = getSql()
  const result = await sql`
    UPDATE checkout_field_settings SET
      label = COALESCE(${updates.label}, label),
      required = COALESCE(${updates.required}, required),
      enabled = COALESCE(${updates.enabled}, enabled),
      sort_order = COALESCE(${updates.sort_order}, sort_order)
    WHERE id = ${id}
    RETURNING *
  `
  return result.length > 0 ? (result[0] as unknown as CheckoutFieldSetting) : null
}

// --- LANDING PAGE BUILDER (BLOCKS) ---

export async function getLandingBlockById(id: number): Promise<LandingBlock | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM landing_page_blocks WHERE id = ${id}`
  return result.length > 0 ? (result[0] as unknown as LandingBlock) : null
}

export async function listLandingBlocks(storeId: number, page: string = "home"): Promise<LandingBlock[]> {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM landing_page_blocks WHERE store_id = ${storeId} AND page = ${page} ORDER BY position ASC
  `
  return result as unknown as LandingBlock[]
}

export async function createLandingBlock(data: {
  store_id: number
  type: string
  page?: string
  config?: Record<string, any>
}): Promise<LandingBlock> {
  const sql = getSql()
  const page = data.page || "home"
  const existing = await sql`
    SELECT COALESCE(MAX(position), -1) as max_position FROM landing_page_blocks WHERE store_id = ${data.store_id} AND page = ${page}
  `
  const nextPosition = Number(existing[0]?.max_position ?? -1) + 1

  const result = await sql`
    INSERT INTO landing_page_blocks (store_id, type, page, position, config)
    VALUES (${data.store_id}, ${data.type}, ${page}, ${nextPosition}, ${JSON.stringify(data.config || {})})
    RETURNING *
  `
  return result[0] as unknown as LandingBlock
}

export async function updateLandingBlock(
  id: number,
  updates: Partial<Pick<LandingBlock, "enabled" | "config" | "position">>,
): Promise<LandingBlock | null> {
  const sql = getSql()
  const current = await sql`SELECT * FROM landing_page_blocks WHERE id = ${id}`
  if (current.length === 0) return null
  const existing = current[0] as unknown as LandingBlock

  const result = await sql`
    UPDATE landing_page_blocks SET
      enabled = ${updates.enabled ?? existing.enabled},
      config = ${JSON.stringify(updates.config ?? existing.config)},
      position = ${updates.position ?? existing.position},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] as unknown as LandingBlock
}

export async function deleteLandingBlock(id: number): Promise<boolean> {
  const sql = getSql()
  await sql`DELETE FROM landing_page_blocks WHERE id = ${id}`
  return true
}

export async function reorderLandingBlocks(storeId: number, order: Array<{ id: number; position: number }>): Promise<void> {
  const sql = getSql()
  for (const item of order) {
    await sql`
      UPDATE landing_page_blocks SET position = ${item.position}, updated_at = NOW()
      WHERE id = ${item.id} AND store_id = ${storeId}
    `
  }
}

export async function seedDefaultLandingBlocks(storeId: number, category?: string): Promise<void> {
  const sql = getSql()
  const existing = await sql`SELECT id FROM landing_page_blocks WHERE store_id = ${storeId} LIMIT 1`
  if (existing.length > 0) return

  const assets = getThemeSeedAssets(category)
  const bannerImageUrl = assets ? seedAssetUrl(category as StoreCategorySlug, assets.banners[0]) : undefined
  const aboutText = "این فروشگاه هنوز توضیحاتی برای بخش درباره ما ثبت نکرده است. این متن نمونه است و قابل ویرایش می‌باشد."

  const pages: Array<"home" | "about" | "contact"> = ["home", "about", "contact"]
  for (const page of pages) {
    for (const block of getDefaultBlockLayout(page, { bannerImageUrl, aboutText })) {
      await createLandingBlock({ store_id: storeId, type: block.type, page, config: block.config })
    }
  }
}

export async function resetLandingBlocksToDefault(storeId: number, page: string = "home"): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM landing_page_blocks WHERE store_id = ${storeId} AND page = ${page}`
  for (const block of getDefaultBlockLayout(page as "home" | "about" | "contact")) {
    await createLandingBlock({ store_id: storeId, type: block.type, page, config: block.config })
  }
}

// --- CHATBOT KNOWLEDGE-BASE SYNC ---
// One-way mirror: real store products -> chatbot_products, keyed by source_product_id.
// Does not touch chatbot_products rows created directly by the chatbot builder (source_product_id IS NULL).

export async function syncProductToChatbotKnowledgeBase(productId: number): Promise<void> {
  const sql = getSql()

  const product = await getProduct(productId)
  if (!product) return

  const store = await getStoreById(product.store_id)
  if (!store || !store.chatbot_id) return

  const images = await listProductImages(productId)
  const imageUrl = images[0]?.url || null

  const existing = await sql`
    SELECT id FROM chatbot_products WHERE source_product_id = ${productId}
  `

  if (existing.length > 0) {
    await sql`
      UPDATE chatbot_products SET
        name = ${product.name},
        description = ${product.description},
        image_url = ${imageUrl},
        price = ${product.price}
      WHERE source_product_id = ${productId}
    `
  } else {
    await sql`
      INSERT INTO chatbot_products (chatbot_id, name, description, image_url, price, source_product_id)
      VALUES (${store.chatbot_id}, ${product.name}, ${product.description}, ${imageUrl}, ${product.price}, ${productId})
    `
  }
}

export async function removeProductChatbotMirror(productId: number): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM chatbot_products WHERE source_product_id = ${productId}`
}
