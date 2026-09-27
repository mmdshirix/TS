import type { NextRequest } from "next/server"
import { getChatbotById, getChatbotFAQs, getChatbotProducts, getChatbotKnowledgeBase, saveMessage, getSql } from "@/lib/db"
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

async function callDeepSeekAPI(apiKey: string, systemPrompt: string, messages: any[], useArvan: boolean = false) {
  const url = useArvan
    ? `${process.env.ARVAN_API_URL}/chat/completions`
    : "https://api.deepseek.com/chat/completions";

  const deepseekResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: useArvan ? "Xerxes-1" : "deepseek-chat",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 4096,
      temperature: 0.8,
      stream: true,
    }),
  })
  return deepseekResponse
}

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

    // Determine AI provider - check chatbot's ai_provider field first, then fallback to env config
    const aiProvider = (process.env.AI_PROVIDER as "deepseek" | "arvan") || "deepseek"
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY
    const arvanApiKey = process.env.ARVAN_API_KEY

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

    // Fetch global settings from database
    let dbAiProvider = null
    let dbAiApiKey = null
    try {
      const sql = getSql()
      const globalSettings = await sql`SELECT setting_key, setting_value FROM global_settings`
      const settingsMap = new Map(globalSettings.map((s: any) => [s.setting_key, s.setting_value]))
      dbAiProvider = settingsMap.get("ai_provider")
      dbAiApiKey = settingsMap.get("ai_api_key")
    } catch (dbErr) {
      console.error("[Chat] Error fetching global settings from DB:", dbErr)
    }

    // Determine which AI to use: chatbot-specific > global setting > environment
    const currentProvider = chatbot.ai_provider || dbAiProvider || aiProvider
    const useArvan = currentProvider === "arvan"

    let apiKey = null
    if (useArvan) {
      apiKey = chatbot.arvan_api_key || (dbAiProvider === "arvan" ? dbAiApiKey : null) || arvanApiKey || process.env.ARVAN_API_KEY
    } else {
      apiKey = chatbot.deepseek_api_key || (dbAiProvider === "deepseek" ? dbAiApiKey : null) || deepseekApiKey || process.env.DEEPSEEK_API_KEY
    }

    if (!apiKey) {
      console.error(`No API key configured for ${useArvan ? "Arvan" : "DeepSeek"} AI`)
      return Response.json({ error: "کلید API یافت نشد" }, { status: 500 })
    }

    console.log(`[Chat] Calling ${useArvan ? "Arvan" : "DeepSeek"} AI... Estimated input tokens:`, inputTokens)

    const aiResponse = await callDeepSeekAPI(
      apiKey as string,
      systemPrompt,
      formattedMessages,
      useArvan
    )

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error(`[Chat] ${useArvan ? "Arvan" : "DeepSeek"} API error:`, aiResponse.status, errorText)
      return Response.json({ error: "خطا در برقراری ارتباط با هوش مصنوعی" }, { status: aiResponse.status })
    }

    const encoder = new TextEncoder()
    let fullText = ""

    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResponse.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              console.log("[Chat] Stream complete, response length:", fullText.length)

              try {
                const userIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
                const userAgent = req.headers.get("user-agent") || "unknown"
                await saveMessage(chatbotIdNum, userLastMessage, fullText, userIp, userAgent)

                if (chatbot.user_id) {
                  const outputTokens = estimateTokens(fullText)
                  const totalTokens = inputTokens + outputTokens
                  await incrementTokenUsage(chatbot.user_id, totalTokens)
                  console.log(
                    "[Chat] Token usage tracked:",
                    totalTokens,
                    "(input:",
                    inputTokens,
                    "output:",
                    outputTokens,
                    ")",
                  )

                  // Track sales advisor usage if in pinned product mode
                  if (isPinnedProductMode) {
                    await incrementSalesAdvisorUsage(chatbot.user_id)
                    console.log("[Chat] Sales advisor usage tracked")
                  }
                }
              } catch (saveError) {
                console.error("[Chat] Error saving message:", saveError)
              }

              controller.close()
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content

                  if (content) {
                    fullText += content
                    const formattedChunk = `0:${JSON.stringify(content)}\n`
                    controller.enqueue(encoder.encode(formattedChunk))
                  }
                } catch (e) {}
              }
            }
          }
        } catch (error) {
          console.error("[Chat] Stream error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("[Chat] Error:", error?.message)
    return Response.json({ error: "خطا در برقراری ارتباط" }, { status: 500 })
  }
}

function getToneInstructions(tone: string): string {
  switch (tone) {
    case "concise":
      return `🎯 سبک پاسخ‌دهی شما (مختصر و مفید):
- پاسخ‌های کوتاه و دقیق (2-3 جمله کوتاه)
- مستقیم به اصل مطلب بروید
- فقط اطلاعات کلیدی
- استفاده از ایموجی برای جذابیت (حداکثر 2 عدد)
- لحن دوستانه و کاربردی
- در پایان، یک سوال کوتاه برای ادامه مکالمه بپرسید`

    case "professional":
      return `🎯 سبک پاسخ‌دهی شما (حرفه‌ای):
- پاسخ‌های متوسط (3-4 جمله)
- لحن رسمی و محترمانه
- استفاده محدود از ایموجی (فقط در ابتدا)
- اطلاعات دقیق و معتبر
- ساختار منطقی
- در پایان، پیشنهاد کمک بیشتر بدهید`

    case "intelligent":
      return `🎯 سبک پاسخ‌دهی شما (هوشمند و تحلیلی):
- پاسخ‌های جامع (4-6 جمله)
- تحلیل دقیق با جزئیات
- استفاده از ایموجی‌های تحلیلی (📊 💡 🔍)
- توضیحات فنی و تخصصی
- لحن آموزشی
- در پایان، سوال تحلیلی بپرسید`

    case "friendly":
    default:
      return `🎯 سبک پاسخ‌دهی شما (دوستانه و باهوش):
- پاسخ‌های کوتاه و هوشمند (2-3 جمله کوتاه) برای شروع مکالمه
- استفاده از ایموجی‌های متنوع برای جذابیت (✨ 💡 🌟 🎯)
- لحن صمیمی، گرم و دوستانه
- اطلاعات مفید و خواندنی
- در پایان، کاربر را به ادامه گفتگو تشویق کنید با یک سوال یا پیشنهاد جالب`
  }
}
