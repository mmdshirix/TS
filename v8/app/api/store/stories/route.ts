import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { listStoriesByStore, createStory } from "@/lib/stories-db"

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
      return NextResponse.json({ stories: [] })
    }

    const stories = await listStoriesByStore(store.id)
    return NextResponse.json({ stories })
  } catch (error) {
    console.error("API Error fetching stories:", error)
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
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
    if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
      return NextResponse.json({ error: "عنوان استوری الزامی است" }, { status: 400 })
    }
    if (!body.cover_image_url) {
      return NextResponse.json({ error: "تصویر کاور الزامی است" }, { status: 400 })
    }
    if (!body.media_url) {
      return NextResponse.json({ error: "محتوای استوری (عکس یا ویدیو) الزامی است" }, { status: 400 })
    }

    const story = await createStory({
      store_id: store.id,
      title: body.title,
      cover_image_url: body.cover_image_url,
      media_url: body.media_url,
      media_type: body.media_type === "video" ? "video" : "image",
      link_url: body.link_url || null,
    })

    return NextResponse.json({ story }, { status: 201 })
  } catch (error) {
    console.error("API Error creating story:", error)
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 })
  }
}
