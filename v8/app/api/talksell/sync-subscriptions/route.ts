// API route to sync subscriptions from TalkSell to local database
import { NextResponse } from "next/server"
import { getSharedSql } from "@/lib/postgres"
import { getAllUsersGrouped } from "@/lib/talksell-api"

export async function POST() {
  try {
    const sql = getSharedSql()
    const allUsers = await getAllUsersGrouped()

    if (!allUsers) {
      return NextResponse.json({ success: false, message: "خطا در دریافت اطلاعات از TalkSell" })
    }

    let updated = 0
    let errors = 0

    // Update pro subscribers
    for (const user of allUsers.pro_subscribers) {
      try {
        const normalizedPhone = user.phone?.replace(/\D/g, "")
        if (normalizedPhone) {
          await sql`
            UPDATE users 
            SET subscription_status = 'pro',
                is_trial_active = FALSE
            WHERE phone LIKE ${"%" + normalizedPhone + "%"}
          `
          updated++
        }
      } catch (e) {
        errors++
      }
    }

    // Update mini subscribers
    for (const user of allUsers.mini_subscribers) {
      try {
        const normalizedPhone = user.phone?.replace(/\D/g, "")
        if (normalizedPhone) {
          await sql`
            UPDATE users 
            SET subscription_status = 'mini',
                is_trial_active = FALSE
            WHERE phone LIKE ${"%" + normalizedPhone + "%"}
          `
          updated++
        }
      } catch (e) {
        errors++
      }
    }

    // Update expired demos
    for (const user of allUsers.demo_users) {
      if (user.status === "expired") {
        try {
          const normalizedPhone = user.phone?.replace(/\D/g, "")
          if (normalizedPhone) {
            await sql`
              UPDATE users 
              SET is_trial_active = FALSE,
                  subscription_status = 'expired'
              WHERE phone LIKE ${"%" + normalizedPhone + "%"}
                AND subscription_status = 'trial'
            `
            updated++
          }
        } catch (e) {
          errors++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updated} کاربر به‌روزرسانی شد`,
      updated,
      errors,
    })
  } catch (error: any) {
    console.error("[API] Error syncing subscriptions:", error)
    return NextResponse.json({ success: false, message: error.message || "خطا در همگام‌سازی" }, { status: 500 })
  }
}
