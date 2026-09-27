import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 })
    }

    console.log("[v0] Uploading image to imgCDN.dev:", file.name, "Size:", file.size)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")

    const uploadFormData = new FormData()
    uploadFormData.append("key", "5386e05a3562c7a8f984e73401540836")
    uploadFormData.append("source", base64)
    uploadFormData.append("format", "json")

    const response = await fetch("https://imgcdn.dev/api/1/upload", {
      method: "POST",
      body: uploadFormData,
    })

    const data = await response.json()
    console.log("[v0] imgCDN response:", data)

    if (!response.ok || !data.success) {
      console.error("[v0] imgCDN upload failed:", data)
      return NextResponse.json({ error: data.error?.message || "خطا در آپلود تصویر" }, { status: 500 })
    }

    if (!data.image?.url) {
      console.error("[v0] imgCDN response missing URL:", data)
      return NextResponse.json({ error: "خطا در دریافت لینک تصویر" }, { status: 500 })
    }

    const imageUrl = data.image.url
    console.log("[v0] Image uploaded successfully:", imageUrl)

    return NextResponse.json({ url: imageUrl }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error uploading image:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در آپلود تصویر" }, { status: 500 })
  }
}
