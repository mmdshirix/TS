import { NextResponse, type NextRequest } from "next/server"
import { createHmac } from "crypto"
import { getSql } from "@/lib/db"
import { metaConfig, getAccountByIgUserId, handleIncomingMessage } from "@/lib/instagram"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 60

// Meta verification handshake
export function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  if (sp.get("hub.mode") === "subscribe" && sp.get("hub.verify_token") === metaConfig().verifyToken) {
    return new NextResponse(sp.get("hub.challenge") || "", { status: 200 })
  }
  return new NextResponse("Forbidden", { status: 403 })
}

function verifySignature(raw: string, header: string | null): boolean {
  const secret = metaConfig().appSecret
  if (!secret) return true // not configured yet → accept (dev)
  if (!header?.startsWith("sha256=")) return false
  const expected = createHmac("sha256", secret).update(raw).digest("hex")
  return header.slice(7) === expected
}

export async function POST(request: NextRequest) {
  const raw = await request.text()
  if (!verifySignature(raw, request.headers.get("x-hub-signature-256"))) return new NextResponse("Invalid signature", { status: 401 })

  let payload: any
  try {
    payload = JSON.parse(raw)
  } catch {
    return new NextResponse("Bad JSON", { status: 400 })
  }

  const sql = getSql()
  const eventRow = (await sql`INSERT INTO instagram_webhook_events (object_type, payload) VALUES (${payload.object || null}, ${JSON.stringify(payload)}) RETURNING id`)[0] as any

  // Respond fast; process inline but never let processing errors bubble to Meta.
  try {
    if (payload.object === "instagram" || payload.object === "page") {
      for (const entry of payload.entry || []) {
        const igUserId = String(entry.id)
        for (const ev of entry.messaging || []) {
          const senderId = ev.sender?.id
          const recipientId = ev.recipient?.id
          const message = ev.message
          if (!senderId || !message || message.is_echo) continue
          const account = (await getAccountByIgUserId(recipientId || igUserId)) || (await getAccountByIgUserId(igUserId))
          if (!account) continue
          if (senderId === account.ig_user_id) continue
          const text: string = message.text || (message.attachments?.length ? "[پیوست]" : "") || (ev.postback?.payload ? String(ev.postback.payload) : "")
          if (!text) continue
          await handleIncomingMessage(account, senderId, text, { igMessageId: message.mid || null })
        }
      }
    }
    await sql`UPDATE instagram_webhook_events SET processed = TRUE WHERE id = ${eventRow.id}`
  } catch (e) {
    console.error("[instagram/webhook]", e)
    await sql`UPDATE instagram_webhook_events SET error = ${e instanceof Error ? e.message : String(e)} WHERE id = ${eventRow.id}`
  }
  return NextResponse.json({ ok: true })
}
