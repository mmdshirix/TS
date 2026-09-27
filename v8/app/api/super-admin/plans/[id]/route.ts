import { type NextRequest, NextResponse } from "next/server"
import { verifySuperAdmin } from "@/lib/super-admin"
import { getSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await verifySuperAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const plan = await getSubscriptionPlan(Number.parseInt(id))
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }
    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Error fetching plan:", error)
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await verifySuperAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const data = await req.json()

    console.log("[v0] Updating plan:", id, data)

    const plan = await updateSubscriptionPlan(Number.parseInt(id), data)
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    console.log("[v0] Plan updated successfully:", plan)
    return NextResponse.json({ plan })
  } catch (error) {
    console.error("[v0] Error updating plan:", error)
    return NextResponse.json(
      {
        error: "Failed to update plan",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await verifySuperAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    await deleteSubscriptionPlan(Number.parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting plan:", error)
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 })
  }
}
