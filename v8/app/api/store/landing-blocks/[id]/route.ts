import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId, getLandingBlockById, updateLandingBlock, deleteLandingBlock } from "@/lib/store-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function assertOwnership(userId: number, blockId: number) {
  const store = await getStoreByUserId(userId)
  if (!store) return null
  const block = await getLandingBlockById(blockId)
  return block && block.store_id === store.id ? store : null
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blockId = Number(params.id)
    const store = await assertOwnership(user.id, blockId)
    if (!store) {
      return NextResponse.json({ error: "بلاک یافت نشد" }, { status: 404 })
    }

    const body = await request.json()
    const updated = await updateLandingBlock(blockId, {
      enabled: body.enabled,
      config: body.config,
      position: body.position,
    })

    return NextResponse.json({ block: updated })
  } catch (error) {
    console.error("API Error updating landing block:", error)
    return NextResponse.json({ error: "Failed to update landing block" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blockId = Number(params.id)
    const store = await assertOwnership(user.id, blockId)
    if (!store) {
      return NextResponse.json({ error: "بلاک یافت نشد" }, { status: 404 })
    }

    await deleteLandingBlock(blockId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error deleting landing block:", error)
    return NextResponse.json({ error: "Failed to delete landing block" }, { status: 500 })
  }
}
