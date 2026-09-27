import { NextRequest, NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"
import { verifySuperAdmin } from "@/lib/super-admin"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const isAuthenticated = await verifySuperAdmin()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const sql = getSharedSql()
    const { isActive } = await request.json()
    const chatbotId = Number.parseInt(params.id)

    await sql`
      UPDATE chatbots 
      SET is_active = ${isActive}
      WHERE id = ${chatbotId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error toggling chatbot:", error)
    return NextResponse.json({ error: "خطا در تغییر وضعیت چت‌بات" }, { status: 500 })
  }
}
