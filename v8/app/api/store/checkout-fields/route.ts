import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId, listCheckoutFields, updateCheckoutField } from "@/lib/store-db"

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
      return NextResponse.json({ fields: [] })
    }

    const fields = await listCheckoutFields(store.id)
    return NextResponse.json({ fields })
  } catch (error) {
    console.error("API Error fetching checkout fields:", error)
    return NextResponse.json({ error: "Failed to fetch checkout fields" }, { status: 500 })
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
    if (!body.id) {
      return NextResponse.json({ error: "شناسه فیلد الزامی است" }, { status: 400 })
    }

    const fields = await listCheckoutFields(store.id)
    if (!fields.some((f) => f.id === body.id)) {
      return NextResponse.json({ error: "فیلد یافت نشد" }, { status: 404 })
    }

    const updated = await updateCheckoutField(body.id, {
      label: body.label,
      required: body.required,
      enabled: body.enabled,
      sort_order: body.sort_order,
    })

    return NextResponse.json({ field: updated })
  } catch (error) {
    console.error("API Error updating checkout field:", error)
    return NextResponse.json({ error: "Failed to update checkout field" }, { status: 500 })
  }
}
