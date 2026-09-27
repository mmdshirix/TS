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

export async function PUT(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const sql = getSql()
    const userId = Number(params.userId)
    const body = await request.json()
    const { username, password, full_name, email, is_active } = body

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (username) {
      updates.push(`username = $${paramIndex}`)
      values.push(username)
      paramIndex++
    }

    if (password) {
      const passwordHash = simpleHash(password)
      updates.push(`password_hash = $${paramIndex}`)
      values.push(passwordHash)
      paramIndex++
    }

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex}`)
      values.push(full_name)
      paramIndex++
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex}`)
      values.push(email)
      paramIndex++
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`)
      values.push(is_active)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "هیچ تغییری ارسال نشده است" }, { status: 400 })
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)

    const query = `UPDATE chatbot_admin_users SET ${updates.join(", ")} WHERE id = $${paramIndex}`

    await sql.unsafe(query, values)

    return NextResponse.json({ message: "کاربر با موفقیت بروزرسانی شد" })
  } catch (error) {
    console.error("Error updating admin user:", error)
    return NextResponse.json(
      {
        error: "خطا در بروزرسانی کاربر: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const sql = getSql()
    const userId = Number(params.userId)

    await sql`DELETE FROM chatbot_admin_users WHERE id = ${userId}`

    return NextResponse.json({ message: "کاربر با موفقیت حذف شد" })
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return NextResponse.json(
      {
        error: "خطا در حذف کاربر: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}
