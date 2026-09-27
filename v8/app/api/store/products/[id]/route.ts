import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import {
  getProduct,
  getStoreById,
  updateProduct,
  deleteProduct,
  listProductImages,
  addProductImage,
  listProductVariants,
} from "@/lib/store-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function assertOwnership(userId: number, productId: number) {
  const product = await getProduct(productId)
  if (!product) return { product: null, store: null }
  const store = await getStoreById(product.store_id)
  if (!store || store.user_id !== userId) return { product: null, store: null }
  return { product, store }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { product } = await assertOwnership(user.id, Number(params.id))
    if (!product) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 })
    }

    const [images, variants] = await Promise.all([listProductImages(product.id), listProductVariants(product.id)])

    return NextResponse.json({ product, images, variants })
  } catch (error) {
    console.error("API Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { product } = await assertOwnership(user.id, Number(params.id))
    if (!product) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 })
    }

    const body = await request.json()
    const updated = await updateProduct(product.id, body)

    if (Array.isArray(body.image_urls)) {
      for (let i = 0; i < body.image_urls.length; i++) {
        if (body.image_urls[i]) {
          await addProductImage(product.id, body.image_urls[i], i)
        }
      }
    }

    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error("API Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { product } = await assertOwnership(user.id, Number(params.id))
    if (!product) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 })
    }

    await deleteProduct(product.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
