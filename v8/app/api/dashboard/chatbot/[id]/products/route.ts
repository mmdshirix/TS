import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getChatbotById, syncChatbotProducts, getChatbotProducts } from "@/lib/db"
import { checkProductLimit } from "@/lib/plan-limits"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const { id } = await params
    const chatbotId = Number(id)
    const { products } = await request.json()

    // Verify ownership
    const chatbot = await getChatbotById(chatbotId)
    if (!chatbot || chatbot.user_id !== user.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const currentProducts = await getChatbotProducts(chatbotId)
    const newProductsCount = products.filter((p: any) => !p.id).length

    if (newProductsCount > 0) {
      const limitCheck = await checkProductLimit(user.id)
      if (!limitCheck.allowed) {
        return NextResponse.json({ error: limitCheck.message }, { status: 403 })
      }

      // Check if adding new products would exceed limit
      if (limitCheck.max && (limitCheck.current || 0) + newProductsCount > limitCheck.max) {
        return NextResponse.json(
          {
            error: `شما فقط می‌توانید ${limitCheck.max - (limitCheck.current || 0)} محصول دیگر اضافه کنید.`,
          },
          { status: 403 },
        )
      }
    }

    await syncChatbotProducts(chatbotId, products)
    const updatedProducts = await getChatbotProducts(chatbotId)

    return NextResponse.json({ products: updatedProducts })
  } catch (error) {
    console.error("Error updating products:", error)
    return NextResponse.json({ error: "خطا در به‌روزرسانی محصولات" }, { status: 500 })
  }
}
