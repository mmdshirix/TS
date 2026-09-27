import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

// Simple hash function
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString()
}

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getSql()
    const chatbotId = Number(params.id)

    if (!sql) {
      return NextResponse.json({ error: "دیتابیس در دسترس نیست" }, { status: 500 })
    }

    const users = await sql`
      SELECT id, chatbot_id, username, full_name, email, is_active, last_login
      FROM chatbot_admin_users 
      WHERE chatbot_id = ${chatbotId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "خطا در دریافت کاربران" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getSql()
    const chatbotId = Number(params.id)
    const body = await request.json()
    const { username, password, full_name, email } = body

    console.log("Creating admin user:", { chatbotId, username, full_name, email })

    if (!username || !password) {
      return NextResponse.json({ error: "نام کاربری و رمز عبور الزامی است" }, { status: 400 })
    }

    if (!sql) {
      return NextResponse.json({ error: "دیتابیس در دسترس نیست" }, { status: 500 })
    }

    // Check if username already exists for this chatbot
    const existingUser = await sql`
      SELECT id FROM chatbot_admin_users 
      WHERE chatbot_id = ${chatbotId} AND username = ${username}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "این نام کاربری قبلاً استفاده شده است" }, { status: 400 })
    }

    // Create new admin user
    const passwordHash = simpleHash(password)

    const result = await sql`
      INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email)
      VALUES (${chatbotId}, ${username}, ${passwordHash}, ${full_name || null}, ${email || null})
      RETURNING id, chatbot_id, username, full_name, email, is_active, last_login
    `

    const user = result[0]

    return NextResponse.json({
      user,
      message: "کاربر ادمین با موفقیت ایجاد شد",
    })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      {
        error: "خطا در ایجاد کاربر ادمین: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}
