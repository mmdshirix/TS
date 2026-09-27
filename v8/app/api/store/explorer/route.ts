import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { createExplorerPost, listExplorerPostsByStore, listExplorerPostProductIds } from "@/lib/explorer-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ posts: [] })
    }

    const posts = await listExplorerPostsByStore(store.id)
    const postsWithProducts = await Promise.all(
      posts.map(async (post) => ({ ...post, product_ids: await listExplorerPostProductIds(post.id) })),
    )
    return NextResponse.json({ posts: postsWithProducts })
  } catch (error) {
    console.error("API Error fetching explorer posts:", error)
    return NextResponse.json({ error: "Failed to fetch explorer posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "ابتدا باید فروشگاه بسازید" }, { status: 400 })
    }

    const body = await request.json()
    if (!body.video_url || typeof body.video_url !== "string" || body.video_url.trim() === "") {
      return NextResponse.json({ error: "لینک ویدیو الزامی است" }, { status: 400 })
    }

    const post = await createExplorerPost({
      store_id: store.id,
      video_url: body.video_url,
      thumbnail_url: body.thumbnail_url,
      caption: body.caption,
      status: body.status,
      product_ids: Array.isArray(body.product_ids) ? body.product_ids.map(Number) : [],
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("API Error creating explorer post:", error)
    return NextResponse.json({ error: "Failed to create explorer post", details: String(error) }, { status: 500 })
  }
}
