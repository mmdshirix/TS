import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tone } = await req.json()
    if (!["friendly", "concise", "professional", "intelligent"].includes(tone)) {
      return NextResponse.json({ error: "Invalid tone" }, { status: 400 })
    }

    const sql = getSql()

    // Update all chatbots owned by this user to use the selected tone
    await sql`
      UPDATE chatbots
      SET response_tone = ${tone}
      WHERE user_id = ${user.id}
    `

    return NextResponse.json({ success: true, tone })
  } catch (error) {
    console.error("Error updating default tone:", error)
    return NextResponse.json({ error: "Failed to update tone" }, { status: 500 })
  }
}
