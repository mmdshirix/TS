import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getUserChatbots } from "@/lib/user-db"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
    }

    const chatbots = await getUserChatbots(user.id)
    return NextResponse.json({ chatbots })
  } catch (error) {
    console.error("Error fetching user chatbots:", error)
    return NextResponse.json({ error: "خطا در دریافت اطلاعات" }, { status: 500 })
  }
}
