import { NextRequest, NextResponse } from "next/server"
import { verifySuperAdmin } from "@/lib/super-admin"
import { getAllSubscriptionPlans, createSubscriptionPlan } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const plans = await getAllSubscriptionPlans()
    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifySuperAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const plan = await createSubscriptionPlan(data)
    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 })
  }
}
