// TalkSell API Integration for subscription management
// API Base: https://talksell.ir/wp-json/talksell/

const TALKSELL_API_BASE = "https://talksell.ir/wp-json/talksell"
const TALKSELL_API_KEY = process.env.TALKSELL_API_KEY ?? ""

// Product IDs for subscriptions
export const SUBSCRIPTION_PRODUCTS = {
  mini: 23902,
  pro: 23900,
}

// Purchase URLs
export const PURCHASE_URLS = {
  mini: "https://talksell.ir/?add-to-cart=23902&quantity=1&e-redirect=https://talksell.ir/checkout/",
  pro: "https://talksell.ir/?add-to-cart=23900&quantity=1&e-redirect=https://talksell.ir/checkout/",
}

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-API-Key": TALKSELL_API_KEY,
})

export interface DemoUser {
  user_id: number
  email: string
  name: string
  phone: string
  demo_start: string
  demo_end: string
  days_remaining: number
  status: "active" | "expired"
}

export interface Subscriber {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string
  order_id: string
  subscription_type: "mini" | "pro"
  product_id: string
  order_status: string
  created_at: string
}

export interface UserStatus {
  success: boolean
  email?: string
  has_demo: boolean
  demo_status: "active" | "expired" | null
  demo_end: string | null
  days_remaining: number
  has_subscription: boolean
  subscription_type: "mini" | "pro" | null
  order_id?: string
  order_status?: string
}

export async function registerDemoUser(
  email: string,
  name: string,
  phone: string,
): Promise<{
  success: boolean
  message?: string
  data?: DemoUser
}> {
  try {
    console.log("[TalkSell] Registering demo user:", { email, name, phone })

    const response = await fetch(`${TALKSELL_API_BASE}/demo`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, name, phone }),
    })

    const result = await response.json()
    console.log("[TalkSell] Demo registration response:", result)
    return result
  } catch (error: any) {
    console.error("[TalkSell] Error registering demo user:", error)
    return {
      success: false,
      message: `خطا در ارتباط با سرور: ${error.message}`,
    }
  }
}

export async function checkUserStatus(emailOrPhone: string): Promise<UserStatus | null> {
  try {
    const response = await fetch(`${TALKSELL_API_BASE}/status?email=${encodeURIComponent(emailOrPhone)}`, {
      headers: getHeaders(),
    })
    const result = await response.json()
    return result
  } catch (error) {
    console.error("[TalkSell] Error checking user status:", error)
    return null
  }
}

export async function getSubscribers(type?: "mini" | "pro"): Promise<Subscriber[]> {
  try {
    let url = `${TALKSELL_API_BASE}/sub`
    if (type) {
      url += `?type=${type}`
    }

    const response = await fetch(url, { headers: getHeaders() })
    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error("[TalkSell] Error getting subscribers:", error)
    return []
  }
}

export async function getDemoUsers(status?: "active" | "expired"): Promise<DemoUser[]> {
  try {
    let url = `${TALKSELL_API_BASE}/demo`
    if (status) {
      url += `?status=${status}`
    }

    const response = await fetch(url, { headers: getHeaders() })
    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error("[TalkSell] Error getting demo users:", error)
    return []
  }
}

export async function getAllUsersGrouped(): Promise<{
  demo_users: any[]
  mini_subscribers: any[]
  pro_subscribers: any[]
} | null> {
  try {
    const response = await fetch(`${TALKSELL_API_BASE}/users`, { headers: getHeaders() })
    const result = await response.json()
    return result.success ? result.grouped_users : null
  } catch (error) {
    console.error("[TalkSell] Error getting all users:", error)
    return null
  }
}

export async function getStatistics(): Promise<{
  total_demo_users: number
  active_demos: number
  expired_demos: number
  total_subscribers: number
  mini_subscribers: number
  pro_subscribers: number
} | null> {
  try {
    const response = await fetch(`${TALKSELL_API_BASE}/stats`, { headers: getHeaders() })
    const result = await response.json()
    return result.success ? result.statistics : null
  } catch (error) {
    console.error("[TalkSell] Error getting statistics:", error)
    return null
  }
}

export async function getSubscriptionTypeByPhone(phone: string): Promise<"demo" | "mini" | "pro" | null> {
  try {
    // Normalize phone for comparison - keep only digits
    const normalizedPhone = phone.replace(/\D/g, "")
    const last10Digits = normalizedPhone.slice(-10)

    // Get subscribers and check
    const [miniSubs, proSubs] = await Promise.all([getSubscribers("mini"), getSubscribers("pro")])

    // Check pro subscribers first (highest priority)
    for (const user of proSubs) {
      const userPhone = user.phone?.replace(/\D/g, "") || ""
      const userLast10 = userPhone.slice(-10)
      if (userLast10 === last10Digits || userPhone.includes(normalizedPhone) || normalizedPhone.includes(userPhone)) {
        return "pro"
      }
    }

    // Check mini subscribers
    for (const user of miniSubs) {
      const userPhone = user.phone?.replace(/\D/g, "") || ""
      const userLast10 = userPhone.slice(-10)
      if (userLast10 === last10Digits || userPhone.includes(normalizedPhone) || normalizedPhone.includes(userPhone)) {
        return "mini"
      }
    }

    // Check demo users
    const demoUsers = await getDemoUsers("active")
    for (const user of demoUsers) {
      const userPhone = user.phone?.replace(/\D/g, "") || ""
      const userLast10 = userPhone.slice(-10)
      if (userLast10 === last10Digits || userPhone.includes(normalizedPhone) || normalizedPhone.includes(userPhone)) {
        return "demo"
      }
    }

    return null
  } catch (error) {
    console.error("[TalkSell] Error getting subscription type:", error)
    return null
  }
}

export async function getSubscriptionTypeByEmail(email: string): Promise<"demo" | "mini" | "pro" | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim()

    // Get subscribers and check
    const [miniSubs, proSubs] = await Promise.all([getSubscribers("mini"), getSubscribers("pro")])

    // Check pro subscribers first (highest priority)
    for (const user of proSubs) {
      if (user.email?.toLowerCase().trim() === normalizedEmail) {
        return "pro"
      }
    }

    // Check mini subscribers
    for (const user of miniSubs) {
      if (user.email?.toLowerCase().trim() === normalizedEmail) {
        return "mini"
      }
    }

    // Check demo users
    const demoUsers = await getDemoUsers("active")
    for (const user of demoUsers) {
      if (user.email?.toLowerCase().trim() === normalizedEmail) {
        return "demo"
      }
    }

    return null
  } catch (error) {
    console.error("[TalkSell] Error getting subscription type by email:", error)
    return null
  }
}
