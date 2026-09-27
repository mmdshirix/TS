import { getSql } from "@/lib/db"

export interface UserPlanLimits {
  messagesPerMonth: number
  productsTotal: number
  knowledgeBaseLinksTotal: number
  ticketsPerMonth: number
  chatbotsTotal: number
  currentMessageCount: number
  currentProductCount: number
  currentKnowledgeBaseCount: number
  currentTicketCount: number
  currentChatbotCount: number
}

export interface LimitCheckResult {
  allowed: boolean
  limitType?: string
  current?: number
  max?: number
  message?: string
}

// Get user's plan limits and current usage
export async function getUserPlanLimits(userId: number): Promise<UserPlanLimits | null> {
  try {
    const sql = getSql()

    // Get user's active subscription and plan limits
    const planResult = await sql`
      SELECT 
        sp.messages_per_month,
        sp.products_total,
        sp.knowledge_base_links_total,
        sp.tickets_per_month,
        sp.chatbots_total,
        COALESCE(us.message_count, 0) as current_message_count
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ${userId} 
        AND us.is_active = true 
        AND (us.expires_at IS NULL OR us.expires_at > NOW())
      ORDER BY us.created_at DESC
      LIMIT 1
    `

    // Get current product count
    const productCount = await sql`
      SELECT COUNT(*) as count FROM chatbot_products cp
      JOIN chatbots c ON cp.chatbot_id = c.id
      WHERE c.user_id = ${userId}
    `

    // Get current knowledge base count
    const knowledgeCount = await sql`
      SELECT COUNT(*) as count FROM chatbot_knowledge_base kb
      JOIN chatbots c ON kb.chatbot_id = c.id
      WHERE c.user_id = ${userId}
    `

    // Get current month's ticket count
    const ticketCount = await sql`
      SELECT COUNT(*) as count FROM tickets t
      JOIN chatbots c ON t.chatbot_id = c.id
      WHERE c.user_id = ${userId}
        AND t.created_at >= date_trunc('month', CURRENT_DATE)
    `

    // Get current chatbot count
    const chatbotCount = await sql`
      SELECT COUNT(*) as count FROM chatbots
      WHERE user_id = ${userId}
    `

    if (planResult.length === 0) {
      // Return default free limits if no subscription
      return {
        messagesPerMonth: 50,
        productsTotal: 5,
        knowledgeBaseLinksTotal: 3,
        ticketsPerMonth: 5,
        chatbotsTotal: 1,
        currentMessageCount: 0,
        currentProductCount: Number(productCount[0]?.count || 0),
        currentKnowledgeBaseCount: Number(knowledgeCount[0]?.count || 0),
        currentTicketCount: Number(ticketCount[0]?.count || 0),
        currentChatbotCount: Number(chatbotCount[0]?.count || 0),
      }
    }

    const plan = planResult[0]
    return {
      messagesPerMonth: plan.messages_per_month || 1000,
      productsTotal: plan.products_total || 50,
      knowledgeBaseLinksTotal: plan.knowledge_base_links_total || 10,
      ticketsPerMonth: plan.tickets_per_month || 20,
      chatbotsTotal: plan.chatbots_total || 3,
      currentMessageCount: Number(plan.current_message_count || 0),
      currentProductCount: Number(productCount[0]?.count || 0),
      currentKnowledgeBaseCount: Number(knowledgeCount[0]?.count || 0),
      currentTicketCount: Number(ticketCount[0]?.count || 0),
      currentChatbotCount: Number(chatbotCount[0]?.count || 0),
    }
  } catch (error) {
    console.error("Error getting user plan limits:", error)
    return null
  }
}

// Check if user can send a message
export async function checkMessageLimit(userId: number): Promise<LimitCheckResult> {
  const limits = await getUserPlanLimits(userId)
  if (!limits) {
    return { allowed: true } // Allow if can't check
  }

  if (limits.currentMessageCount >= limits.messagesPerMonth) {
    return {
      allowed: false,
      limitType: "messages",
      current: limits.currentMessageCount,
      max: limits.messagesPerMonth,
      message: `شما به حداکثر تعداد پیام ماهانه (${limits.messagesPerMonth}) رسیده‌اید. لطفاً پلن خود را ارتقا دهید.`,
    }
  }

  return { allowed: true, current: limits.currentMessageCount, max: limits.messagesPerMonth }
}

// Check if user can add a product
export async function checkProductLimit(userId: number): Promise<LimitCheckResult> {
  const limits = await getUserPlanLimits(userId)
  if (!limits) {
    return { allowed: true }
  }

  if (limits.currentProductCount >= limits.productsTotal) {
    return {
      allowed: false,
      limitType: "products",
      current: limits.currentProductCount,
      max: limits.productsTotal,
      message: `شما به حداکثر تعداد محصولات (${limits.productsTotal}) رسیده‌اید. لطفاً پلن خود را ارتقا دهید.`,
    }
  }

  return { allowed: true, current: limits.currentProductCount, max: limits.productsTotal }
}

// Check if user can add knowledge base
export async function checkKnowledgeBaseLimit(userId: number): Promise<LimitCheckResult> {
  const limits = await getUserPlanLimits(userId)
  if (!limits) {
    return { allowed: true }
  }

  if (limits.currentKnowledgeBaseCount >= limits.knowledgeBaseLinksTotal) {
    return {
      allowed: false,
      limitType: "knowledge_base",
      current: limits.currentKnowledgeBaseCount,
      max: limits.knowledgeBaseLinksTotal,
      message: `شما به حداکثر تعداد لینک‌های پایگاه دانش (${limits.knowledgeBaseLinksTotal}) رسیده‌اید. لطفاً پلن خود را ارتقا دهید.`,
    }
  }

  return { allowed: true, current: limits.currentKnowledgeBaseCount, max: limits.knowledgeBaseLinksTotal }
}

// Check if user can create a ticket
export async function checkTicketLimit(chatbotId: number): Promise<LimitCheckResult> {
  try {
    const sql = getSql()

    // Get the chatbot's owner
    const chatbotResult = await sql`
      SELECT user_id FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbotResult.length === 0) {
      return { allowed: true }
    }

    const userId = chatbotResult[0].user_id
    const limits = await getUserPlanLimits(userId)

    if (!limits) {
      return { allowed: true }
    }

    if (limits.currentTicketCount >= limits.ticketsPerMonth) {
      return {
        allowed: false,
        limitType: "tickets",
        current: limits.currentTicketCount,
        max: limits.ticketsPerMonth,
        message: `این چت‌بات به حداکثر تعداد تیکت ماهانه رسیده است.`,
      }
    }

    return { allowed: true, current: limits.currentTicketCount, max: limits.ticketsPerMonth }
  } catch (error) {
    console.error("Error checking ticket limit:", error)
    return { allowed: true }
  }
}

// Check if user can create a chatbot
export async function checkChatbotLimit(userId: number): Promise<LimitCheckResult> {
  const limits = await getUserPlanLimits(userId)
  if (!limits) {
    return { allowed: true }
  }

  if (limits.currentChatbotCount >= limits.chatbotsTotal) {
    return {
      allowed: false,
      limitType: "chatbots",
      current: limits.currentChatbotCount,
      max: limits.chatbotsTotal,
      message: `شما به حداکثر تعداد چت‌بات‌ها (${limits.chatbotsTotal}) رسیده‌اید. لطفاً پلن خود را ارتقا دهید.`,
    }
  }

  return { allowed: true, current: limits.currentChatbotCount, max: limits.chatbotsTotal }
}

// Increment message count for user
export async function incrementMessageCount(userId: number): Promise<void> {
  try {
    const sql = getSql()
    await sql`
      UPDATE user_subscriptions
      SET message_count = COALESCE(message_count, 0) + 1
      WHERE user_id = ${userId} AND is_active = true
    `
  } catch (error) {
    console.error("Error incrementing message count:", error)
  }
}
