import type { NextRequest } from "next/server"
import { getChatbotById, getChatbotFAQs, getChatbotProducts, getChatbotKnowledgeBase, saveMessage } from "@/lib/db"
import { streamChatCompletion, getToneInstructions, AIUnavailableError, type AIMessage } from "@/lib/ai"
import {
  getUserSubscriptionStatus,
  incrementTokenUsage,
  incrementSalesAdvisorUsage,
  estimateTokens,
  checkUserLimit,
} from "@/lib/subscription-system"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, chatbotId, pinnedProductId } = body
    const chatbotIdNum = Number(chatbotId)

    if (!chatbotId || isNaN(chatbotIdNum) || chatbotIdNum <= 0) {
      return Response.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "پیام‌ها نامعتبر هستند" }, { status: 400 })
    }

    const [chatbot, faqs, products, knowledgeBase] = await Promise.all([
      getChatbotById(chatbotIdNum).catch(() => null),
      getChatbotFAQs(chatbotIdNum).catch(() => []),
      getChatbotProducts(chatbotIdNum).catch(() => []),
      getChatbotKnowledgeBase(chatbotIdNum).catch(() => []),
    ])

    if (!chatbot) {
      return Response.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    if (chatbot.user_id) {
      const subscriptionStatus = await getUserSubscriptionStatus(chatbot.user_id)

      if (subscriptionStatus?.shouldFreeze) {
        return Response.json(
          {
            error:
              subscriptionStatus.freezeReason || "اشتراک شما محدود شده است. برای ادامه استفاده، پلن خود را ارتقا دهید.",
            upgradeUrl: "https://talksell.ir/تعرفه-ها/",
          },
          { status: 403 },
        )
      }

      const tokenCheck = await checkUserLimit(chatbot.user_id, "ai_tokens")
      if (!tokenCheck.allowed) {
        return Response.json(
          {
            error: tokenCheck.message || "توکن‌های شما تمام شده است.",
            upgradeUrl: "https://talksell.ir/تعرفه-ها/",
          },
          { status: 403 },
        )
      }
    }

    console.log(
      "[Chat] Chatbot:",
      chatbot.name,
      "KB:",
      knowledgeBase.length,
      "FAQs:",
      faqs.length,
      "Products:",
      products.length,
      "Pinned:",
      pinnedProductId || "none",
      "Tone:",
      chatbot.response_tone || "friendly",
    )

    const responseTone = chatbot.response_tone || "friendly"
    const toneInstructions = getToneInstructions(responseTone)

    let systemPrompt = ""
    let isPinnedProductMode = false

    if (pinnedProductId) {
      const pinnedProduct = products.find((p) => p.id === Number(pinnedProductId))

      if (pinnedProduct) {
        isPinnedProductMode = true
        const price = pinnedProduct.price
          ? new Intl.NumberFormat("fa-IR").format(Number(pinnedProduct.price)) + " تومان"
          : "تماس بگیرید"

        systemPrompt = `شما یک مشاور تخصصی و خبره در زمینه "${pinnedProduct.name}" هستید که برای "${chatbot.name}" کار می‌کنید.

🎯 وضعیت فعلی: حالت مشاوره تخصصی محصول
📦 محصول در حال بررسی: ${pinnedProduct.name}

🎯 وظیفه شما:
- شما فقط و فقط درباره محصول "${pinnedProduct.name}" صحبت می‌کنید
- هیچ محصول دیگری را معرفی یا پیشنهاد نکنید
- تمام تمرکز شما روی مزایا، ویژگی‌ها، کاربردها و جزئیات "${pinnedProduct.name}" است
- به عنوان یک کارشناس حرفه‌ای، تمام جوانب این محصول را توضیح دهید

📦 اطلاعات کامل محصول:
🏷️ نام: ${pinnedProduct.name}
💰 قیمت: ${price}
📝 توضیحات: ${pinnedProduct.description || "این محصول یکی از بهترین‌های بازار است"}
${pinnedProduct.product_url ? `🔗 لینک محصول: ${pinnedProduct.product_url}` : ""}

${toneInstructions}

🎓 دانش تخصصی شما:
${pinnedProduct.description || "این یک محصول عالی با کیفیت بالاست"}

📋 نکات مهم:
- اگر سوالی درباره محصولات دیگر پرسیده شد، به آرامی کاربر را به "${pinnedProduct.name}" هدایت کنید
- اگر اطلاعات دقیق ندارید، از عبارات کلی اما مثبت استفاده کنید
- همیشه مشتری را به خرید یا تماس برای اطلاعات بیشتر تشویق کنید

💬 در پایان هر پاسخ، کاربر را به خرید یا پرسیدن سوالات بیشتر درباره "${pinnedProduct.name}" دعوت کنید.`
      }
    }

    if (!isPinnedProductMode) {
      systemPrompt = `شما یک دستیار هوشمند، صمیمی و بسیار حرفه‌ای برای "${chatbot.name}" هستید.

${toneInstructions}

📋 نکات مهم:
- فقط بر اساس اطلاعات موجود در پایگاه دانش پاسخ دهید
- اگر اطلاعات دقیق ندارید، صادقانه بگویید و پیشنهاد تماس با پشتیبانی بدهید
- محصولات مرتبط را با جزئیات کامل معرفی کنید

`

      if (knowledgeBase.length > 0) {
        systemPrompt += `📖 پایگاه دانش:\n`
        knowledgeBase.forEach((entry) => {
          systemPrompt += `\n🔹 ${entry.title || "موضوع"}:\n${entry.content}\n`
        })
        systemPrompt += `\n`
      }

      if (faqs.length > 0) {
        systemPrompt += `❓ سوالات متداول:\n`
        faqs.forEach((faq) => {
          systemPrompt += `\nپرسش: ${faq.question}\nپاسخ: ${faq.answer}\n`
        })
        systemPrompt += `\n`
      }

      if (products.length > 0) {
        systemPrompt += `🛍️ محصولات و خدمات:\n`
        products.forEach((p) => {
          const price = p.price ? new Intl.NumberFormat("fa-IR").format(Number(p.price)) + " تومان" : "تماس بگیرید"
          systemPrompt += `\n🏷️ نام: ${p.name}\n📝 توضیحات: ${p.description || "بدون توضیحات"}\n💰 قیمت: ${price}\n`
        })
      }

      systemPrompt += `\n💬 یادآوری: در پایان هر پاسخ، حتماً یک جمله دعوت‌کننده برای ادامه گفتگو اضافه کنید.`
    }

    const formattedMessages = messages.slice(-10).map((m: any) => ({
      role: m.role,
      content: String(m.content || ""),
    }))

    const userLastMessage = messages[messages.length - 1]?.content || ""

    const inputTokens = estimateTokens(systemPrompt + formattedMessages.map((m) => m.content).join(" "))

    // Provider preference: chatbot-specific override > global (super-admin) default > env.
    // Per-chatbot API keys are honoured when they match the resolved provider.
    const preferredProvider = chatbot.ai_provider === "deepseek" || chatbot.ai_provider === "arvan" ? chatbot.ai_provider : null
    const keyOverride =
      preferredProvider === "arvan" ? chatbot.arvan_api_key : preferredProvider === "deepseek" ? chatbot.deepseek_api_key : null

    let ai
    try {
      ai = await streamChatCompletion({
        system: systemPrompt,
        messages: formattedMessages as AIMessage[],
        provider: preferredProvider,
        apiKey: keyOverride || null,
        temperature: 0.7,
        // Short, fast answers: the widget renders progressively, and tone presets already
        // ask for 2-6 sentences. Larger budgets only add latency.
        maxTokens: isPinnedProductMode ? 700 : 600,
        inputBudgetTokens: 5500,
        timeoutMs: 30_000,
      })
    } catch (err) {
      if (err instanceof AIUnavailableError) {
        return Response.json({ error: "کلید API یافت نشد" }, { status: 500 })
      }
      console.error("[Chat] AI error:", err instanceof Error ? err.message : err)
      return Response.json({ error: "خطا در برقراری ارتباط با هوش مصنوعی" }, { status: 502 })
    }

    console.log(`[Chat] Streaming via ${ai.provider} (${ai.model}); estimated input tokens:`, inputTokens)

    // Persist + meter once the model finishes, without blocking the stream.
    ai.done
      .then(async ({ text, outputTokens }) => {
        try {
          const userIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
          const userAgent = req.headers.get("user-agent") || "unknown"
          await saveMessage(chatbotIdNum, userLastMessage, text, userIp, userAgent)
          if (chatbot.user_id) {
            await incrementTokenUsage(chatbot.user_id, inputTokens + outputTokens)
            if (isPinnedProductMode) await incrementSalesAdvisorUsage(chatbot.user_id)
          }
        } catch (saveError) {
          console.error("[Chat] Error saving message:", saveError)
        }
      })
      .catch(() => {})

    // Widget expects the Vercel AI data-stream text protocol: `0:"chunk"\n`
    const encoder = new TextEncoder()
    const reader = ai.stream.getReader()
    const stream = new ReadableStream({
      async pull(controller) {
        const { value, done } = await reader.read()
        if (done) {
          controller.close()
          return
        }
        controller.enqueue(encoder.encode(`0:${JSON.stringify(value)}\n`))
      },
      cancel() {
        reader.cancel().catch(() => {})
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "X-AI-Provider": ai.provider,
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("[Chat] Error:", error?.message)
    return Response.json({ error: "خطا در برقراری ارتباط" }, { status: 500 })
  }
}

