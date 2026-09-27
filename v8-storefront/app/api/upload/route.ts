import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"]

/**
 * Customer-side uploads (payment receipts, prescription photos). Proxies to the same
 * image CDN the platform uses so nothing is stored on the storefront container.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "حجم فایل باید کمتر از ۸ مگابایت باشد" }, { status: 400 })
    if (file.type && !ALLOWED.includes(file.type)) return NextResponse.json({ error: "فرمت فایل پشتیبانی نمی‌شود" }, { status: 400 })

    const platform = process.env.PLATFORM_URL || process.env.NEXT_PUBLIC_PLATFORM_URL
    // Preferred: reuse the platform's upload endpoint (same CDN account, one place to change).
    if (platform) {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch(`${platform}/api/upload-image`, { method: "POST", body: fd })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) return NextResponse.json({ url: data.url })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fd = new FormData()
    fd.append("key", process.env.IMGCDN_KEY || "5386e05a3562c7a8f984e73401540836")
    fd.append("source", buffer.toString("base64"))
    fd.append("format", "json")
    const res = await fetch("https://imgcdn.dev/api/1/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (!res.ok || !data?.image?.url) return NextResponse.json({ error: "خطا در آپلود فایل" }, { status: 502 })
    return NextResponse.json({ url: data.image.url })
  } catch (error) {
    console.error("[upload]", error)
    return NextResponse.json({ error: "خطا در آپلود فایل" }, { status: 500 })
  }
}
