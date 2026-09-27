import { NextResponse, type NextRequest } from "next/server"
import { listPendingBaleBotConfigs, reportBaleBotStatus } from "@/lib/bale-bot-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Machine-facing endpoint used by the separate Bale bot Python service (see
// bale-bot-service/) to discover which stores need a bot running and to report
// back whether it started successfully. Never called from the browser.
function checkServiceSecret(request: NextRequest): boolean {
  const secret = process.env.BALE_BOT_SERVICE_SECRET
  if (!secret) return false
  return request.headers.get("x-service-secret") === secret
}

export async function GET(request: NextRequest) {
  if (!checkServiceSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const configs = await listPendingBaleBotConfigs()
  return NextResponse.json({
    configs: configs.map((c) => ({
      store_id: c.store_id,
      chatbot_id: c.chatbot_id,
      bot_token: c.bot_token,
      bot_username: c.bot_username,
      extra_env: c.extra_env,
      status: c.status,
    })),
  })
}

export async function POST(request: NextRequest) {
  if (!checkServiceSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const storeId = Number(body.store_id)
  const status = body.status === "error" ? "error" : "active"

  if (!storeId) {
    return NextResponse.json({ error: "store_id الزامی است" }, { status: 400 })
  }

  await reportBaleBotStatus(storeId, status, body.error_message)
  return NextResponse.json({ success: true })
}
