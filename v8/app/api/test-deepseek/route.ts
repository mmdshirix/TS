import { NextResponse } from "next/server"
import { testProvider, getDefaultProviderId } from "@/lib/ai"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Legacy connectivity test route — now checks whichever provider is active (Arvan by default).
export async function POST() {
  const provider = await getDefaultProviderId()
  const result = await testProvider(provider)
  return NextResponse.json({ provider, ...result }, { status: result.ok ? 200 : 502 })
}

export async function GET() {
  return POST()
}
