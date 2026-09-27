import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createStore, getStoreByUserId, updateStore } from "@/lib/store-db"
import { checkUserLimit } from "@/lib/subscription-system"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    return NextResponse.json({ store })
  } catch (error) {
    console.error("API Error fetching store:", error)
    return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await getStoreByUserId(user.id)
    if (existing) {
      return NextResponse.json({ error: "شما در حال حاضر یک فروشگاه دارید" }, { status: 400 })
    }

    const limit = await checkUserLimit(user.id, "stores")
    if (!limit.allowed) {
      return NextResponse.json({ error: limit.message || "به حداکثر تعداد فروشگاه مجاز رسیده‌اید" }, { status: 403 })
    }

    const body = await request.json()
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json({ error: "نام فروشگاه الزامی است" }, { status: 400 })
    }

    const store = await createStore({
      user_id: user.id,
      name: body.name,
      description: body.description,
      category: body.category,
      chatbot_id: body.chatbot_id || null,
    })

    return NextResponse.json({ store }, { status: 201 })
  } catch (error) {
    console.error("API Error creating store:", error)
    return NextResponse.json({ error: "Failed to create store", details: String(error) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "فروشگاهی یافت نشد" }, { status: 404 })
    }

    const body = await request.json()
    const updated = await updateStore(store.id, body)

    return NextResponse.json({ store: updated })
  } catch (error) {
    console.error("API Error updating store:", error)
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 })
  }
}
