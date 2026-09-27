"use server"

import { getSql } from "@/lib/db"
import type { Chatbot } from "@/lib/db"

// Get chatbots for a specific user
export async function getUserChatbots(userId: number): Promise<Chatbot[]> {
  try {
    const sql = getSql()

    const result = await sql`
      SELECT * FROM chatbots 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `
    return result as unknown as Chatbot[]
  } catch (error) {
    console.error("Error fetching user chatbots:", error)
    return []
  }
}

// Create chatbot for user
export async function createUserChatbot(
  userId: number,
  data: {
    name: string
    welcome_message?: string
    primary_color?: string
    text_color?: string
    background_color?: string
    chat_icon?: string
    position?: string
  },
): Promise<Chatbot> {
  try {
    const sql = getSql()

    const result = await sql`
      INSERT INTO chatbots (
        user_id, name, welcome_message, primary_color, text_color, 
        background_color, chat_icon, position
      ) VALUES (
        ${userId}, ${data.name}, ${data.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟"}, 
        ${data.primary_color || "#14b8a6"}, ${data.text_color || "#ffffff"}, 
        ${data.background_color || "#f3f4f6"}, ${data.chat_icon || "💬"}, 
        ${data.position || "bottom-right"}
      ) RETURNING *
    `
    return result[0] as unknown as Chatbot
  } catch (error) {
    console.error("Error creating user chatbot:", error)
    throw new Error("خطا در ساخت چت‌بات")
  }
}

// Update chatbot for user
export async function updateUserChatbot(
  chatbotId: number,
  data: {
    name?: string
    welcome_message?: string
    navigation_message?: string
    primary_color?: string
    text_color?: string
    background_color?: string
    chat_icon?: string
    position?: string
    store_url?: string
    ai_url?: string
    faqs?: Array<{ question: string; answer: string; emoji: string }>
  },
): Promise<Chatbot> {
  try {
    const sql = getSql()

    const result = await sql`
      UPDATE chatbots SET
        name = COALESCE(${data.name}, name),
        welcome_message = COALESCE(${data.welcome_message}, welcome_message),
        navigation_message = COALESCE(${data.navigation_message}, navigation_message),
        primary_color = COALESCE(${data.primary_color}, primary_color),
        text_color = COALESCE(${data.text_color}, text_color),
        background_color = COALESCE(${data.background_color}, background_color),
        chat_icon = COALESCE(${data.chat_icon}, chat_icon),
        position = COALESCE(${data.position}, position),
        store_url = COALESCE(${data.store_url}, store_url),
        ai_url = COALESCE(${data.ai_url}, ai_url),
        updated_at = NOW()
      WHERE id = ${chatbotId}
      RETURNING *
    `

    // Update FAQs if provided
    if (data.faqs && data.faqs.length > 0) {
      // Delete existing FAQs
      await sql`DELETE FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`

      // Insert new FAQs
      for (const faq of data.faqs) {
        await sql`
          INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji)
          VALUES (${chatbotId}, ${faq.question}, ${faq.answer}, ${faq.emoji})
        `
      }
    }

    return result[0] as unknown as Chatbot
  } catch (error) {
    console.error("Error updating user chatbot:", error)
    throw new Error("خطا در بروزرسانی چت‌بات")
  }
}
