import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { getStoryById, updateStory, deleteStory } from "@/lib/stories-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function assertOwnership(userId: number, storyId: number) {
  const store = await getStoreByUserId(userId)
  if (!store) return null
  const story = await getStoryById(storyId)
  return story && story.store_id === store.id ? store : null
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const storyId = Number(params.id)
    const store = await assertOwnership(user.id, storyId)
    if (!store) {
      return NextResponse.json({ error: "استوری یافت نشد" }, { status: 404 })
    }

    const body = await request.json()
    const updated = await updateStory(storyId, {
      title: body.title,
      cover_image_url: body.cover_image_url,
      media_url: body.media_url,
      media_type: body.media_type,
      link_url: body.link_url,
      is_active: body.is_active,
      sort_order: body.sort_order,
    })

    return NextResponse.json({ story: updated })
  } catch (error) {
    console.error("API Error updating story:", error)
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const storyId = Number(params.id)
    const store = await assertOwnership(user.id, storyId)
    if (!store) {
      return NextResponse.json({ error: "استوری یافت نشد" }, { status: 404 })
    }

    await deleteStory(storyId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error deleting story:", error)
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
  }
}
