import { type NextRequest, NextResponse } from "next/server"
import { verifySuperAdmin } from "@/lib/super-admin"
import { getSharedSql } from "@/lib/postgres"

export async function POST(request: NextRequest) {
  const isAdmin = await verifySuperAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const sql = getSharedSql()
    const { setting_key, setting_value } = await request.json()

    await sql`
      CREATE TABLE IF NOT EXISTS global_settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      INSERT INTO global_settings (setting_key, setting_value, updated_at)
      VALUES (${setting_key}, ${setting_value}, NOW())
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = ${setting_value}, updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving global setting:", error)
    return NextResponse.json({ error: "Failed to save setting" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const sql = getSharedSql()
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (key) {
      const result = await sql`
        SELECT setting_value FROM global_settings WHERE setting_key = ${key}
      `
      return NextResponse.json({ value: result[0]?.setting_value || null })
    }

    const results = await sql`SELECT * FROM global_settings`
    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching global settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}
