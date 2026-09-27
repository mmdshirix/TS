// API route to update user subscription status
import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getSql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const sql = getSql()
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "کاربر یافت نشد" }, { status: 401 })
    }

    const body = await request.json()
    const { subscription_type } = body

    if (!subscription_type) {
      return NextResponse.json({ success: false, message: "نوع اشتراک الزامی است" }, { status: 400 })
    }

    await sql`
      UPDATE users 
      SET subscription_status = ${subscription_type},
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true, message: "اشتراک با موفقیت به‌روزرسانی شد" })
  } catch (error: any) {
    console.error("[API] Error updating subscription:", error)
    return NextResponse.json({ success: false, message: error.message || "خطا در به‌روزرسانی" }, { status: 500 })
  }
}
