import { NextResponse, type NextRequest } from "next/server"
import { requireStore } from "@/lib/store-route"
import { listPrescriptions, pharmacyStats } from "@/lib/pharmacy-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const status = request.nextUrl.searchParams.get("status") || undefined
  const [prescriptions, stats] = await Promise.all([listPrescriptions(ctx.store.id, status), pharmacyStats(ctx.store.id)])
  return NextResponse.json({ prescriptions, stats })
}
