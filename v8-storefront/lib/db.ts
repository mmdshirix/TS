import { getSharedSql } from "@/lib/postgres"

// Read-only data layer. Tables are owned and migrated by the platform-talksell.ir
// app (v8) — this app only ever SELECTs from them. Shapes must stay in sync with
// that app's lib/store-db.ts.

export function getSql() {
  return getSharedSql()
}

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
}

export interface ProductCategory {
  id: number
  store_id: number
  name: string
  slug: string
  parent_id: number | null
  image_url: string | null
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
  video_url: string | null
  status: "active" | "draft"
  rating_avg: number
  rating_count: number
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

export interface CheckoutFieldSetting {
  id: number
  field_key: string
  label: string
  required: boolean
}

export interface LandingBlock {
  id: number
  store_id: number
  type: string
  page: string
  position: number
  enabled: boolean
  config: Record<string, any>
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM stores WHERE slug = ${slug} AND status = 'published'`
    return result.length > 0 ? (result[0] as unknown as Store) : null
  } catch (error) {
    console.error("Error fetching store by slug:", error)
    return null
  }
}

// Owner-only draft preview lookup — skips the published-status filter. Only reached
// via the ?preview=1 flow (see middleware.ts x-preview-draft header), never from
// normal subdomain traffic, so unpublished stores stay hidden from real customers.
export async function getStoreBySlugForPreview(slug: string): Promise<Store | null> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM stores WHERE slug = ${slug}`
    return result.length > 0 ? (result[0] as unknown as Store) : null
  } catch (error) {
    console.error("Error fetching store by slug (preview):", error)
    return null
  }
}

export async function listLandingBlocks(storeId: number, page: string = "home"): Promise<LandingBlock[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM landing_page_blocks
      WHERE store_id = ${storeId} AND page = ${page} AND enabled = TRUE
      ORDER BY position ASC
    `
    return result as unknown as LandingBlock[]
  } catch (error) {
    console.error("Error fetching landing blocks:", error)
    return []
  }
}

export async function listCategories(storeId: number): Promise<ProductCategory[]> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM product_categories WHERE store_id = ${storeId} ORDER BY name ASC`
    return result as unknown as ProductCategory[]
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function getCategoryBySlug(storeId: number, slug: string): Promise<ProductCategory | null> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM product_categories WHERE store_id = ${storeId} AND slug = ${slug}`
    return result.length > 0 ? (result[0] as unknown as ProductCategory) : null
  } catch (error) {
    console.error("Error fetching category by slug:", error)
    return null
  }
}

export async function listProducts(
  storeId: number,
  options: { search?: string; categoryId?: number; page?: number; limit?: number } = {},
): Promise<{ products: Product[]; total: number }> {
  try {
    const sql = getSql()
    const page = Math.max(1, options.page || 1)
    const limit = Math.min(48, options.limit || 12)
    const offset = (page - 1) * limit
    const search = options.search ? `%${options.search}%` : null

    const result = await sql`
      SELECT * FROM products
      WHERE store_id = ${storeId}
        AND status = 'active'
        AND (${search}::text IS NULL OR name ILIKE ${search})
        AND (${options.categoryId ?? null}::int IS NULL OR category_id = ${options.categoryId ?? null})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) as count FROM products
      WHERE store_id = ${storeId}
        AND status = 'active'
        AND (${search}::text IS NULL OR name ILIKE ${search})
        AND (${options.categoryId ?? null}::int IS NULL OR category_id = ${options.categoryId ?? null})
    `

    return { products: result as unknown as Product[], total: Number(countResult[0]?.count || 0) }
  } catch (error) {
    console.error("Error listing products:", error)
    return { products: [], total: 0 }
  }
}

export async function listProductsByIds(storeId: number, ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return []
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM products WHERE store_id = ${storeId} AND status = 'active' AND id IN ${sql(ids)}
    `
    return result as unknown as Product[]
  } catch (error) {
    console.error("Error listing products by ids:", error)
    return []
  }
}

export async function getProductBySlug(storeId: number, slug: string): Promise<Product | null> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM products WHERE store_id = ${storeId} AND slug = ${slug} AND status = 'active'
    `
    return result.length > 0 ? (result[0] as unknown as Product) : null
  } catch (error) {
    console.error("Error fetching product by slug:", error)
    return null
  }
}

export async function listProductImages(productId: number): Promise<ProductImage[]> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM product_images WHERE product_id = ${productId} ORDER BY sort_order ASC`
    return result as unknown as ProductImage[]
  } catch (error) {
    console.error("Error fetching product images:", error)
    return []
  }
}

export async function listProductVariants(productId: number): Promise<ProductVariant[]> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM product_variants WHERE product_id = ${productId} ORDER BY id ASC`
    return result as unknown as ProductVariant[]
  } catch (error) {
    console.error("Error fetching product variants:", error)
    return []
  }
}

export async function listEnabledCheckoutFields(storeId: number): Promise<CheckoutFieldSetting[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT id, field_key, label, required FROM checkout_field_settings
      WHERE store_id = ${storeId} AND enabled = TRUE
      ORDER BY sort_order ASC
    `
    return result as unknown as CheckoutFieldSetting[]
  } catch (error) {
    console.error("Error fetching checkout fields:", error)
    return []
  }
}

export async function getProductPrimaryImage(productId: number): Promise<string | null> {
  const images = await listProductImages(productId)
  return images[0]?.url || null
}

export interface ExplorerPost {
  id: number
  store_id: number
  video_url: string
  thumbnail_url: string | null
  caption: string | null
  like_count: number
  comment_count: number
  share_count: number
  created_at: string
}

export async function listExplorerPosts(
  storeId: number,
  options: { cursor?: number; limit?: number } = {},
): Promise<{ posts: ExplorerPost[]; nextCursor: number | null }> {
  try {
    const sql = getSql()
    const limit = Math.min(20, options.limit || 5)

    const result = await sql`
      SELECT id, store_id, video_url, thumbnail_url, caption, like_count, comment_count, share_count, created_at
      FROM explorer_posts
      WHERE store_id = ${storeId}
        AND status = 'published'
        AND (${options.cursor ?? null}::int IS NULL OR id < ${options.cursor ?? null})
      ORDER BY id DESC
      LIMIT ${limit}
    `
    const posts = result as unknown as ExplorerPost[]
    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null
    return { posts, nextCursor }
  } catch (error) {
    console.error("Error listing explorer posts:", error)
    return { posts: [], nextCursor: null }
  }
}

export async function getExplorerPostStoreId(postId: number): Promise<number | null> {
  try {
    const sql = getSql()
    const result = await sql`SELECT store_id FROM explorer_posts WHERE id = ${postId} AND status = 'published'`
    return result.length > 0 ? Number(result[0].store_id) : null
  } catch (error) {
    console.error("Error fetching explorer post store id:", error)
    return null
  }
}

export interface StoreStory {
  id: number
  store_id: number
  title: string
  cover_image_url: string
  media_url: string
  media_type: "image" | "video"
  link_url: string | null
}

export async function listActiveStories(storeId: number): Promise<StoreStory[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT id, store_id, title, cover_image_url, media_url, media_type, link_url
      FROM store_stories
      WHERE store_id = ${storeId} AND is_active = true
      ORDER BY sort_order ASC, created_at ASC
    `
    return result as unknown as StoreStory[]
  } catch (error) {
    console.error("Error listing store stories:", error)
    return []
  }
}

export type ExplorerPinnedProduct = Product & { image_url: string | null }

export async function listExplorerPostProducts(postId: number): Promise<ExplorerPinnedProduct[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) as image_url
      FROM explorer_post_products epp
      JOIN products p ON epp.product_id = p.id
      WHERE epp.post_id = ${postId} AND p.status = 'active'
      ORDER BY epp.sort_order ASC
    `
    return result as unknown as ExplorerPinnedProduct[]
  } catch (error) {
    console.error("Error listing explorer post products:", error)
    return []
  }
}
