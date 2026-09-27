import { NextResponse } from "next/server"
import { syncChatbotProducts, type ChatbotProduct } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const chatbotId = Number.parseInt(params.id, 10)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
  }

  try {
    const products = (await request.json()) as Partial<ChatbotProduct>[]
    console.log(`[API PUT /products] Received request for chatbot ${chatbotId} with ${products.length} products.`)

    if (!Array.isArray(products)) {
      console.error("[API PUT /products] Invalid data format: not an array.")
      return NextResponse.json({ error: "داده‌های ارسالی باید یک آرایه از محصولات باشد" }, { status: 400 })
    }

    const updatedProducts = await syncChatbotProducts(chatbotId, products)
    console.log(`[API PUT /products] Successfully synced ${updatedProducts.length} products for chatbot ${chatbotId}.`)
    return NextResponse.json(updatedProducts)
  } catch (error) {
    console.error(`[API PUT /products] Error syncing products for chatbot ${chatbotId}:`, error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "خطای داخلی سرور در ذخیره محصولات", details: errorMessage }, { status: 500 })
  }
}
