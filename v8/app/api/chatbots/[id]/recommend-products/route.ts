import { type NextRequest, NextResponse } from "next/server"
import { getChatbotProducts } from "@/lib/db"

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    const { conversationContext, userMessage } = await req.json()

    console.log("[v0] Product recommendation for chatbot:", chatbotId)

    const products = await getChatbotProducts(chatbotId)

    if (!products || products.length === 0) {
      console.log("[v0] No products found")
      return NextResponse.json({ recommendations: [] })
    }

    console.log("[v0] Found", products.length, "products")

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      const shuffled = [...products].sort(() => 0.5 - Math.random())
      return NextResponse.json({ recommendations: shuffled.slice(0, 2) })
    }

    const productsInfo = products.map((p) => `ID:${p.id} - ${p.name}`).join("\n")

    const prompt = `بر اساس این مکالمه، کدام محصولات را پیشنهاد می‌دهید؟

مکالمه: ${conversationContext}
آخرین پیام: ${userMessage}

محصولات:
${productsInfo}

فقط آرایه ID محصولات مرتبط را برگردانید (حداکثر 2 محصول):
[123, 456]`

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      console.error("[v0] DeepSeek error:", response.status)
      const shuffled = [...products].sort(() => 0.5 - Math.random())
      return NextResponse.json({ recommendations: shuffled.slice(0, 2) })
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || "[]"

    console.log("[v0] AI response:", aiResponse)

    let recommendedIds: number[] = []
    try {
      const match = aiResponse.match(/\[[\d,\s]+\]/)
      if (match) {
        recommendedIds = JSON.parse(match[0])
      }
    } catch (error) {
      console.error("[v0] Parse error:", error)
    }

    console.log("[v0] Recommended IDs:", recommendedIds)

    let recommendations = products.filter((p) => recommendedIds.includes(p.id)).slice(0, 2)

    if (recommendations.length === 0 && products.length > 0) {
      const shuffled = [...products].sort(() => 0.5 - Math.random())
      recommendations = shuffled.slice(0, 2)
      console.log("[v0] Using random products as fallback")
    }

    console.log("[v0] Returning", recommendations.length, "recommendations")
    return NextResponse.json({ recommendations })
  } catch (error: any) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ recommendations: [] })
  }
}
