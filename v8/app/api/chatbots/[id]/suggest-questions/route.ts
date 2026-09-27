import { type NextRequest, NextResponse } from "next/server"
import { getChatbotFAQs, getChatbotProducts } from "@/lib/db"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    const { conversationHistory } = await req.json()

    console.log("[v0] Suggest questions for chatbot:", chatbotId)

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        suggestions: [
          { question: "محصولات پرفروش کدامند؟", emoji: "🔥" },
          { question: "قیمت‌ها چطور است؟", emoji: "💰" },
        ],
      })
    }

    const [faqs, products] = await Promise.all([
      getChatbotFAQs(chatbotId).catch(() => []),
      getChatbotProducts(chatbotId).catch(() => []),
    ])

    const faqList = faqs
      .slice(0, 5)
      .map((f) => f.question)
      .join("\n- ")
    const productList = products
      .slice(0, 5)
      .map((p) => p.name)
      .join("، ")

    const prompt = `بر اساس این مکالمه، دقیقاً 2 سوال کوتاه و جذاب پیشنهاد بده که کاربر ممکن است بپرسد:

مکالمه:
${conversationHistory}

${faqList ? `سوالات رایج: ${faqList}` : ""}
${productList ? `محصولات: ${productList}` : ""}

قوانین:
1. فقط 2 سوال
2. هر سوال حداکثر 6 کلمه
3. سوالات باید مرتبط با مکالمه باشند
4. از ایموجی مناسب استفاده کن

فقط JSON برگردان:
[{"question": "سوال؟", "emoji": "🤔"}, {"question": "سوال؟", "emoji": "💡"}]`

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      console.error("[v0] DeepSeek error:", response.status)
      return NextResponse.json({
        suggestions: [
          { question: "بیشتر توضیح می‌دهید؟", emoji: "🤔" },
          { question: "قیمت چقدر است؟", emoji: "💰" },
        ],
      })
    }

    const data = await response.json()
    const resultText = data.choices?.[0]?.message?.content || ""

    console.log("[v0] AI suggestions response:", resultText)

    let suggestions = []
    try {
      const jsonMatch = resultText.match(/\[.*\]/s)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error("[v0] Parse error:", error)
    }

    if (!suggestions || suggestions.length < 2) {
      suggestions = [
        { question: "بیشتر توضیح می‌دهید؟", emoji: "🤔" },
        { question: "محصولات دیگر چیست؟", emoji: "🛍️" },
      ]
    }

    console.log("[v0] Returning suggestions:", suggestions.length)
    return NextResponse.json({ suggestions: suggestions.slice(0, 2) })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({
      suggestions: [
        { question: "سوالی دارید؟", emoji: "❓" },
        { question: "کمک بیشتری لازم است؟", emoji: "💬" },
      ],
    })
  }
}
