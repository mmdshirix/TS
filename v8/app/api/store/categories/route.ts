import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId, createCategory, updateCategory, listCategoriesByStore, deleteCategory } from "@/lib/store-db"

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
      return NextResponse.json({ categories: [] })
    }

    const categories = await listCategoriesByStore(store.id)
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("API Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
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
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json({ error: "نام دسته‌بندی الزامی است" }, { status: 400 })
    }

    const category = await createCategory({
      store_id: store.id,
      name: body.name,
      parent_id: body.parent_id || null,
      image_url: body.image_url || null,
    })
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("API Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const id = Number(body.id)
    if (!id) {
      return NextResponse.json({ error: "شناسه دسته‌بندی الزامی است" }, { status: 400 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "فروشگاهی یافت نشد" }, { status: 404 })
    }

    const categories = await listCategoriesByStore(store.id)
    if (!categories.some((c) => c.id === id)) {
      return NextResponse.json({ error: "دسته‌بندی یافت نشد" }, { status: 404 })
    }

    const category = await updateCategory(id, {
      name: body.name,
      parent_id: body.parent_id !== undefined ? body.parent_id : undefined,
      image_url: body.image_url !== undefined ? body.image_url : undefined,
    })
    return NextResponse.json({ category })
  } catch (error) {
    console.error("API Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = Number(searchParams.get("id"))
    if (!id) {
      return NextResponse.json({ error: "شناسه دسته‌بندی الزامی است" }, { status: 400 })
    }

    const store = await getStoreByUserId(user.id)
    if (!store) {
      return NextResponse.json({ error: "فروشگاهی یافت نشد" }, { status: 404 })
    }

    const categories = await listCategoriesByStore(store.id)
    if (!categories.some((c) => c.id === id)) {
      return NextResponse.json({ error: "دسته‌بندی یافت نشد" }, { status: 404 })
    }

    await deleteCategory(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
