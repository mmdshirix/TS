import { type NextRequest, NextResponse } from "next/server"
import {
  getChatbotKnowledgeBase,
  createKnowledgeBaseEntry,
  deleteKnowledgeBaseEntry,
  syncKnowledgeBaseFromFAQs,
  syncKnowledgeBaseFromProducts,
} from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    const knowledgeBase = await getChatbotKnowledgeBase(chatbotId)

    const stats = {
      total: knowledgeBase.length,
      byType: {
        url: knowledgeBase.filter((kb) => kb.type === "url").length,
        text: knowledgeBase.filter((kb) => kb.type === "text").length,
        file: knowledgeBase.filter((kb) => kb.type === "file").length,
        faq: knowledgeBase.filter((kb) => kb.type === "faq").length,
        product: knowledgeBase.filter((kb) => kb.type === "product").length,
        wordpress: knowledgeBase.filter((kb) => kb.type === "wordpress").length,
      },
      totalCharacters: knowledgeBase.reduce((sum, kb) => sum + (kb.content?.length || 0), 0),
    }

    return NextResponse.json({ knowledgeBase, stats })
  } catch (error) {
    console.error("Error fetching knowledge base:", error)
    return NextResponse.json({ error: "خطا در دریافت پایگاه دانش" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File

      if (!file) {
        return NextResponse.json({ error: "فایلی آپلود نشده است" }, { status: 400 })
      }

      // Validate file size (7MB max)
      if (file.size > 7 * 1024 * 1024) {
        return NextResponse.json({ error: "حجم فایل نباید بیشتر از ۷ مگابایت باشد" }, { status: 400 })
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/json",
        "text/plain",
      ]

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "فرمت فایل پشتیبانی نمی‌شود" }, { status: 400 })
      }

      // Extract text from file
      let extractedText = ""
      const fileType = file.type

      if (fileType === "text/plain") {
        extractedText = await file.text()
      } else if (fileType === "application/json") {
        const jsonContent = await file.text()
        extractedText = JSON.stringify(JSON.parse(jsonContent), null, 2)
      } else {
        // For PDF, Word, Excel - for now just indicate they're uploaded
        // In production, you'd use libraries like pdf-parse, mammoth, xlsx
        extractedText = `فایل ${file.name} آپلود شده است. برای استخراج کامل محتوا، از ابزارهای تخصصی استفاده کنید.`
      }

      // Create knowledge base entry
      const newEntry = await createKnowledgeBaseEntry({
        chatbot_id: chatbotId,
        type: "file",
        title: file.name,
        content: extractedText,
        source_url: null,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      })

      return NextResponse.json({ success: true, entry: newEntry })
    }

    // Handle JSON actions
    const body = await request.json()
    const { action, entry, url } = body

    console.log("[v0] Knowledge base action:", action, "for chatbot:", chatbotId)

    if (action === "sync-faqs") {
      await syncKnowledgeBaseFromFAQs(chatbotId)
      const knowledgeBase = await getChatbotKnowledgeBase(chatbotId)
      return NextResponse.json({ success: true, knowledgeBase })
    }

    if (action === "sync-products") {
      await syncKnowledgeBaseFromProducts(chatbotId)
      const knowledgeBase = await getChatbotKnowledgeBase(chatbotId)
      return NextResponse.json({ success: true, knowledgeBase })
    }

    if (action === "scrape-url") {
      try {
        console.log("[v0] Scraping URL:", url)

        let validUrl: URL
        try {
          validUrl = new URL(url)
        } catch {
          return NextResponse.json({ error: "فرمت آدرس URL نامعتبر است" }, { status: 400 })
        }

        const response = await fetch(validUrl.toString(), {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "fa,en;q=0.9",
          },
          redirect: "follow",
        })

        if (!response.ok) {
          console.error("[v0] Failed to fetch URL, status:", response.status)
          return NextResponse.json({ error: `خطا در دسترسی به URL (کد ${response.status})` }, { status: 400 })
        }

        const contentType = response.headers.get("content-type") || ""
        if (!contentType.includes("text/html")) {
          return NextResponse.json({ error: "این URL یک صفحه HTML نیست" }, { status: 400 })
        }

        const html = await response.text()
        console.log("[v0] Fetched HTML, length:", html.length)

        let textContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, " ")
          .trim()

        if (textContent.length < 50) {
          return NextResponse.json({ error: "محتوای کافی در این صفحه یافت نشد" }, { status: 400 })
        }

        textContent = textContent.substring(0, 5000)

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        const pageTitle = titleMatch ? titleMatch[1].trim() : validUrl.hostname

        const newEntry = await createKnowledgeBaseEntry({
          chatbot_id: chatbotId,
          type: "url",
          title: `محتوای ${pageTitle}`,
          content: textContent,
          source_url: url,
        })

        console.log("[v0] Created knowledge base entry:", newEntry.id)
        return NextResponse.json({ success: true, entry: newEntry })
      } catch (error: any) {
        console.error("[v0] Error scraping URL:", error)
        return NextResponse.json(
          { error: `خطا در استخراج محتوای URL: ${error.message || "خطای ناشناخته"}` },
          { status: 400 },
        )
      }
    }

    if (action === "add-text") {
      const newEntry = await createKnowledgeBaseEntry({
        chatbot_id: chatbotId,
        type: "text",
        title: entry.title,
        content: entry.content,
        source_url: null,
      })
      return NextResponse.json({ success: true, entry: newEntry })
    }

    return NextResponse.json({ error: "عملیات نامعتبر" }, { status: 400 })
  } catch (error) {
    console.error("Error managing knowledge base:", error)
    return NextResponse.json({ error: "خطا در مدیریت پایگاه دانش" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get("entryId")

    if (!entryId) {
      return NextResponse.json({ error: "شناسه ورودی الزامی است" }, { status: 400 })
    }

    await deleteKnowledgeBaseEntry(Number.parseInt(entryId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting knowledge base entry:", error)
    return NextResponse.json({ error: "خطا در حذف ورودی" }, { status: 500 })
  }
}
