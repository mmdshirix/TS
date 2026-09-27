import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { verifyOtpCode } from "@/lib/otp-db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) {
    return NextResponse.json({ error: "فروشگاه یافت نشد" }, { status: 404 })
  }

  const body = await request.json()
  const phone = typeof body.phone === "string" ? body.phone.replace(/\s|-/g, "") : ""
  const code = typeof body.code === "string" ? body.code.trim() : ""

  if (!phone || !code) {
    return NextResponse.json({ error: "شماره تلفن و کد الزامی است" }, { status: 400 })
  }

  const verifyToken = await verifyOtpCode(store.id, phone, code)
  if (!verifyToken) {
    return NextResponse.json({ error: "کد وارد شده نامعتبر یا منقضی شده است" }, { status: 400 })
  }

  return NextResponse.json({ verified: true, verifyToken })
}
