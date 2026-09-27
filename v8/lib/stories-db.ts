import { getSql } from "@/lib/db"

export interface StoreStory {
  id: number
  store_id: number
  title: string
  cover_image_url: string
  media_url: string
  media_type: "image" | "video"
  link_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function listStoriesByStore(storeId: number): Promise<StoreStory[]> {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM store_stories WHERE store_id = ${storeId} ORDER BY sort_order ASC, created_at ASC
  `
  return result as unknown as StoreStory[]
}

export async function getStoryById(id: number): Promise<StoreStory | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM store_stories WHERE id = ${id}`
  return result.length > 0 ? (result[0] as unknown as StoreStory) : null
}

export async function createStory(data: {
  store_id: number
  title: string
  cover_image_url: string
  media_url: string
  media_type: "image" | "video"
  link_url?: string | null
}): Promise<StoreStory> {
  const sql = getSql()
  const existing = await sql`
    SELECT COALESCE(MAX(sort_order), -1) as max_order FROM store_stories WHERE store_id = ${data.store_id}
  `
  const nextOrder = Number(existing[0]?.max_order ?? -1) + 1

  const result = await sql`
    INSERT INTO store_stories (store_id, title, cover_image_url, media_url, media_type, link_url, sort_order)
    VALUES (${data.store_id}, ${data.title}, ${data.cover_image_url}, ${data.media_url}, ${data.media_type}, ${data.link_url ?? null}, ${nextOrder})
    RETURNING *
  `
  return result[0] as unknown as StoreStory
}

export async function updateStory(
  id: number,
  updates: Partial<Pick<StoreStory, "title" | "cover_image_url" | "media_url" | "media_type" | "link_url" | "is_active" | "sort_order">>,
): Promise<StoreStory | null> {
  const sql = getSql()
  const current = await getStoryById(id)
  if (!current) return null

  const result = await sql`
    UPDATE store_stories SET
      title = ${updates.title ?? current.title},
      cover_image_url = ${updates.cover_image_url ?? current.cover_image_url},
      media_url = ${updates.media_url ?? current.media_url},
      media_type = ${updates.media_type ?? current.media_type},
      link_url = ${updates.link_url !== undefined ? updates.link_url : current.link_url},
      is_active = ${updates.is_active ?? current.is_active},
      sort_order = ${updates.sort_order ?? current.sort_order},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] as unknown as StoreStory
}

export async function deleteStory(id: number): Promise<boolean> {
  const sql = getSql()
  await sql`DELETE FROM store_stories WHERE id = ${id}`
  return true
}
