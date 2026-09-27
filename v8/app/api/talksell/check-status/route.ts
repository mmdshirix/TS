// API route to check user subscription status from TalkSell
import { type NextRequest, NextResponse } from "next/server"
import { getSubscriptionTypeByEmail, getDemoUsers, getSubscribers } from "@/lib/talksell-api"

function normalizePhoneForTalkSell(phone: string): string {
  const digits = phone.replace(/\D/g, "")

  // Handle different formats:
  // 989028655392 -> 09028655392
  // +989028655392 -> 09028655392
  // 09028655392 -> 09028655392
  // 9028655392 -> 09028655392

  if (digits.startsWith("98") && digits.length === 12) {
    return "0" + digits.slice(2)
  } else if (digits.startsWith("0") && digits.length === 11) {
    return digits
  } else if (digits.length === 10 && !digits.startsWith("0")) {
    return "0" + digits
  }

  return digits
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawPhone = searchParams.get("phone")
    const email = searchParams.get("email")

    if (!rawPhone && !email) {
      return NextResponse.json({ success: false, message: "شماره تلفن یا ایمیل الزامی است" }, { status: 400 })
    }

    const phone = rawPhone ? normalizePhoneForTalkSell(rawPhone) : null
    console.log("[API] Checking status - raw phone:", rawPhone, "normalized:", phone, "email:", email)

    let subscriptionType: "demo" | "mini" | "pro" | null = null
    let daysRemaining = 30

    if (phone) {
      console.log("[API] Checking subscription by phone:", phone)

      // Get all subscribers and compare
      const [miniSubs, proSubs] = await Promise.all([getSubscribers("mini"), getSubscribers("pro")])

      console.log("[API] Found subscribers - mini:", miniSubs.length, "pro:", proSubs.length)
      console.log("[API] Mini subscribers:", JSON.stringify(miniSubs, null, 2))
      console.log("[API] Pro subscribers:", JSON.stringify(proSubs, null, 2))

      const phoneDigits = phone.replace(/\D/g, "")
      const last10 = phoneDigits.slice(-10)
      console.log("[API] Searching for phone last10:", last10, "from normalized:", phone)

      // Check pro first
      for (const user of proSubs) {
        const userPhone = user.phone?.replace(/\D/g, "") || ""
        const userLast10 = userPhone.slice(-10)
        console.log("[API] Comparing pro user:", {
          name: `${user.first_name} ${user.last_name}`,
          phone: user.phone,
          phoneDigits: userPhone,
          last10: userLast10,
          searchLast10: last10,
          match: userLast10 === last10,
        })
        if (userLast10 === last10) {
          console.log("[API] ✅ Found PRO subscription match!")
          subscriptionType = "pro"
          break
        }
      }

      // Check mini if not pro
      if (!subscriptionType) {
        for (const user of miniSubs) {
          const userPhone = user.phone?.replace(/\D/g, "") || ""
          const userLast10 = userPhone.slice(-10)
          console.log("[API] Comparing mini user:", {
            name: `${user.first_name} ${user.last_name}`,
            phone: user.phone,
            phoneDigits: userPhone,
            last10: userLast10,
            searchLast10: last10,
            match: userLast10 === last10,
          })
          if (userLast10 === last10) {
            console.log("[API] ✅ Found MINI subscription match!")
            subscriptionType = "mini"
            break
          }
        }
      }
    }

    // Check email if no subscription found yet
    if (!subscriptionType && email) {
      console.log("[API] Checking subscription by email:", email)
      subscriptionType = await getSubscriptionTypeByEmail(email)
      console.log("[API] Email check result:", subscriptionType)
    }

    // If still no subscription, check demo users
    if (!subscriptionType || subscriptionType === "demo") {
      const demoUsers = await getDemoUsers("active")
      console.log("[API] Checking demo users, count:", demoUsers.length)

      if (phone) {
        const phoneDigits = phone.replace(/\D/g, "")
        const last10 = phoneDigits.slice(-10)

        for (const user of demoUsers) {
          const userPhone = user.phone?.replace(/\D/g, "") || ""
          const userLast10 = userPhone.slice(-10)
          if (userLast10 === last10) {
            console.log("[API] Found demo user by phone:", user)
            daysRemaining = user.days_remaining || 30
            subscriptionType = "demo"
            break
          }
        }
      }

      if (!subscriptionType && email) {
        const normalizedEmail = email.toLowerCase().trim()
        for (const user of demoUsers) {
          if (user.email?.toLowerCase().trim() === normalizedEmail) {
            console.log("[API] Found demo user by email:", user)
            daysRemaining = user.days_remaining || 30
            subscriptionType = "demo"
            break
          }
        }
      }
    }

    console.log("[API] Final result:", { subscriptionType, daysRemaining })

    return NextResponse.json({
      success: true,
      email,
      phone,
      subscription_type: subscriptionType,
      has_subscription: subscriptionType === "mini" || subscriptionType === "pro",
      has_demo: subscriptionType === "demo",
      days_remaining: daysRemaining,
    })
  } catch (error: any) {
    console.error("[API] Error checking status:", error)
    return NextResponse.json({ success: false, message: error.message || "خطا در بررسی وضعیت" }, { status: 500 })
  }
}
