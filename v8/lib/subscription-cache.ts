// Subscription Status Cache
// Caches chatbot status to avoid API calls on every widget load

import { getSharedSql } from "@/lib/postgres"

interface CachedStatus {
  chatbotId: number
  userId: number
  isActive: boolean
  shouldFreeze: boolean
  freezeMessage: string | null
  isSystemAdmin: boolean
  planName: string
  cachedAt: number
}

// In-memory cache with 5-minute TTL
const statusCache = new Map<number, CachedStatus>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getCachedChatbotStatus(chatbotId: number): Promise<CachedStatus | null> {
  // Check memory cache first
  const cached = statusCache.get(chatbotId)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    console.log("[Cache] HIT - Using cached status for chatbot:", chatbotId)
    return cached
  }

  console.log("[Cache] MISS - Fetching fresh status for chatbot:", chatbotId)

  try {
    const sql = getSharedSql()

    // Simple query to get essential info - no complex joins or missing columns
    const result = await sql`
      SELECT 
        c.id as chatbot_id,
        c.user_id,
        c.is_active,
        u.phone,
        u.is_trial_active
      FROM chatbots c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ${chatbotId}
    `

    if (!result || result.length === 0) {
      console.log("[Cache] Chatbot not found:", chatbotId)
      return null
    }

    const data = result[0]
    const isSystemAdmin = data.phone === "0000000000"

    // System admin always active, never frozen
    if (isSystemAdmin) {
      const status: CachedStatus = {
        chatbotId,
        userId: data.user_id,
        isActive: true,
        shouldFreeze: false,
        freezeMessage: null,
        isSystemAdmin: true,
        planName: "مدیر سیستم",
        cachedAt: Date.now(),
      }
      statusCache.set(chatbotId, status)
      console.log("[Cache] System admin - always active")
      return status
    }

    // For regular users, check basic status
    let shouldFreeze = false
    let freezeMessage: string | null = null

    // Only freeze if chatbot is explicitly disabled OR user trial is explicitly false
    if (data.is_active === false) {
      shouldFreeze = true
      freezeMessage = "این چت‌بات در حال حاضر غیرفعال است."
    } else if (data.is_trial_active === false) {
      shouldFreeze = true
      freezeMessage = "حساب کاربری شما غیرفعال شده است. برای فعال‌سازی مجدد، به حساب تاک‌سل خود مراجعه کنید."
    }

    const status: CachedStatus = {
      chatbotId,
      userId: data.user_id,
      isActive: data.is_active !== false,
      shouldFreeze,
      freezeMessage,
      isSystemAdmin: false,
      planName: "کاربر",
      cachedAt: Date.now(),
    }

    statusCache.set(chatbotId, status)
    console.log("[Cache] Cached status for chatbot:", chatbotId, "shouldFreeze:", shouldFreeze)
    return status
  } catch (error) {
    console.error("[Cache] Error getting chatbot status:", error)
    // On error, return permissive status to not block users
    return {
      chatbotId,
      userId: 0,
      isActive: true,
      shouldFreeze: false,
      freezeMessage: null,
      isSystemAdmin: false,
      planName: "کاربر",
      cachedAt: Date.now(),
    }
  }
}

export function invalidateChatbotCache(chatbotId: number): void {
  statusCache.delete(chatbotId)
  console.log("[Cache] Invalidated cache for chatbot:", chatbotId)
}

export function invalidateUserChatbotsCache(userId: number): void {
  // Remove all entries for this user
  for (const [key, value] of statusCache.entries()) {
    if (value.userId === userId) {
      statusCache.delete(key)
    }
  }
  console.log("[Cache] Invalidated all chatbots for user:", userId)
}
