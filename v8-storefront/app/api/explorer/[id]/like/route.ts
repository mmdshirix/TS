import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getExplorerPostStoreId } from "@/lib/db"
import { ensureCartSessionToken } from "@/lib/cart-session"
import { toggleLike } from "@/lib/explorer-interactions"

export const dynamic = "force-dynamic"

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

  const token = await ensureCartSessionToken()
  const result = await toggleLike(postId, token)
  return NextResponse.json(result)
}
