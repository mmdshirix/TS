// Comprehensive Subscription System for TalkSell
// Integrates with WordPress API and enforces plan limits

import { getSharedSql } from "@/lib/postgres"

function getSql() {
  return getSharedSql()
}

// TalkSell WordPress API Configuration
const TALKSELL_API_BASE = "https://talksell.ir/wp-json/talksell"
const TALKSELL_API_KEY = process.env.TALKSELL_SUBSCRIPTION_API_KEY ?? ""

// Pricing page URL for all upgrade CTAs
export const UPGRADE_URL = "https://talksell.ir/تعرفه-ها/"

// Plan limits based on documentation image
export const PLAN_LIMITS = {
  start: {
    name: "Start",
    nameFa: "استارت",
    price: 390000,
    ai_tokens: 500000,
    product_inputs: 50,
    response_quality: "basic",
    crawler_links: 1,
    cta_type: "simple",
    cta_limit: 20,
    sales_advisor_limit: 20,
    conversation_memory: "short",
    ai_learning_depth: "surface",
    suggested_questions: true,
    ticket_system: true,
    product_sync: false,
    api_access: false,
    order_tracking: false,
    customer_return_detection: false,
    stores_limit: 1,
    store_products_limit: 50,
  },
  grow: {
    name: "Grow",
    nameFa: "رشد",
    price: 1300000,
    ai_tokens: 1500000,
    product_inputs: 150,
    response_quality: "advanced",
    crawler_links: 5,
    cta_type: "advanced",
    cta_limit: 60,
    sales_advisor_limit: 200,
    conversation_memory: "medium",
    ai_learning_depth: "deep",
    suggested_questions: true,
    ticket_system: true,
    product_sync: true,
    api_access: true,
    order_tracking: true,
    customer_return_detection: false,
    stores_limit: 3,
    store_products_limit: 150,
  },
  scale: {
    name: "Scale",
    nameFa: "مقیاس",
    price: 3700000,
    ai_tokens: 5000000,
    product_inputs: 500,
    response_quality: "intelligent",
    crawler_links: -1,
    cta_type: "intelligent",
    cta_limit: -1,
    sales_advisor_limit: 500,
    conversation_memory: "long_term",
    ai_learning_depth: "deepest",
    suggested_questions: true,
    ticket_system: true,
    product_sync: true,
    api_access: true,
    order_tracking: true,
    customer_return_detection: true,
    stores_limit: 10,
    store_products_limit: 500,
  },
  demo: {
    name: "Demo",
    nameFa: "دمو",
    price: 0,
    ai_tokens: 100000,
    product_inputs: 10,
    response_quality: "basic",
    crawler_links: 1,
    cta_type: "simple",
    cta_limit: 5,
    sales_advisor_limit: 10,
    conversation_memory: "short",
    ai_learning_depth: "surface",
    suggested_questions: true,
    ticket_system: true,
    product_sync: false,
    api_access: false,
    order_tracking: false,
    customer_return_detection: false,
    stores_limit: 1,
    store_products_limit: 10,
  },
}

export type PlanType = keyof typeof PLAN_LIMITS

export interface UserSubscriptionStatus {
  userId: number
  planName: string
  planNameEn: PlanType | "expired" | "none"
  isDemo: boolean
  isActive: boolean
  isExpired: boolean
  daysRemaining: number
  expiryDate: string | null
  limits: (typeof PLAN_LIMITS)[PlanType]
  usage: {
    ai_tokens: { used: number; limit: number; percentage: number; remaining: number }
    products: { used: number; limit: number; percentage: number; remaining: number }
    sales_advisor: { used: number; limit: number; percentage: number; remaining: number }
    cta_links: { used: number; limit: number; percentage: number; remaining: number }
    tickets: { used: number; limit: number; percentage: number; remaining: number }
    messages: { used: number; limit: number; percentage: number; remaining: number }
    stores: { used: number; limit: number; percentage: number; remaining: number }
    store_products: { used: number; limit: number; percentage: number; remaining: number }
  }
  shouldFreeze: boolean
  freezeReason: string | null
}

// Helper function to normalize phone numbers
function normalizePhone(phone: string): string {
  if (!phone) return ""
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("98") && digits.length === 12) {
    return "0" + digits.slice(2)
  } else if (digits.startsWith("0") && digits.length === 11) {
    return digits
  } else if (digits.length === 10 && !digits.startsWith("0")) {
    return "0" + digits
  }
  return digits
}

export async function checkTalkSellStatus(
  phone: string,
  email?: string,
): Promise<{
  success: boolean
  subscription_type: PlanType | "expired" | null
  has_subscription: boolean
  has_demo: boolean
  days_remaining: number
  expiry_date: string | null
  raw_response?: any
}> {
  try {
    let normalizedPhone = phone.replace(/\D/g, "")
    // Handle both 989039955352 and 09039955352 formats
    if (normalizedPhone.startsWith("98") && normalizedPhone.length === 12) {
      normalizedPhone = "0" + normalizedPhone.slice(2) // 989039955352 → 09039955352
    } else if (normalizedPhone.length === 10 && !normalizedPhone.startsWith("0")) {
      normalizedPhone = "0" + normalizedPhone // 9039955352 → 09039955352
    }

    const emailToUse = email || `${normalizedPhone}@talksell.ir`

    console.log("[SubscriptionSystem] ===== CHECKING TALKSELL STATUS =====")
    console.log("[SubscriptionSystem] Original phone:", phone)
    console.log("[SubscriptionSystem] Normalized phone:", normalizedPhone)
    console.log("[SubscriptionSystem] Email:", emailToUse)

    const subsResponse = await fetch(`${TALKSELL_API_BASE}/sub`, {
      headers: {
        "X-API-Key": TALKSELL_API_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (subsResponse.ok) {
      const subsData = await subsResponse.json()
      console.log("[SubscriptionSystem] Subscriber API response:", {
        success: subsData.success,
        count: subsData.count,
        hasData: !!subsData.data,
      })

      if (subsData.success && subsData.data && Array.isArray(subsData.data)) {
        const userSub = subsData.data.find((sub: any) => {
          const subPhone = (sub.phone || "").replace(/\D/g, "")
          const subPhoneNormalized =
            subPhone.startsWith("98") && subPhone.length === 12 ? "0" + subPhone.slice(2) : subPhone

          const match =
            subPhoneNormalized === normalizedPhone ||
            subPhone === normalizedPhone ||
            subPhone === phone.replace(/\D/g, "")

          if (match) {
            console.log("[SubscriptionSystem] FOUND MATCH:", {
              subPhone,
              subPhoneNormalized,
              normalizedPhone,
              product_id: sub.product_id,
              subscription_type: sub.subscription_type,
              status: sub.status,
            })
          }
          return match
        })

        if (userSub) {
          console.log("[SubscriptionSystem] Found user subscription:", {
            product_id: userSub.product_id,
            subscription_type: userSub.subscription_type,
            status: userSub.status,
            days_remaining: userSub.days_remaining,
          })

          let planType: PlanType = "start"

          // Product ID 24116 = Scale
          if (userSub.product_id === 24116 || userSub.product_id === "24116") {
            planType = "scale"
            console.log("[SubscriptionSystem] ✅ DETECTED SCALE PLAN (product_id: 24116)")
          }
          // Product ID 23900 = Grow
          else if (userSub.product_id === 23900 || userSub.product_id === "23900") {
            planType = "grow"
            console.log("[SubscriptionSystem] ✅ DETECTED GROW PLAN (product_id: 23900)")
          }
          // Product ID 23902 = Start
          else if (userSub.product_id === 23902 || userSub.product_id === "23902") {
            planType = "start"
            console.log("[SubscriptionSystem] ✅ DETECTED START PLAN (product_id: 23902)")
          }
          // Fallback: check subscription_type string
          else {
            const subType = (userSub.subscription_type || "").toLowerCase().trim()
            if (subType.includes("scale") || subType === "مقیاس") {
              planType = "scale"
              console.log("[SubscriptionSystem] ✅ DETECTED SCALE PLAN (from subscription_type)")
            } else if (subType.includes("grow") || subType === "رشد") {
              planType = "grow"
              console.log("[SubscriptionSystem] ✅ DETECTED GROW PLAN (from subscription_type)")
            } else {
              planType = "start"
              console.log("[SubscriptionSystem] ⚠️ DEFAULT TO START PLAN")
            }
          }

          console.log("[SubscriptionSystem] FINAL PLAN TYPE:", planType)

          // Only return if subscription is active
          if (userSub.status === "active" || userSub.is_expired === false) {
            return {
              success: true,
              subscription_type: planType,
              has_subscription: true,
              has_demo: false,
              days_remaining: userSub.days_remaining || 30,
              expiry_date: userSub.subscription_end || null,
              raw_response: userSub,
            }
          } else {
            console.log("[SubscriptionSystem] Subscription found but EXPIRED")
            return {
              success: true,
              subscription_type: "expired",
              has_subscription: false,
              has_demo: false,
              days_remaining: 0,
              expiry_date: userSub.subscription_end || null,
              raw_response: userSub,
            }
          }
        }
      }
    }

    console.log("[SubscriptionSystem] Trying status endpoint...")
    const statusResponse = await fetch(`${TALKSELL_API_BASE}/status?email=${encodeURIComponent(emailToUse)}`, {
      headers: {
        "X-API-Key": TALKSELL_API_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!statusResponse.ok) {
      console.error("[SubscriptionSystem] Status API error:", statusResponse.status)
      return {
        success: false,
        subscription_type: null,
        has_subscription: false,
        has_demo: false,
        days_remaining: 0,
        expiry_date: null,
      }
    }

    const data = await statusResponse.json()
    console.log("[SubscriptionSystem] Status API response:", JSON.stringify(data))

    let subscriptionType: PlanType | "expired" | null = null

    if (data.has_active_subscription) {
      const wpType = (data.subscription_type || data.access_level || "").toLowerCase().trim()
      console.log("[SubscriptionSystem] Parsed subscription type from status:", wpType)

      if (wpType.includes("scale") || wpType === "scale" || wpType === "مقیاس") {
        subscriptionType = "scale"
      } else if (wpType.includes("grow") || wpType === "grow" || wpType === "رشد") {
        subscriptionType = "grow"
      } else if (wpType.includes("start") || wpType === "start" || wpType === "استارت") {
        subscriptionType = "start"
      } else {
        subscriptionType = "start"
      }
    } else if (data.has_active_demo) {
      subscriptionType = "demo"
    } else {
      subscriptionType = "expired"
    }

    console.log("[SubscriptionSystem] ===== FINAL RESULT:", subscriptionType, "=====")

    return {
      success: true,
      subscription_type: subscriptionType,
      has_subscription: data.has_active_subscription || false,
      has_demo: data.has_active_demo || false,
      days_remaining: data.days_remaining || 0,
      expiry_date: data.expiry_date || null,
      raw_response: data,
    }
  } catch (error) {
    console.error("[SubscriptionSystem] Error checking TalkSell status:", error)
    return {
      success: false,
      subscription_type: null,
      has_subscription: false,
      has_demo: false,
      days_remaining: 0,
      expiry_date: null,
    }
  }
}

// Initialize or get user usage tracking record
async function ensureUserUsageTracking(userId: number, planType: PlanType = "demo"): Promise<any> {
  const sql = getSql()
  const limits = PLAN_LIMITS[planType]

  try {
    // Try to get existing record
    const existing = await sql`
      SELECT * FROM user_usage_tracking WHERE user_id = ${userId}
    `

    if (existing && existing.length > 0) {
      return existing[0]
    }

    // Create new record
    const newRecord = await sql`
      INSERT INTO user_usage_tracking (
        user_id, subscription_type, is_demo,
        ai_tokens_used, ai_tokens_limit,
        products_used, products_limit,
        sales_advisor_used, sales_advisor_limit,
        cta_links_used, cta_links_limit,
        tickets_used, tickets_limit,
        messages_used, messages_limit,
        demo_days_remaining,
        created_at, updated_at
      ) VALUES (
        ${userId}, ${planType}, ${planType === "demo"},
        0, ${limits.ai_tokens},
        0, ${limits.product_inputs},
        0, ${limits.sales_advisor_limit},
        0, ${limits.cta_limit === -1 ? 999999 : limits.cta_limit},
        0, 50,
        0, ${Math.floor(limits.ai_tokens / 500)},
        7,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    return newRecord[0]
  } catch (error) {
    console.error("[SubscriptionSystem] Error ensuring user usage tracking:", error)
    // Return default values if database operation fails
    return {
      user_id: userId,
      subscription_type: planType,
      is_demo: planType === "demo",
      ai_tokens_used: 0,
      ai_tokens_limit: limits.ai_tokens,
      products_used: 0,
      products_limit: limits.product_inputs,
      sales_advisor_used: 0,
      sales_advisor_limit: limits.sales_advisor_limit,
      cta_links_used: 0,
      cta_links_limit: limits.cta_limit === -1 ? 999999 : limits.cta_limit,
      tickets_used: 0,
      tickets_limit: 50,
      messages_used: 0,
      messages_limit: Math.floor(limits.ai_tokens / 500),
      demo_days_remaining: 7,
    }
  }
}

// Get full user subscription status with real usage tracking
export async function getUserSubscriptionStatus(userId: number): Promise<UserSubscriptionStatus | null> {
  try {
    const sql = getSql()

    // Get user info - only select columns that exist in the users table
    const userResult = await sql`
      SELECT id, phone, subscription_status, trial_end_date, is_trial_active
      FROM users WHERE id = ${userId}
    `

    if (!userResult || userResult.length === 0) {
      console.error("[SubscriptionSystem] User not found:", userId)
      return null
    }

    const user = userResult[0]

    const isSystemAdmin = user.phone === "0000000000"

    if (isSystemAdmin) {
      console.log("[SubscriptionSystem] ⭐ SYSTEM ADMIN DETECTED - bypassing all subscription checks")
      return {
        userId,
        planName: "مدیر سیستم",
        planNameEn: "scale",
        isDemo: false,
        isActive: true,
        isExpired: false,
        daysRemaining: 999999,
        expiryDate: null,
        limits: {
          ...PLAN_LIMITS.scale,
          ai_tokens: 999999999,
          product_inputs: 999999,
          sales_advisor_limit: 999999,
          cta_limit: -1,
        },
        usage: {
          ai_tokens: { used: 0, limit: 999999999, percentage: 0, remaining: 999999999 },
          messages: { used: 0, limit: 999999, percentage: 0, remaining: 999999 },
          products: { used: 0, limit: 999999, percentage: 0, remaining: 999999 },
          sales_advisor: { used: 0, limit: 999999, percentage: 0, remaining: 999999 },
          cta_links: { used: 0, limit: 999999, percentage: 0, remaining: 999999 },
          tickets: { used: 0, limit: 999999, percentage: 0, remaining: 999999 },
          stores: { used: 0, limit: 999999, percentage: 0, remaining: 999999 },
          store_products: { used: 0, limit: 999999, percentage: 0, remaining: 999999 },
        },
        shouldFreeze: false,
        freezeReason: null,
      }
    }

    // Sync with TalkSell first to get the latest subscription status
    let talkSellStatus = null
    if (user.phone) {
      talkSellStatus = await checkTalkSellStatus(user.phone)
      console.log("[SubscriptionSystem] TalkSell sync result:", talkSellStatus)
    }

    // Determine the plan type
    let planType: PlanType = "demo"
    let isDemo = true
    let daysRemaining = 7
    let expiryDate: string | null = null

    if (talkSellStatus?.success && talkSellStatus.subscription_type) {
      if (talkSellStatus.subscription_type === "expired") {
        planType = "demo"
        isDemo = false
      } else {
        planType = talkSellStatus.subscription_type as PlanType
        isDemo = planType === "demo"
      }
      daysRemaining = talkSellStatus.days_remaining
      expiryDate = talkSellStatus.expiry_date
    }

    // Get or create usage tracking
    const usage = await ensureUserUsageTracking(userId, planType)
    const limits = PLAN_LIMITS[planType]

    // Update usage tracking with correct plan limits if they changed
    try {
      await sql`
        UPDATE user_usage_tracking SET
          subscription_type = ${planType},
          is_demo = ${isDemo},
          ai_tokens_limit = ${limits.ai_tokens},
          products_limit = ${limits.product_inputs},
          sales_advisor_limit = ${limits.sales_advisor_limit},
          cta_links_limit = ${limits.cta_limit === -1 ? 999999 : limits.cta_limit},
          messages_limit = ${Math.floor(limits.ai_tokens / 500)},
          demo_days_remaining = ${isDemo ? daysRemaining : null},
          subscription_end = ${expiryDate},
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `
    } catch (updateError) {
      console.error("[SubscriptionSystem] Error updating usage tracking:", updateError)
    }

    // Get real product count from database
    let productsUsed = 0
    try {
      const productCount = await sql`
        SELECT COUNT(*) as count FROM chatbot_products cp
        JOIN chatbots c ON cp.chatbot_id = c.id
        WHERE c.user_id = ${userId}
      `
      productsUsed = Number(productCount[0]?.count || 0)
    } catch (e) {
      console.error("[SubscriptionSystem] Error getting product count:", e)
    }

    // Get real ticket count from database (this month)
    let ticketsUsed = 0
    try {
      const ticketCount = await sql`
        SELECT COUNT(*) as count FROM tickets t
        JOIN chatbots c ON t.chatbot_id = c.id
        WHERE c.user_id = ${userId}
          AND t.created_at >= date_trunc('month', CURRENT_DATE)
      `
      ticketsUsed = Number(ticketCount[0]?.count || 0)
    } catch (e) {
      console.error("[SubscriptionSystem] Error getting ticket count:", e)
    }

    // Get real store count and store-product count from database
    let storesUsed = 0
    let storeProductsUsed = 0
    try {
      const storeCount = await sql`SELECT COUNT(*) as count FROM stores WHERE user_id = ${userId}`
      storesUsed = Number(storeCount[0]?.count || 0)

      const storeProductCount = await sql`
        SELECT COUNT(*) as count FROM products p
        JOIN stores s ON p.store_id = s.id
        WHERE s.user_id = ${userId}
      `
      storeProductsUsed = Number(storeProductCount[0]?.count || 0)
    } catch (e) {
      console.error("[SubscriptionSystem] Error getting store/store-product count:", e)
    }

    // Calculate usage with real data
    const aiTokensUsed = usage.ai_tokens_used || 0
    const aiTokensLimit = limits.ai_tokens
    const messagesUsed = usage.messages_used || 0
    const messagesLimit = Math.floor(limits.ai_tokens / 500)
    const productsLimit = limits.product_inputs
    const salesAdvisorUsed = usage.sales_advisor_used || 0
    const salesAdvisorLimit = limits.sales_advisor_limit
    const ctaLinksUsed = usage.cta_links_used || 0
    const ctaLinksLimit = limits.cta_limit === -1 ? 999999 : limits.cta_limit
    const ticketsLimit = 50

    const usageData = {
      ai_tokens: {
        used: aiTokensUsed,
        limit: aiTokensLimit,
        percentage: aiTokensLimit > 0 ? Math.min(100, (aiTokensUsed / aiTokensLimit) * 100) : 0,
        remaining: Math.max(0, aiTokensLimit - aiTokensUsed),
      },
      messages: {
        used: messagesUsed,
        limit: messagesLimit,
        percentage: messagesLimit > 0 ? Math.min(100, (messagesUsed / messagesLimit) * 100) : 0,
        remaining: Math.max(0, messagesLimit - messagesUsed),
      },
      products: {
        used: productsUsed,
        limit: productsLimit,
        percentage: productsLimit > 0 ? Math.min(100, (productsUsed / productsLimit) * 100) : 0,
        remaining: Math.max(0, productsLimit - productsUsed),
      },
      sales_advisor: {
        used: salesAdvisorUsed,
        limit: salesAdvisorLimit,
        percentage: salesAdvisorLimit > 0 ? Math.min(100, (salesAdvisorUsed / salesAdvisorLimit) * 100) : 0,
        remaining: Math.max(0, salesAdvisorLimit - salesAdvisorUsed),
      },
      cta_links: {
        used: ctaLinksUsed,
        limit: ctaLinksLimit,
        percentage: ctaLinksLimit > 0 ? Math.min(100, (ctaLinksUsed / ctaLinksLimit) * 100) : 0,
        remaining: Math.max(0, ctaLinksLimit - ctaLinksUsed),
      },
      tickets: {
        used: ticketsUsed,
        limit: ticketsLimit,
        percentage: ticketsLimit > 0 ? Math.min(100, (ticketsUsed / ticketsLimit) * 100) : 0,
        remaining: Math.max(0, ticketsLimit - ticketsUsed),
      },
      stores: {
        used: storesUsed,
        limit: limits.stores_limit,
        percentage: limits.stores_limit > 0 ? Math.min(100, (storesUsed / limits.stores_limit) * 100) : 0,
        remaining: Math.max(0, limits.stores_limit - storesUsed),
      },
      store_products: {
        used: storeProductsUsed,
        limit: limits.store_products_limit,
        percentage:
          limits.store_products_limit > 0 ? Math.min(100, (storeProductsUsed / limits.store_products_limit) * 100) : 0,
        remaining: Math.max(0, limits.store_products_limit - storeProductsUsed),
      },
    }

    // Check if subscription is expired
    const now = new Date()
    const expiry = expiryDate ? new Date(expiryDate) : null
    const isExpired = talkSellStatus?.subscription_type === "expired" || (expiry ? now > expiry : false)

    // Determine if chatbot should freeze
    let shouldFreeze = false
    let freezeReason: string | null = null

    if (isExpired && !isDemo) {
      shouldFreeze = true
      freezeReason = "اشتراک شما منقضی شده است. برای ادامه استفاده، پلن خود را ارتقا دهید."
    } else if (usageData.ai_tokens.percentage >= 100) {
      shouldFreeze = true
      freezeReason = "توکن‌های هوش مصنوعی شما تمام شده است. برای ادامه استفاده، پلن خود را ارتقا دهید."
    } else if (isDemo && daysRemaining <= 0) {
      shouldFreeze = true
      freezeReason = "دوره آزمایشی شما به پایان رسیده است. برای ادامه استفاده، اشتراک تهیه کنید."
    }

    return {
      userId,
      planName: limits.nameFa,
      planNameEn: isExpired ? "expired" : planType,
      isDemo,
      isActive: !isExpired && !shouldFreeze,
      isExpired,
      daysRemaining,
      expiryDate,
      limits,
      usage: usageData,
      shouldFreeze,
      freezeReason,
    }
  } catch (error) {
    console.error("[SubscriptionSystem] Error getting user subscription status:", error)
    return null
  }
}

// Increment AI token usage (called after each AI response)
export async function incrementTokenUsage(userId: number, tokensUsed: number): Promise<boolean> {
  try {
    const sql = getSql()
    console.log("[SubscriptionSystem] Incrementing token usage for user", userId, "by", tokensUsed)

    // Ensure user has a tracking record first
    await ensureUserUsageTracking(userId)

    await sql`
      UPDATE user_usage_tracking
      SET 
        ai_tokens_used = COALESCE(ai_tokens_used, 0) + ${tokensUsed},
        messages_used = COALESCE(messages_used, 0) + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `

    return true
  } catch (error) {
    console.error("[SubscriptionSystem] Error incrementing token usage:", error)
    return false
  }
}

// Increment CTA usage (called when user clicks a CTA)
export async function incrementCTAUsage(userId: number): Promise<boolean> {
  try {
    const sql = getSql()
    console.log("[SubscriptionSystem] Incrementing CTA usage for user", userId)

    // Ensure user has a tracking record first
    await ensureUserUsageTracking(userId)

    await sql`
      UPDATE user_usage_tracking
      SET 
        cta_links_used = COALESCE(cta_links_used, 0) + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `

    return true
  } catch (error) {
    console.error("[SubscriptionSystem] Error incrementing CTA usage:", error)
    return false
  }
}

// Increment sales advisor usage
export async function incrementSalesAdvisorUsage(userId: number): Promise<boolean> {
  try {
    const sql = getSql()
    console.log("[SubscriptionSystem] Incrementing sales advisor usage for user", userId)

    // Ensure user has a tracking record first
    await ensureUserUsageTracking(userId)

    await sql`
      UPDATE user_usage_tracking
      SET 
        sales_advisor_used = COALESCE(sales_advisor_used, 0) + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `

    return true
  } catch (error) {
    console.error("[SubscriptionSystem] Error incrementing sales advisor usage:", error)
    return false
  }
}

// Check if user can perform action
export async function checkUserLimit(
  userId: number,
  limitType: "ai_tokens" | "products" | "sales_advisor" | "cta_links" | "tickets" | "messages" | "stores" | "store_products",
): Promise<{ allowed: boolean; current: number; max: number; message?: string }> {
  try {
    const status = await getUserSubscriptionStatus(userId)
    if (!status) {
      return { allowed: false, current: 0, max: 0, message: "وضعیت اشتراک یافت نشد" }
    }

    if (status.shouldFreeze) {
      return { allowed: false, current: 0, max: 0, message: status.freezeReason || "اشتراک محدود شده" }
    }

    const usage = status.usage[limitType]
    if (usage.limit === -1 || usage.limit === 999999) {
      return { allowed: true, current: usage.used, max: -1 }
    }

    if (usage.used >= usage.limit) {
      return {
        allowed: false,
        current: usage.used,
        max: usage.limit,
        message: `شما به حداکثر استفاده از این ویژگی رسیده‌اید. برای ادامه، پلن خود را ارتقا دهید.`,
      }
    }

    return { allowed: true, current: usage.used, max: usage.limit }
  } catch (error) {
    console.error("[SubscriptionSystem] Error checking user limit:", error)
    return { allowed: true, current: 0, max: 0 }
  }
}

// Estimate tokens from text (rough estimate: 1 token ≈ 3 characters for Persian)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3)
}

// Sync user subscription from TalkSell (force refresh)
export async function syncUserSubscription(userId: number, phone: string, email?: string): Promise<boolean> {
  try {
    const sql = getSql()
    const talkSellStatus = await checkTalkSellStatus(phone, email)

    if (!talkSellStatus.success) {
      console.log("[SubscriptionSystem] Failed to sync with TalkSell for user:", userId)
      return false
    }

    // Determine plan type
    let planType: PlanType = "demo"
    if (talkSellStatus.subscription_type && talkSellStatus.subscription_type !== "expired") {
      planType = talkSellStatus.subscription_type as PlanType
    }

    const limits = PLAN_LIMITS[planType]
    const isDemo = planType === "demo"

    // Ensure tracking record exists first
    await ensureUserUsageTracking(userId, planType)

    // Update usage tracking with new limits
    await sql`
      UPDATE user_usage_tracking SET
        subscription_type = ${planType},
        is_demo = ${isDemo},
        ai_tokens_limit = ${limits.ai_tokens},
        products_limit = ${limits.product_inputs},
        sales_advisor_limit = ${limits.sales_advisor_limit},
        cta_links_limit = ${limits.cta_limit === -1 ? 999999 : limits.cta_limit},
        tickets_limit = 50,
        messages_limit = ${Math.floor(limits.ai_tokens / 500)},
        demo_days_remaining = ${isDemo ? talkSellStatus.days_remaining : null},
        subscription_end = ${talkSellStatus.expiry_date},
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `

    // Update user table
    await sql`
      UPDATE users SET
        subscription_status = ${talkSellStatus.has_subscription ? "active" : isDemo ? "trial" : "expired"}
      WHERE id = ${userId}
    `

    console.log("[SubscriptionSystem] Successfully synced subscription for user:", userId, "Plan:", planType)
    return true
  } catch (error) {
    console.error("[SubscriptionSystem] Error syncing user subscription:", error)
    return false
  }
}
