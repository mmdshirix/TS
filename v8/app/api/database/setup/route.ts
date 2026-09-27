import { type NextRequest, NextResponse } from "next/server"
import postgres from "postgres"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function createTestClient(databaseUrl: string) {
  return postgres(databaseUrl, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { databaseUrl } = await request.json()

    if (!databaseUrl || !databaseUrl.includes("postgres")) {
      return NextResponse.json({ error: "فرمت آدرس دیتابیس نامعتبر است" }, { status: 400 })
    }

    const sql = createTestClient(databaseUrl)

    try {
      const result = await sql`SELECT 1 as test`

      if (!result || result.length === 0) {
        return NextResponse.json({ error: "تست اتصال دیتابیس پاسخی برنگرداند" }, { status: 400 })
      }

      process.env.DATABASE_URL = databaseUrl

      return NextResponse.json({
        success: true,
        message: "اتصال دیتابیس موفق بود و آدرس برای همین نشست تنظیم شد.",
        note: "برای دائمی شدن، DATABASE_URL را در محیط اجرای برنامه تنظیم کنید.",
      })
    } finally {
      await sql.end({ timeout: 5 })
    }
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        error: "خطا در راه‌اندازی دیتابیس",
        details: error instanceof Error ? error.message : "خطای ناشناخته",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    return NextResponse.json({
      connected: false,
      error: "DATABASE_URL تنظیم نشده است",
      instruction: "لطفاً DATABASE_URL را تنظیم کنید",
    })
  }

  const sql = createTestClient(databaseUrl)

  try {
    const result = await sql`SELECT 1 as test`

    if (result && result.length > 0) {
      return NextResponse.json({
        connected: true,
        url: databaseUrl.substring(0, 30) + "...",
        message: "اتصال دیتابیس برقرار است",
      })
    }

    return NextResponse.json({
      connected: false,
      error: "آدرس دیتابیس وجود دارد اما تست اتصال ناموفق بود",
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: "اتصال به دیتابیس ناموفق بود",
      details: error instanceof Error ? error.message : "خطای ناشناخته",
    })
  } finally {
    await sql.end({ timeout: 5 })
  }
}
