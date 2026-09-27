import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import {
  getStoreByUserId,
  listLandingBlocks,
  getLandingBlockById,
  createLandingBlock,
  updateLandingBlock,
  deleteLandingBlock,
  updateStore,
  LANDING_BLOCK_TYPES as VALID_TYPES,
} from "@/lib/store-db"
import { callDeepSeek, DeepSeekUnavailableError } from "@/lib/deepseek"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Scoped intentionally to data the dashboard's own landing-page builder and store
// settings already let a merchant change — never raw source files. The model can only
// ever call the same store-scoped functions the UI does, so it can't affect anything
// outside the calling user's own store.
interface ProgrammerAction {
  action: "add_block" | "update_block" | "delete_block" | "update_theme"
  page?: "home" | "about" | "contact"
  type?: string
  block_id?: number
  config?: Record<string, any>
  color_scheme?: { primary?: string; secondary?: string; surface?: string; radius?: string }
}

function splitReplyAndAction(text: string): { reply: string; action: ProgrammerAction | null } {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return { reply: text.trim(), action: null }
  try {
    const action = JSON.parse(match[0]) as ProgrammerAction
    return { reply: text.slice(0, match.index).trim(), action }
  } catch {
    return { reply: text.trim(), action: null }
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

    const body = await request.json()
    const message = typeof body.message === "string" ? body.message.trim() : ""
    const page = ["home", "about", "contact"].includes(body.page) ? body.page : "home"
    const history = Array.isArray(body.history)
      ? body.history
          .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-10)
      : []

    if (!message) {
      return NextResponse.json({ error: "پیام الزامی است" }, { status: 400 })
    }

    const blocks = await listLandingBlocks(store.id, page)

    const system = `تو "دستیار برنامه‌نویس" یک پلتفرم فروشگاه‌ساز فارسی هستی و در حال گفتگو با صاحب یک فروشگاه هستی تا صفحه «${page}» فروشگاهش را طبق درخواست او تغییر دهی.

فقط می‌توانی از طریق یکی از این اکشن‌ها تغییر اعمال کنی (در انتهای پاسخت، فقط یک آبجکت JSON با ساختار دقیق زیر — بدون آن، هیچ تغییری اعمال نمی‌شود):
- افزودن بلاک جدید: {"action":"add_block","type":"<یکی از: ${VALID_TYPES.join(", ")}>","config":{...}}
- ویرایش بلاک موجود: {"action":"update_block","block_id":<شناسه>,"config":{...}}
- حذف بلاک: {"action":"delete_block","block_id":<شناسه>}
- تغییر رنگ/شکل ظاهری فروشگاه: {"action":"update_theme","color_scheme":{"primary":"#...","secondary":"#...","surface":"#...","radius":"0.5rem"}}

بلاک‌های فعلی این صفحه (به همراه شناسه و تنظیمات هرکدام):
${JSON.stringify(blocks.map((b) => ({ id: b.id, type: b.type, config: b.config })))}

رنگ‌بندی فعلی فروشگاه: ${JSON.stringify(store.color_scheme || {})}

ابتدا در یکی دو جمله فارسی ساده توضیح بده چه کاری انجام می‌دهی، سپس در صورت نیاز به تغییر، دقیقاً یک آبجکت JSON در انتهای پیام بیاور. اگر کاربر فقط سوال پرسیده و نیازی به تغییر نیست، هیچ JSON برنگردان.`

    const text = await callDeepSeek(message, { system, history, temperature: 0.4, maxTokens: 1200 })
    const { reply, action } = splitReplyAndAction(text)

    let applied = false
    if (action) {
      if (action.action === "add_block" && action.type && VALID_TYPES.includes(action.type)) {
        await createLandingBlock({ store_id: store.id, type: action.type, page, config: action.config || {} })
        applied = true
      } else if (action.action === "update_block" && action.block_id) {
        const block = await getLandingBlockById(action.block_id)
        if (block && block.store_id === store.id) {
          await updateLandingBlock(action.block_id, { config: { ...block.config, ...(action.config || {}) } })
          applied = true
        }
      } else if (action.action === "delete_block" && action.block_id) {
        const block = await getLandingBlockById(action.block_id)
        if (block && block.store_id === store.id) {
          await deleteLandingBlock(action.block_id)
          applied = true
        }
      } else if (action.action === "update_theme" && action.color_scheme) {
        await updateStore(store.id, { color_scheme: { ...(store.color_scheme || {}), ...action.color_scheme } })
        applied = true
      }
    }

    const updatedBlocks = await listLandingBlocks(store.id, page)
    return NextResponse.json({ reply: reply || "انجام شد.", applied, blocks: updatedBlocks })
  } catch (error) {
    if (error instanceof DeepSeekUnavailableError) {
      return NextResponse.json({ error: "سرویس هوش مصنوعی در حال حاضر پیکربندی نشده است" }, { status: 503 })
    }
    console.error("API Error in programmer assistant:", error)
    return NextResponse.json({ error: "خطا در پردازش درخواست" }, { status: 500 })
  }
}
