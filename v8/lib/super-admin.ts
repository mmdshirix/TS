"use server"

import { cookies } from "next/headers"
import { getSharedSql } from "@/lib/postgres"
import { redirect } from "next/navigation"

function getSql() {
  return getSharedSql()
}

const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD

// Create super admin session
export async function superAdminLogin(password: string): Promise<{ success: boolean; error?: string }> {
  if (!SUPER_ADMIN_PASSWORD || password !== SUPER_ADMIN_PASSWORD) {
    return { success: false, error: "رمز عبور اشتباه است" }
  }

  const cookieStore = await cookies()
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36)

  cookieStore.set("super_admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })

  return { success: true }
}

// Check if super admin is authenticated
export async function isSuperAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get("super_admin_token")?.value
  return !!token
}

export async function verifySuperAdmin(): Promise<boolean> {
  return await isSuperAdmin()
}

// Require super admin authentication
export async function requireSuperAdmin() {
  const isAdmin = await isSuperAdmin()
  if (!isAdmin) {
    redirect("/super-admin/login")
  }
}

// Logout super admin
export async function superAdminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("super_admin_token")
}

// Get all users with their chatbot stats
export async function getAllUsersWithStats() {
  const sql = getSql()
  const users = await sql`
    SELECT 
      u.id,
      u.phone,
      u.first_name,
      u.last_name,
      u.created_at,
      u.last_login,
      u.trial_start_date,
      u.trial_end_date,
      u.is_trial_active,
      u.subscription_status,
      u.tokens,
      u.is_admin,
      COUNT(DISTINCT c.id) as chatbot_count,
      COUNT(DISTINCT cm.id) as message_count,
      COUNT(DISTINCT t.id) as ticket_count
    FROM users u
    LEFT JOIN chatbots c ON c.user_id = u.id
    LEFT JOIN chatbot_messages cm ON cm.chatbot_id = c.id
    LEFT JOIN tickets t ON t.chatbot_id = c.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `
  return users
}

// Toggle user active status
export async function toggleUserStatus(userId: number, isActive: boolean) {
  const sql = getSql()
  await sql`
    UPDATE users 
    SET is_trial_active = ${isActive}
    WHERE id = ${userId}
  `
}

// Delete user and all their data
export async function deleteUser(userId: number) {
  const sql = getSql()
  // Get all chatbot IDs for this user
  const chatbots = await sql`SELECT id FROM chatbots WHERE user_id = ${userId}`
  const chatbotIds = chatbots.map((c: any) => c.id)

  // Delete all related data
  if (chatbotIds.length > 0) {
    for (const chatbotId of chatbotIds) {
      await sql`DELETE FROM chatbot_messages WHERE chatbot_id = ${chatbotId}`
      await sql`DELETE FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`
      await sql`DELETE FROM chatbot_products WHERE chatbot_id = ${chatbotId}`
      await sql`DELETE FROM chatbot_knowledge_base WHERE chatbot_id = ${chatbotId}`
      await sql`DELETE FROM tickets WHERE chatbot_id = ${chatbotId}`
      await sql`DELETE FROM suggested_products WHERE chatbot_id = ${chatbotId}`
    }
    await sql`DELETE FROM chatbots WHERE user_id = ${userId}`
  }

  await sql`DELETE FROM user_sessions WHERE user_id = ${userId}`
  await sql`DELETE FROM users WHERE id = ${userId}`
}

// Update user information
export async function updateUser(
  userId: number,
  data: {
    first_name?: string
    last_name?: string
    phone?: string
    subscription_status?: string
    trial_end_date?: string
  },
) {
  const sql = getSql()
  const updates: string[] = []
  const values: any[] = []

  if (data.first_name) {
    updates.push(`first_name = $${updates.length + 1}`)
    values.push(data.first_name)
  }
  if (data.last_name) {
    updates.push(`last_name = $${updates.length + 1}`)
    values.push(data.last_name)
  }
  if (data.phone) {
    updates.push(`phone = $${updates.length + 1}`)
    values.push(data.phone)
  }
  if (data.subscription_status) {
    updates.push(`subscription_status = $${updates.length + 1}`)
    values.push(data.subscription_status)
  }
  if (data.trial_end_date) {
    updates.push(`trial_end_date = $${updates.length + 1}`)
    values.push(data.trial_end_date)
  }

  if (updates.length > 0) {
    await sql`
      UPDATE users 
      SET ${sql.unsafe(updates.join(", "))}
      WHERE id = ${userId}
    `
  }
}

// Create impersonation session
export async function createImpersonationSession(userId: number): Promise<string> {
  const sql = getSql()
  const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await sql`
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
  `

  return sessionToken
}

export async function toggleChatbotStatus(chatbotId: number, isActive: boolean) {
  const sql = getSql()
  await sql`
    UPDATE chatbots 
    SET is_active = ${isActive}
    WHERE id = ${chatbotId}
  `
}

export async function deleteChatbot(chatbotId: number) {
  const sql = getSql()
  // Delete all related data
  await sql`DELETE FROM chatbot_messages WHERE chatbot_id = ${chatbotId}`
  await sql`DELETE FROM chatbot_products WHERE chatbot_id = ${chatbotId}`
  await sql`DELETE FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`
  await sql`DELETE FROM chatbot_knowledge_base WHERE chatbot_id = ${chatbotId}`
  await sql`DELETE FROM tickets WHERE chatbot_id = ${chatbotId}`
  await sql`DELETE FROM suggested_products WHERE chatbot_id = ${chatbotId}`
  await sql`DELETE FROM chatbots WHERE id = ${chatbotId}`
}

// Get user's current subscription
export async function getUserSubscription(userId: number) {
  const sql = getSql()
  const [subscription] = await sql`
    SELECT 
      us.*,
      sp.name as plan_name,
      sp.price as plan_price,
      sp.message_limit,
      sp.product_limit,
      sp.duration_days
    FROM user_subscriptions us
    LEFT JOIN subscription_plans sp ON sp.id = us.plan_id
    WHERE us.user_id = ${userId} AND us.is_active = true
    ORDER BY us.created_at DESC
    LIMIT 1
  `
  return subscription
}
