import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreById } from "@/lib/store-db"
import { getExplorerPost, updateExplorerPost, deleteExplorerPost, listExplorerPostProductIds } from "@/lib/explorer-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function assertOwnership(userId: number, postId: number) {
  const post = await getExplorerPost(postId)
  if (!post) return null
  const store = await getStoreById(post.store_id)
  if (!store || store.user_id !== userId) return null
  return post
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await assertOwnership(user.id, Number(params.id))
    if (!post) {
      return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 })
    }

    const body = await request.json()
    const updated = await updateExplorerPost(post.id, {
      ...body,
      product_ids: Array.isArray(body.product_ids) ? body.product_ids.map(Number) : undefined,
    })

    return NextResponse.json({ post: updated, product_ids: await listExplorerPostProductIds(post.id) })
  } catch (error) {
    console.error("API Error updating explorer post:", error)
    return NextResponse.json({ error: "Failed to update explorer post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await assertOwnership(user.id, Number(params.id))
    if (!post) {
      return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 })
    }

    await deleteExplorerPost(post.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error deleting explorer post:", error)
    return NextResponse.json({ error: "Failed to delete explorer post" }, { status: 500 })
  }
}
