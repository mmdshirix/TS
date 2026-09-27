import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { listExplorerPosts, listExplorerPostProducts } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
  }

  const cursorParam = request.nextUrl.searchParams.get("cursor")
  const cursor = cursorParam ? Number(cursorParam) : undefined

  const { posts, nextCursor } = await listExplorerPosts(store.id, { cursor })
  const postsWithProducts = await Promise.all(
    posts.map(async (post) => ({ ...post, products: await listExplorerPostProducts(post.id) })),
  )

  return NextResponse.json({ posts: postsWithProducts, nextCursor })
}
