import { getSql } from "@/lib/db"

// Write layer for explorer likes/comments/shares. Like lib/commerce-db.ts, this app
// owns these tables operationally even though explorer_posts itself is managed from
// platform-talksell.ir's dashboard.

export interface ExplorerComment {
  id: number
  post_id: number
  author_name: string | null
  content: string
  created_at: string
}

export async function hasLikedPost(postId: number, sessionToken: string): Promise<boolean> {
  const sql = getSql()
  const result = await sql`
    SELECT id FROM explorer_post_likes WHERE post_id = ${postId} AND session_token = ${sessionToken}
  `
  return result.length > 0
}

export async function toggleLike(postId: number, sessionToken: string): Promise<{ liked: boolean; likeCount: number }> {
  const sql = getSql()
  const already = await hasLikedPost(postId, sessionToken)

  if (already) {
    await sql`DELETE FROM explorer_post_likes WHERE post_id = ${postId} AND session_token = ${sessionToken}`
    const result = await sql`
      UPDATE explorer_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = ${postId} RETURNING like_count
    `
    return { liked: false, likeCount: Number(result[0]?.like_count ?? 0) }
  }

  await sql`
    INSERT INTO explorer_post_likes (post_id, session_token) VALUES (${postId}, ${sessionToken})
    ON CONFLICT (post_id, session_token) DO NOTHING
  `
  const result = await sql`
    UPDATE explorer_posts SET like_count = like_count + 1 WHERE id = ${postId} RETURNING like_count
  `
  return { liked: true, likeCount: Number(result[0]?.like_count ?? 0) }
}

export async function incrementShareCount(postId: number): Promise<number> {
  const sql = getSql()
  const result = await sql`
    UPDATE explorer_posts SET share_count = share_count + 1 WHERE id = ${postId} RETURNING share_count
  `
  return Number(result[0]?.share_count ?? 0)
}

export async function listComments(postId: number): Promise<ExplorerComment[]> {
  const sql = getSql()
  const result = await sql`
    SELECT * FROM explorer_post_comments WHERE post_id = ${postId} ORDER BY created_at DESC LIMIT 50
  `
  return result as unknown as ExplorerComment[]
}

export async function addComment(postId: number, authorName: string | null, content: string): Promise<ExplorerComment> {
  const sql = getSql()
  const result = await sql`
    INSERT INTO explorer_post_comments (post_id, author_name, content)
    VALUES (${postId}, ${authorName}, ${content})
    RETURNING *
  `
  await sql`UPDATE explorer_posts SET comment_count = comment_count + 1 WHERE id = ${postId}`
  return result[0] as unknown as ExplorerComment
}
