import { NextResponse, type NextRequest } from "next/server"
import { getCartSessionToken } from "@/lib/cart-session"
import { updateCartItemQuantity, removeCartItem, getCartItemSessionToken } from "@/lib/commerce-db"

export const dynamic = "force-dynamic"

async function assertOwnership(itemId: number): Promise<boolean> {
  const token = await getCartSessionToken()
  if (!token) return false
  const ownerToken = await getCartItemSessionToken(itemId)
  return ownerToken === token
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const itemId = Number(params.id)
  if (!(await assertOwnership(itemId))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  const body = await request.json()
  const quantity = Number(body.quantity)
  if (Number.isNaN(quantity)) {
    return NextResponse.json({ error: "تعداد نامعتبر است" }, { status: 400 })
  }

  await updateCartItemQuantity(itemId, quantity)
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const itemId = Number(params.id)
  if (!(await assertOwnership(itemId))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  await removeCartItem(itemId)
  return NextResponse.json({ success: true })
}
