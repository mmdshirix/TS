"use server"

import { cookies } from "next/headers"
import { getSharedSql } from "@/lib/postgres"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

// Function to get SQL client
function getSql() {
  return getSharedSql()
}

export interface User {
  id: number
  phone: string
  first_name: string
  last_name: string
  created_at: string
  trial_start_date?: string
  trial_end_date?: string
  is_trial_active?: boolean
  subscription_status?: string
  last_login?: string | null
  tokens?: number
  is_admin?: boolean
  password_hash?: string
}

export interface Session {
  id: number
  user_id: number
  session_token: string
  expires_at: string
  created_at: string
}

// Generate a random session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export async function validatePassword(password: string): Promise<{ valid: boolean; error?: string }> {
  if (!password || password.length < 6) {
    return { valid: false, error: "رمز عبور باید حداقل ۶ کاراکتر باشد" }
  }
  return { valid: true }
}

export async function createUser(phone: string, firstName: string, lastName: string, password: string): Promise<User> {
  try {
    const sql = getSql()
    console.log("[v0] Creating user with phone:", phone)

    // Validate password
    const validation = await validatePassword(password)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Normalize phone (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/\s|-/g, "")

    const result = await sql`
      INSERT INTO users (
        phone, 
        first_name, 
        last_name,
        password_hash,
        trial_start_date,
        trial_end_date,
        is_trial_active,
        subscription_status,
        tokens,
        is_admin
      )
      VALUES (
        ${normalizedPhone}, 
        ${firstName}, 
        ${lastName},
        ${passwordHash},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '7 days',
        TRUE,
        'trial',
        0,
        FALSE
      )
      RETURNING *
    `

    console.log("[v0] User created successfully:", result[0])
    return result[0] as unknown as User
  } catch (error: any) {
    console.error("[v0] Error creating user:", error)

    // Check for unique constraint violation
    if (error?.message?.includes("unique") || error?.code === "23505") {
      throw new Error("این شماره تلفن قبلاً ثبت شده است")
    }

    throw new Error(`خطا در ثبت‌نام کاربر: ${error?.message || error}`)
  }
}

// Get user by phone
export async function getUserByPhone(phone: string): Promise<User | null> {
  try {
    const sql = getSql()
    console.log("[v0] Getting user by phone:", phone)

    const normalizedPhone = phone.replace(/\s|-/g, "")
    const result = await sql`
      SELECT * FROM users WHERE phone = ${normalizedPhone}
    `

    console.log("[v0] User found:", result.length > 0)
    return result.length > 0 ? (result[0] as unknown as User) : null
  } catch (error) {
    console.error("[v0] Error getting user by phone:", error)
    return null
  }
}

// Create a session for a user
export async function createSession(userId: number): Promise<string> {
  try {
    const sql = getSql()
    console.log("[v0] Creating session for user:", userId)

    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const result = await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
      RETURNING *
    `

    if (!result || result.length === 0) {
      throw new Error("Failed to create session in database")
    }

    // Update last login
    await sql`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ${userId}
    `

    console.log("[v0] Session created successfully with token:", sessionToken)
    return sessionToken
  } catch (error: any) {
    console.error("[v0] Error creating session:", error)

    if (error?.message?.includes("user_sessions") || error?.message?.includes("does not exist")) {
      throw new Error("جداول احراز هویت ساخته نشده‌اند. لطفاً ابتدا اسکریپت پایگاه داده را اجرا کنید")
    }

    throw new Error(`خطا در ایجاد جلسه: ${error?.message || error}`)
  }
}

// Get session by token
export async function getSession(sessionToken: string): Promise<Session | null> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM user_sessions 
      WHERE session_token = ${sessionToken} 
      AND expires_at > CURRENT_TIMESTAMP
    `
    return result.length > 0 ? (result[0] as unknown as Session) : null
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Get current user from cookie
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return null
    }

    const session = await getSession(sessionToken)
    if (!session) {
      return null
    }

    const sql = getSql()
    const result = await sql`
      SELECT * FROM users WHERE id = ${session.user_id}
    `

    return result.length > 0 ? (result[0] as unknown as User) : null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Alias export for getUserFromSession (same as getCurrentUser)
export { getCurrentUser as getUserFromSession }

// Login or register
export async function loginOrRegister(
  phone: string,
  firstName: string,
  lastName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] Login/Register attempt for phone:", phone)

    // Check if user exists
    let user = await getUserByPhone(phone)

    // If user doesn't exist, create new user
    if (!user) {
      console.log("[v0] User not found, creating new user")
      try {
        user = await createUser(phone, firstName, lastName, "")
      } catch (createError: any) {
        console.error("[v0] Error creating user:", createError)
        return { success: false, error: createError.message || "خطا در ایجاد کاربر" }
      }
    } else {
      console.log("[v0] User found, logging in")
    }

    if (!user || !user.id) {
      return { success: false, error: "کاربر یافت نشد" }
    }

    // Create session
    let sessionToken: string
    try {
      sessionToken = await createSession(user.id)
    } catch (sessionError: any) {
      console.error("[v0] Error creating session:", sessionError)
      return { success: false, error: sessionError.message || "خطا در ایجاد جلسه" }
    }

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    console.log("[v0] Login/Register successful")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Login/Register error:", error)
    return { success: false, error: error.message || "خطا در ورود به سیستم" }
  }
}

// Logout
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (sessionToken) {
    try {
      const sql = getSql()
      await sql`DELETE FROM user_sessions WHERE session_token = ${sessionToken}`
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  cookieStore.delete("session_token")
}

// Check if trial is active
export async function isTrialActive(user: User): Promise<boolean> {
  const now = new Date()
  const trialEnd = new Date(user.trial_end_date ?? "")
  return user.is_trial_active ?? (false && now < trialEnd)
}

// Get days remaining in trial
export async function getTrialDaysRemaining(user: User): Promise<number> {
  const now = new Date()
  const trialEnd = new Date(user.trial_end_date ?? "")
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// Require authentication middleware
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function loginWithPassword(
  phone: string,
  password: string,
): Promise<{ success: boolean; error?: string; userId?: number }> {
  try {
    console.log("[v0] Login attempt for phone:", phone)

    // Get user by phone
    const user = await getUserByPhone(phone)

    if (!user) {
      return { success: false, error: "شماره تلفن یا رمز عبور اشتباه است" }
    }

    // Check if user has a password set
    if (!user.password_hash) {
      return { success: false, error: "این کاربر رمز عبور ندارد. لطفاً از طریق ثبت‌نام مجدد اقدام کنید" }
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash)

    if (!passwordValid) {
      return { success: false, error: "شماره تلفن یا رمز عبور اشتباه است" }
    }

    // Create session
    const sessionToken = await createSession(user.id)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    console.log("[v0] Login successful")
    return { success: true, userId: user.id }
  } catch (error: any) {
    console.error("[v0] Login error:", error)
    return { success: false, error: "خطا در ورود به سیستم" }
  }
}

export async function registerUser(
  phone: string,
  firstName: string,
  lastName: string,
  password: string,
): Promise<{ success: boolean; error?: string; userId?: number }> {
  try {
    console.log("[v0] Registration attempt for phone:", phone)

    // Check if user already exists
    const existingUser = await getUserByPhone(phone)
    if (existingUser) {
      return { success: false, error: "این شماره تلفن قبلاً ثبت شده است" }
    }

    // Create new user
    const user = await createUser(phone, firstName, lastName, password)

    if (!user || !user.id) {
      return { success: false, error: "خطا در ایجاد کاربر" }
    }

    // Create session
    const sessionToken = await createSession(user.id)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    console.log("[v0] Registration successful")
    return { success: true, userId: user.id }
  } catch (error: any) {
    console.error("[v0] Registration error:", error)
    return { success: false, error: error.message || "خطا در ثبت‌نام" }
  }
}
