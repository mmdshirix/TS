import { getSql } from "@/lib/db"

export interface ExplorerPost {
  id: number
  store_id: number
  video_url: string
  thumbnail_url: string | null
  caption: string | null
  status: "draft" | "published"
  like_count: number
  comment_count: number
  share_count: number
  created_at: string
  updated_at: string
}

export interface ExplorerPostProduct {
  id: number
  post_id: number
  product_id: number
  sort_order: number
}

export async function listExplorerPostsByStore(storeId: number): Promise<ExplorerPost[]> {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM explorer_posts WHERE store_id = ${storeId} ORDER BY created_at DESC
  `
  return result as unknown as ExplorerPost[]
}

export async function getExplorerPost(id: number): Promise<ExplorerPost | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM explorer_posts WHERE id = ${id}`
  return result.length > 0 ? (result[0] as unknown as ExplorerPost) : null
}

export async function createExplorerPost(data: {
  store_id: number
  video_url: string
  thumbnail_url?: string | null
  caption?: string | null
  status?: "draft" | "published"
  product_ids?: number[]
}): Promise<ExplorerPost> {
  const sql = getSql()
  if (!data.video_url || data.video_url.trim() === "") {
    throw new Error("لینک ویدیو الزامی است")
  }

  const result = await sql`
    INSERT INTO explorer_posts (store_id, video_url, thumbnail_url, caption, status)
    VALUES (${data.store_id}, ${data.video_url.trim()}, ${data.thumbnail_url || null}, ${data.caption || null}, ${data.status || "published"})
    RETURNING *
  `
  const post = result[0] as unknown as ExplorerPost
  if (data.product_ids?.length) {
    await setExplorerPostProducts(post.id, data.product_ids)
  }
  return post
}

export async function updateExplorerPost(
  id: number,
  updates: Partial<Pick<ExplorerPost, "video_url" | "thumbnail_url" | "caption" | "status">> & {
    product_ids?: number[]
  },
): Promise<ExplorerPost | null> {
  const sql = getSql()
  const current = await getExplorerPost(id)
  if (!current) return null

  const result = await sql`
    UPDATE explorer_posts SET
      video_url = ${updates.video_url ?? current.video_url},
      thumbnail_url = ${updates.thumbnail_url !== undefined ? updates.thumbnail_url : current.thumbnail_url},
      caption = ${updates.caption !== undefined ? updates.caption : current.caption},
      status = ${updates.status ?? current.status},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  if (updates.product_ids) {
    await setExplorerPostProducts(id, updates.product_ids)
  }
  return result.length > 0 ? (result[0] as unknown as ExplorerPost) : null
}

export async function deleteExplorerPost(id: number): Promise<boolean> {
  const sql = getSql()
  await sql`DELETE FROM explorer_posts WHERE id = ${id}`
  return true
}

export async function setExplorerPostProducts(postId: number, productIds: number[]): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM explorer_post_products WHERE post_id = ${postId}`
  for (let i = 0; i < productIds.length; i++) {
    await sql`
      INSERT INTO explorer_post_products (post_id, product_id, sort_order)
      VALUES (${postId}, ${productIds[i]}, ${i})
      ON CONFLICT (post_id, product_id) DO NOTHING
    `
  }
}

export async function listExplorerPostProductIds(postId: number): Promise<number[]> {
  const sql = getSql()
  const result = await sql`
    SELECT product_id FROM explorer_post_products WHERE post_id = ${postId} ORDER BY sort_order ASC
  `
  return result.map((row: any) => row.product_id)
}
