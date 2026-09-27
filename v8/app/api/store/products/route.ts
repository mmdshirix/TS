import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId, createProduct, listProductsByStore, addProductImage } from "@/lib/store-db"
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
    if (!store) {
      return NextResponse.json({ products: [] })
    }

    const products = await listProductsByStore(store.id)
    return NextResponse.json({ products })
  } catch (error) {
    console.error("API Error fetching store products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
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

    const limit = await checkUserLimit(user.id, "store_products")
    if (!limit.allowed) {
      return NextResponse.json({ error: limit.message || "به حداکثر تعداد محصولات مجاز رسیده‌اید" }, { status: 403 })
    }

    const body = await request.json()
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json({ error: "نام محصول الزامی است" }, { status: 400 })
    }
    if (body.price === undefined || Number.isNaN(Number(body.price))) {
      return NextResponse.json({ error: "قیمت محصول الزامی است" }, { status: 400 })
    }

    const product = await createProduct({
      store_id: store.id,
      category_id: body.category_id || null,
      name: body.name,
      type: body.type,
      price: Number(body.price),
      compare_at_price: body.compare_at_price ? Number(body.compare_at_price) : null,
      description: body.description,
      sku: body.sku,
      inventory_count: body.inventory_count !== undefined ? Number(body.inventory_count) : null,
      digital_download_url: body.digital_download_url,
      video_url: body.video_url,
      status: body.status,
    })

    if (Array.isArray(body.image_urls)) {
      for (let i = 0; i < body.image_urls.length; i++) {
        if (body.image_urls[i]) {
          await addProductImage(product.id, body.image_urls[i], i)
        }
      }
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("API Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product", details: String(error) }, { status: 500 })
  }
}
