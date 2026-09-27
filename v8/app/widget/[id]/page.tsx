import { getChatbotById, getChatbotFAQs, getChatbotProducts } from "@/lib/db"
import ChatbotWidget from "@/components/chatbot-widget"

interface WidgetPageProps {
  params: {
    id: string
  }
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: WidgetPageProps) {
  const chatbotId = Number(params.id)
  if (isNaN(chatbotId)) {
    return { themeColor: "#1068da" }
  }

  try {
    const chatbot = await getChatbotById(chatbotId)
    return { themeColor: chatbot?.primary_color || "#1068da" }
  } catch {
    return { themeColor: "#1068da" }
  }
}

export default async function WidgetPage({ params }: WidgetPageProps) {
  console.log("[v0] Widget page - Received chatbot ID param:", params.id)

  const chatbotId = Number(params.id)
  console.log("[v0] Widget page - Parsed chatbot ID:", chatbotId, "isNaN:", isNaN(chatbotId))

  const defaultChatbot = {
    id: isNaN(chatbotId) ? 0 : chatbotId,
    name: "چت‌بات",
    welcome_message: "سلام! چطور می‌توانم کمکتان کنم؟",
    navigation_message: "",
    primary_color: "#1068da",
    text_color: "#ffffff",
    background_color: "#f3f4f6",
    chat_icon: "💬",
    position: "bottom-right",
    store_url: "",
    ai_url: "",
    woocommerce_orders_enabled: false,
    woocommerce_api_url: "",
  }

  if (isNaN(chatbotId)) {
    console.log("[v0] Widget page - Invalid ID, rendering with defaults")
    return <ChatbotWidget chatbot={defaultChatbot} faqs={[]} products={[]} freezeMessage={null} />
  }

  try {
    console.log("[v0] Widget page - Fetching chatbot data for ID:", chatbotId)
    const chatbot = await getChatbotById(chatbotId)

    if (!chatbot) {
      console.log("[v0] Widget page - Chatbot not found, rendering with defaults")
      return <ChatbotWidget chatbot={defaultChatbot} faqs={[]} products={[]} freezeMessage={null} />
    }

    console.log("[v0] Widget page - Chatbot found:", chatbot.name)

    // Get FAQs and products with error handling
    const [faqs, products] = await Promise.all([
      getChatbotFAQs(chatbotId).catch((err) => {
        console.log("[v0] Widget page - Error fetching FAQs:", err.message)
        return []
      }),
      getChatbotProducts(chatbotId).catch((err) => {
        console.log("[v0] Widget page - Error fetching products:", err.message)
        return []
      }),
    ])

    const sanitizedChatbot = {
      id: chatbot.id,
      name: chatbot.name || "چت‌بات",
      welcome_message: chatbot.welcome_message || "سلام! چطور می‌توانم کمکتان کنم؟",
      navigation_message: chatbot.navigation_message || "",
      primary_color: chatbot.primary_color || "#1068da",
      text_color: chatbot.text_color || "#ffffff",
      background_color: chatbot.background_color || "#f3f4f6",
      chat_icon: chatbot.chat_icon || "💬",
      position: chatbot.position || "bottom-right",
      store_url: chatbot.store_url || "",
      ai_url: chatbot.ai_url || "",
      woocommerce_orders_enabled: chatbot.woocommerce_orders_enabled || false,
      woocommerce_api_url: chatbot.woocommerce_api_url || "",
    }

    console.log("[v0] Widget page - Rendering chatbot successfully")
    return <ChatbotWidget chatbot={sanitizedChatbot} faqs={faqs} products={products} freezeMessage={null} />
  } catch (error) {
    console.error("[v0] Widget page - Error loading chatbot:", error)
    console.log("[v0] Widget page - Rendering with defaults due to error")
    return <ChatbotWidget chatbot={defaultChatbot} faqs={[]} products={[]} freezeMessage={null} />
  }
}
