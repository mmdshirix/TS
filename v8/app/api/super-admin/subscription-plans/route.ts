import { NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"

export const dynamic = "force-dynamic"

function getSql() {
  return getSharedSql()
}

export async function GET() {
  try {
    const sql = getSql()
    const plans = await sql`
      SELECT * FROM subscription_plans ORDER BY position ASC
    `
    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching subscription plans:", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}
