import { NextResponse, type NextRequest } from "next/server"
import { requireStore } from "@/lib/store-route"
import { listAppointments, clinicStats } from "@/lib/clinic-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const ctx = await requireStore()
  if ("error" in ctx) return ctx.error
  const sp = request.nextUrl.searchParams
  const [appointments, stats] = await Promise.all([
    listAppointments(ctx.store.id, {
      status: sp.get("status") || undefined,
      from: sp.get("from") || undefined,
      to: sp.get("to") || undefined,
      doctorId: sp.get("doctor") ? Number(sp.get("doctor")) : undefined,
    }),
    clinicStats(ctx.store.id),
  ])
  return NextResponse.json({ appointments, stats })
}
