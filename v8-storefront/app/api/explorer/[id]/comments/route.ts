import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getExplorerPostStoreId } from "@/lib/db"
import { listComments, addComment } from "@/lib/explorer-interactions"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const store = await getStoreFromRequest(request)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
  }

  const postId = Number(params.id)
  const postStoreId = await getExplorerPostStoreId(postId)
  if (postStoreId !== store.id) {
    return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 })
  }

  const comments = await listComments(postId)
  return NextResponse.json({ comments })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const store = await getStoreFromRequest(request)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
  }

  const postId = Number(params.id)
  const postStoreId = await getExplorerPostStoreId(postId)
  if (postStoreId !== store.id) {
    return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 })
  }

  const body = await request.json()
  const content = typeof body.content === "string" ? body.content.trim() : ""
  if (!content) {
    return NextResponse.json({ error: "متن نظر الزامی است" }, { status: 400 })
  }
  const authorName = typeof body.author_name === "string" && body.author_name.trim() ? body.author_name.trim() : null

  const comment = await addComment(postId, authorName, content.slice(0, 1000))
  return NextResponse.json({ comment }, { status: 201 })
}
