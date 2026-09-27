import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import {
  getStoreByUserId,
  listLandingBlocks,
  createLandingBlock,
  LANDING_BLOCK_TYPES as VALID_TYPES,
} from "@/lib/store-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ blocks: [] })
    }

    const page = new URL(request.url).searchParams.get("page") || "home"
    const blocks = await listLandingBlocks(store.id, page)
    return NextResponse.json({ blocks })
  } catch (error) {
    console.error("API Error fetching landing blocks:", error)
    return NextResponse.json({ error: "Failed to fetch landing blocks" }, { status: 500 })
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
    if (!body.type || !VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "نوع بلاک نامعتبر است" }, { status: 400 })
    }

    const block = await createLandingBlock({
      store_id: store.id,
      type: body.type,
      page: body.page || "home",
      config: body.config || {},
    })
    return NextResponse.json({ block }, { status: 201 })
  } catch (error) {
    console.error("API Error creating landing block:", error)
    return NextResponse.json({ error: "Failed to create landing block" }, { status: 500 })
  }
}
