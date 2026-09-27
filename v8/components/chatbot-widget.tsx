"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  ShoppingCart,
  Send,
  X,
  MessageCircle,
  Ticket,
  Mic,
  MicOff,
  Smile,
  Pin,
  ArrowRight,
  MoreVertical,
  Trash2,
  Volume2,
  VolumeX,
  Package,
  Search,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TicketForm } from "@/components/ticket-form"
import { TicketLookup } from "@/components/ticket-lookup"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MarkdownRenderer } from "./markdown-renderer"

interface ChatbotWidgetProps {
  chatbot: {
    id: number
    name: string
    welcome_message: string
    navigation_message: string
    primary_color: string
    text_color: string
    background_color: string
    chat_icon: string
    position: string
    store_url?: string
    ai_url?: string
    products?: SuggestedProduct[]
    faqs?: Array<{ question: string; answer: string; emoji: string }>
    woocommerce_orders_enabled?: boolean
    woocommerce_api_url?: string
  }
  faqs?: Array<{
    id: number
    question: string
    answer: string
    emoji: string
  }>
  products?: Array<{
    id: number
    name: string
    description: string
    price: number
    image_url: string
    product_url: string
    button_text: string
  }>
  chatHistory?: ChatMessage[]
  isPreview?: boolean // Added for preview mode
  freezeMessage?: string | null // Added freeze message prop
}

interface SuggestedProduct {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  product_url: string
  button_text: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggested_products?: SuggestedProduct[]
  suggested_questions?: Array<{ question: string; emoji: string }>
}

const POPULAR_EMOJIS = ["😊", "👍", "❤️", "😂", "🙏", "👌", "🔥", "💯", "🎉", "✨"]
const NOTIFICATION_SOUND_URL = "/images/notification-2-269292.mp3"

function ChatbotWidget({
  chatbot,
  faqs = [],
  products = [],
  chatHistory = [],
  isPreview = false,
  freezeMessage = null,
}: ChatbotWidgetProps) {
  // Added freezeMessage prop
  const [activeTab, setActiveTab] = useState<"ai" | "store" | "ticket">("ai")
  const [showFAQs, setShowFAQs] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [newSuggestedProducts, setNewSuggestedProducts] = useState<SuggestedProduct[]>([])
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [lastUserMessage, setLastUserMessage] = useState<string>("")
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedProductIds, setHighlightedProductIds] = useState<Set<number>>(new Set())
  const [pinnedProduct, setPinnedProduct] = useState<SuggestedProduct | null>(null)
  const [isOpen, setIsOpen] = useState(() => {
    // Auto-open when running inside an iframe (embedded widget) so content is always rendered
    try { return window.parent !== window } catch { return true }
  })

  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderFormData, setOrderFormData] = useState({ firstName: "", lastName: "", phone: "" })
  const [isCheckingOrder, setIsCheckingOrder] = useState(false)
  const [orderResults, setOrderResults] = useState<any>(null)

  const [showTicketLookup, setShowTicketLookup] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const pendingSelectionRef = useRef<string | null>(null)

  useEffect(() => {
    // Signal to parent that chatbot is ready
    try {
      window.parent.postMessage({ type: "CHATBOT_READY", chatbotId: chatbot.id }, "*")
      console.log("[Chatbot] Sent CHATBOT_READY signal to parent")
    } catch (e) {
      console.log("[Chatbot] Could not send ready signal (not in iframe)")
    }
  }, [chatbot.id])

  // CHANGE: Load conversation history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`chatbot-${chatbot.id}-history`)
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setMessages(parsed)
        console.log("[v0] Loaded conversation history from localStorage:", parsed.length, "messages")
      } catch (error) {
        console.error("[v0] Error loading conversation history:", error)
      }
    }
  }, [chatbot.id])

  useEffect(() => {
    notificationAudioRef.current = new Audio(NOTIFICATION_SOUND_URL)
    notificationAudioRef.current.volume = 0.3

    const handleParentMessage = (event: MessageEvent) => {
      if (event.data?.type === "TOGGLE_CHATBOT") {
        setIsOpen((prev) => !prev)
        console.log("🔄 Chatbot toggled via postMessage")
      }

      if (event.data?.type === "WIDGET_OPENED") {
        setIsOpen(true)
        console.log("🔓 Chatbot opened via bubble click")
      }

      if (event.data?.type === "USER_TEXT_SELECTION") {
        const selectedText = event.data.payload?.text
        console.log("📩 Received text selection from website:", selectedText)

        if (selectedText && selectedText.trim()) {
          // Populate input field with selected text question
          const question = `درباره "${selectedText}" توضیح بده؟`
          setInputValue(question)

          // Open chatbot if not already open
          if (!isOpen) {
            setIsOpen(true)
          }

          // Focus on input field after a short delay
          setTimeout(() => {
            inputRef.current?.focus()
          }, 100)

          console.log("✅ Input field populated with:", question)
        }
      }
    }

    window.addEventListener("message", handleParentMessage)

    return () => {
      window.removeEventListener("message", handleParentMessage)
    }
  }, [isOpen]) // Dependency array includes isOpen

  useEffect(() => {
    if (pendingSelectionRef.current && !isLoading) {
      const textToSend = pendingSelectionRef.current
      pendingSelectionRef.current = null

      // Small delay to ensure UI is ready
      setTimeout(() => {
        console.log("📤 Sending pending selection:", textToSend)
        sendMessage(textToSend)
      }, 100)
    }
  })

  // CHANGE: Save conversation history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chatbot-${chatbot.id}-history`, JSON.stringify(messages))
      console.log("[v0] Saved conversation history to localStorage:", messages.length, "messages")
    }
  }, [messages, chatbot.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    console.log("[v0] Sending message with chatbot ID:", chatbot.id)

    if (!chatbot.id || isNaN(Number(chatbot.id))) {
      console.error("[v0] Invalid chatbot ID:", chatbot.id)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "متأسفانه خطایی رخ داده است. شناسه چت‌بات نامعتبر است.",
          timestamp: new Date(),
        },
      ])
      return
    }

    setIsLoading(true)
    setLastUserMessage(content)

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    const orderKeywords = ["سفارش", "پیگیری", "وضعیت سفارش", "سفارشم", "track", "order"]
    const isOrderQuery = orderKeywords.some((keyword) => content.toLowerCase().includes(keyword.toLowerCase()))

    if (isOrderQuery && chatbot.woocommerce_orders_enabled) {
      console.log("[v0] Order tracking query detected")
      setShowOrderForm(true)
      setIsLoading(false)

      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "برای پیگیری سفارش شما، لطفاً نام، نام خانوادگی و شماره تماس خود را در فرم زیر وارد کنید تا وضعیت سفارش شما را بررسی کنم 📦",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      playNotificationSound()
      return
    }

    try {
      const chatbotId = Number(chatbot.id)
      console.log("[v0] Making API call to /api/chat with chatbotId:", chatbotId)

      const recentMessages = [...messages, userMessage].slice(-10)
      const messagesToSend = recentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      console.log("[v0] Sending", messagesToSend.length, "messages to API")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesToSend,
          chatbotId,
          pinnedProductId: pinnedProduct?.id,
        }),
      })

      console.log("[v0] API response status:", response.status, response.ok ? "OK" : "not OK")

      if (!response.ok) {
        console.error("[v0] API response not OK:", response.status)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body reader available")
      }

      console.log("[v0] Received stream, starting to read...")

      const assistantMessageId = `assistant-${Date.now()}`
      let accumulatedText = ""

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ])

      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          console.log("[v0] Stream complete, total text length:", accumulatedText.length)
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        const lines = buffer.split("\n")
        
        // Save the last incomplete line back to the buffer
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine) continue

          if (trimmedLine.startsWith("0:")) {
            try {
              const jsonStr = trimmedLine.substring(2)
              const parsed = JSON.parse(jsonStr)

              if (typeof parsed === "string") {
                accumulatedText += parsed
              } else if (parsed && typeof parsed === "object" && parsed.text) {
                accumulatedText += parsed.text
              }
            } catch (e) {
              accumulatedText += trimmedLine.substring(2)
            }
          }
        }

        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: accumulatedText } : msg)),
        )
      }

      if (accumulatedText.length === 0) {
        console.error("[v0] No content received from stream")
        throw new Error("No content received from stream")
      }

      playNotificationSound()

      console.log("[v0] Message complete! Fetching suggestions...")

      const conversationContext = [...messages, userMessage]
        .slice(-6)
        .map((m) => `${m.role === "user" ? "کاربر" : "دستیار"}: ${m.content}`)
        .join("\n")

      setIsLoadingRecommendations(true)
      setIsLoadingQuestions(true)

      const [recommendationsResult, suggestionsResult] = await Promise.allSettled([
        fetch(`/api/chatbots/${chatbotId}/recommend-products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationContext: conversationContext + `\nدستیار: ${accumulatedText}`,
            userMessage: content,
          }),
        }),
        fetch(`/api/chatbots/${chatbotId}/suggest-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationHistory: conversationContext + `\nدستیار: ${accumulatedText}`,
          }),
        }),
      ])

      let recommendedProducts: SuggestedProduct[] = []
      if (recommendationsResult.status === "fulfilled" && recommendationsResult.value.ok) {
        try {
          const recData = await recommendationsResult.value.json()
          recommendedProducts = recData.recommendations || []
          console.log("[v0] Got", recommendedProducts.length, "product recommendations")
        } catch (e) {
          console.error("[v0] Error parsing recommendations:", e)
        }
      } else {
        console.error("[v0] Recommendations fetch failed:", recommendationsResult)
      }

      let suggestedQs: Array<{ question: string; emoji: string }> = []
      if (suggestionsResult.status === "fulfilled" && suggestionsResult.value.ok) {
        try {
          const sugData = await suggestionsResult.value.json()
          suggestedQs = sugData.suggestions || []
          console.log("[v0] Got", suggestedQs.length, "suggested questions")
        } catch (e) {
          console.error("[v0] Error parsing suggestions:", e)
        }
      } else {
        console.error("[v0] Suggestions fetch failed:", suggestionsResult)
      }

      if (suggestedQs.length === 0) {
        suggestedQs = [
          { question: "بیشتر توضیح می‌دهید؟", emoji: "🤔" },
          { question: "محصولات دیگر چیست؟", emoji: "🛍️" },
        ]
        console.log("[v0] Using fallback suggestions")
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: accumulatedText,
                suggested_products: recommendedProducts,
                suggested_questions: suggestedQs,
              }
            : msg,
        ),
      )

      console.log(
        "[v0] Updated message with",
        recommendedProducts.length,
        "products and",
        suggestedQs.length,
        "questions",
      )

      setIsLoadingRecommendations(false)
      setIsLoadingQuestions(false)
    } catch (error: any) {
      console.error("[v0] Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const playNotificationSound = () => {
    if (!isMuted && notificationAudioRef.current) {
      notificationAudioRef.current.play().catch(console.error)
    }
  }

  const cleanMessageContent = (content: string | undefined | null) => {
    if (!content) return ""
    return content
      .replace(/SUGGESTED_PRODUCTS:\s*\[.*?\]/s, "")
      .replace(/SUGGESTED_QUESTIONS:\s*\[.*?\]/s, "")
      .trim()
  }

  // CHANGE: Clear chat history function - only clears state and localStorage, no reload
  const clearChatHistory = () => {
    setMessages([])
    localStorage.removeItem(`chatbot-${chatbot.id}-history`)
    console.log("[v0] Cleared conversation history for chatbot:", chatbot.id)
  }

  const handleEmojiClick = (emoji: string) => {
    const target = inputRef.current
    if (target) {
      const newValue = (inputValue || "") + emoji
      setInputValue(newValue)
      target.value = newValue
    }
    setShowEmojiPicker(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data)
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        // Placeholder for actual speech-to-text integration
        const transcribedText = "متن تبدیل شده از صدا" // Replace with actual transcription
        await sendMessage(transcribedText)
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFAQClick = (faq: { question: string; answer: string }) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: faq.question,
      timestamp: new Date(),
    }
    const botMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: faq.answer,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage, botMessage])
    setShowFAQs(false)
    playNotificationSound()
  }

  const handleSuggestedQuestionClick = async (question: string) => {
    setLastUserMessage(question)
    await sendMessage(question)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    setLastUserMessage(inputValue)
    await sendMessage(inputValue)
    setInputValue("")

    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleClose = () => window.parent.postMessage({ type: "orion-chatbot-close" }, "*")

  const handleTabChange = (tab: "ai" | "store" | "ticket") => {
    setActiveTab(tab)
    if (tab === "store") setSuggestionCount(0)
  }

  const handlePinProduct = (product: SuggestedProduct) => {
    setPinnedProduct(product)
    scrollToBottom()
  }

  const handleUnpinProduct = () => {
    setPinnedProduct(null)
  }

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: chatbot.welcome_message || "سلام! چطور می‌توانم کمکتان کنم؟",
        timestamp: new Date(),
      },
    ])
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleCheckOrder = async () => {
    if (!orderFormData.firstName || !orderFormData.lastName || !orderFormData.phone) {
      return
    }

    setIsCheckingOrder(true)
    setOrderResults(null)

    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}/check-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: orderFormData.firstName,
          lastName: orderFormData.lastName,
          phone: orderFormData.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "خطا در بررسی سفارش")
      }

      setOrderResults(data)

      // Add result message to chat
      let resultMessage = ""
      if (data.found && data.orders.length > 0) {
        resultMessage = `عزیز ${orderFormData.firstName} ${orderFormData.lastName}، سفارشات شما را یافتم! 🎉\n\n`
        data.orders.forEach((order: any, index: number) => {
          const statusEmoji =
            order.statusKey === "completed"
              ? "✅"
              : order.statusKey === "processing"
                ? "⏳"
                : order.statusKey === "pending"
                  ? "⏰"
                  : order.statusKey === "cancelled"
                    ? "❌"
                    : "📦"

          resultMessage += `${statusEmoji} سفارش شماره ${order.orderId}\n`
          resultMessage += `وضعیت: ${order.status}\n`
          resultMessage += `مبلغ: ${Number(order.total).toLocaleString()} تومان\n`
          resultMessage += `تاریخ: ${new Date(order.date).toLocaleDateString("fa-IR")}\n`
          resultMessage += `روش پرداخت: ${order.paymentMethod}\n`
          if (index < data.orders.length - 1) resultMessage += "\n"
        })
      } else {
        resultMessage = `متأسفانه سفارشی با مشخصات وارد شده یافت نشد. 😔\n\nلطفاً مطمئن شوید که نام، نام خانوادگی و شماره تماس را دقیقاً همانطور که هنگام ثبت سفارش وارد کرده‌اید، وارد کنید.`
      }

      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: resultMessage,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])

      // Reset form
      setShowOrderForm(false)
      setOrderFormData({ firstName: "", lastName: "", phone: "" })
    } catch (error: any) {
      console.error("[v0] Order check error:", error)
      const errorMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: error.message || "خطا در بررسی سفارش. لطفاً دوباره تلاش کنید.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsCheckingOrder(false)
    }
  }

  // Only render the widget if isOpen is true
  if (!isOpen && !isPreview) {
    return null
  }

  return (
    <div
      className="w-full h-full bg-white flex flex-col overflow-hidden font-sans relative"
      dir="rtl"
      style={{
        fontFamily: "'Vazirmatn', sans-serif",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        visibility: "visible",
        opacity: 1,
        height: isPreview ? "100%" : "100vh",
        maxHeight: isPreview ? "100%" : "100vh",
      }}
    >
      {freezeMessage && !isPreview && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">چت‌بات موقتاً غیرفعال است</h2>
              <p className="text-gray-600 leading-relaxed text-base">{freezeMessage}</p>
            </div>
            <a
              href="https://talksell.ir/تعرفه-ها/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              مشاهده پلن‌ها و ارتقا 🚀
            </a>
            <p className="mt-4 text-sm text-gray-500">برای فعال‌سازی مجدد، به حساب تاک‌سل خود مراجعه کنید</p>
          </div>
        </div>
      )}

      {/* Header - Fixed at top, no scroll */}
      <div
        className="flex-shrink-0 widget-no-scroll px-4 py-3 flex items-center justify-between sm:rounded-t-2xl"
        style={{ backgroundColor: chatbot.primary_color }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl">{chatbot.chat_icon || "💬"}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">{chatbot.name}</h3>
            <p className="text-white/90 text-xs">آنلاین</p>
          </div>
        </div>
        {/* Dropdown Menu */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            {/* CHANGE: Added dark mode overrides to ensure light mode colors always */}
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white dark:bg-white rounded-xl border-2 dark:border-gray-200 shadow-lg"
            >
              <DropdownMenuItem
                onClick={clearChatHistory}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg mx-1 my-1 text-gray-900 dark:text-gray-900"
              >
                <Trash2 className="w-4 h-4 ml-2 text-gray-700 dark:text-gray-700" />
                <span>پاک کردن تاریخچه</span>
              </DropdownMenuItem>
              {chatbot.woocommerce_orders_enabled && (
                <DropdownMenuItem
                  onClick={() => {
                    setShowOrderForm(true)
                    console.log("[v0] Order tracking form opened from menu")
                  }}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg mx-1 my-1 text-gray-900 dark:text-gray-900"
                >
                  <Package className="w-4 h-4 ml-2 text-gray-700 dark:text-gray-700" />
                  <span>پیگیری سفارش</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleToggleMute}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg mx-1 my-1 text-gray-900 dark:text-gray-900"
              >
                {isMuted ? (
                  <>
                    <Volume2 className="w-4 h-4 ml-2 text-gray-700 dark:text-gray-700" />
                    <span>فعال کردن صدا</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 ml-2 text-gray-700 dark:text-gray-700" />
                    <span>بی‌صدا کردن</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {pinnedProduct && (
        <div
          className="bg-white mx-3 mt-3 mb-2 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-500"
          style={{
            boxShadow: `0 4px 20px ${chatbot.primary_color}40, 0 0 0 2px ${chatbot.primary_color}20`,
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">دریافت مشاوره تخصصی درباره</p>
            <p className="font-bold text-base text-gray-900 truncate">{pinnedProduct.name}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src={pinnedProduct.image_url || "/placeholder.svg?height=60&width=60"}
              alt={pinnedProduct.name}
              className="w-14 h-14 rounded-xl object-cover border-2"
              style={{ borderColor: chatbot.primary_color }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=60&width=60"
              }}
            />
            <button
              onClick={handleUnpinProduct}
              className="rounded-full p-2 transition-all hover:scale-110"
              style={{
                backgroundColor: `${chatbot.primary_color}15`,
                color: chatbot.primary_color,
              }}
              title="بازگشت به چت اصلی"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - ONLY this scrolls */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain widget-scrollable-content"
        style={{
          backgroundColor: chatbot.background_color || "#f3f4f6",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {activeTab === "ai" && (
          <div className="p-4 space-y-4" ref={chatContainerRef}>
            {showOrderForm && (
              <div className="mb-4">
                <div
                  className="rounded-2xl p-4 border-2 shadow-lg bg-white dark:bg-white"
                  style={{
                    background: `linear-gradient(135deg, ${chatbot.primary_color}15, ${chatbot.primary_color}25)`,
                    borderColor: chatbot.primary_color,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-900">📦 پیگیری سفارش</h3>
                    <button
                      onClick={() => {
                        setShowOrderForm(false)
                        setOrderFormData({ firstName: "", lastName: "", phone: "" })
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1">نام</label>
                      <input
                        type="text"
                        value={orderFormData.firstName}
                        onChange={(e) => setOrderFormData({ ...orderFormData, firstName: e.target.value })}
                        placeholder="نام خود را وارد کنید"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-400"
                        style={{ focusRingColor: chatbot.primary_color }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1">
                        نام خانوادگی
                      </label>
                      <input
                        type="text"
                        value={orderFormData.lastName}
                        onChange={(e) => setOrderFormData({ ...orderFormData, lastName: e.target.value })}
                        placeholder="نام خانوادگی خود را وارد کنید"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-400"
                        style={{ focusRingColor: chatbot.primary_color }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1">
                        شماره تماس
                      </label>
                      <input
                        type="tel"
                        value={orderFormData.phone}
                        onChange={(e) => setOrderFormData({ ...orderFormData, phone: e.target.value })}
                        placeholder="09123456789"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-400"
                        dir="ltr"
                        style={{ focusRingColor: chatbot.primary_color }}
                      />
                    </div>

                    <button
                      onClick={handleCheckOrder}
                      disabled={
                        isCheckingOrder || !orderFormData.firstName || !orderFormData.lastName || !orderFormData.phone
                      }
                      className="w-full text-white dark:text-white font-medium py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{
                        backgroundColor: chatbot.primary_color,
                      }}
                    >
                      {isCheckingOrder ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                          در حال بررسی...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          جستجوی سفارش
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => {
              // Look in messages state (which has suggestions) instead of chatHistory prop (which doesn't)
              const messageWithProducts = messages.find((m) => m.id === message.id)

              return (
                <div key={message.id}>
                  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" ? (
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/placeholder.svg" alt="Assistant" />
                          <AvatarFallback>{chatbot.chat_icon || "💬"}</AvatarFallback>
                        </Avatar>
                        <Card className="bg-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm border border-gray-100">
                          <CardContent className="text-sm text-gray-800 leading-relaxed p-0">
                            <MarkdownRenderer content={cleanMessageContent(message.content)} />
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card
                        className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-white text-sm shadow-sm"
                        style={{ backgroundColor: chatbot.primary_color }}
                      >
                        <CardContent className="p-0">{message.content || ""}</CardContent>
                      </Card>
                    )}
                  </div>

                  {message.role === "assistant" &&
                    messageWithProducts?.suggested_products &&
                    messageWithProducts.suggested_products.length > 0 && (
                      <div className="mr-10 mt-3">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {messageWithProducts.suggested_products.map((product) => (
                            <div
                              key={product.id}
                              className="min-w-[160px] max-w-[160px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex-shrink-0 relative"
                            >
                              <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                پیشنهاد ویژه
                              </div>
                              <button
                                onClick={() => handlePinProduct(product)}
                                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center hover:scale-110 active:scale-95"
                                title="مشاوره تخصصی محصول"
                              >
                                <Pin className="w-4 h-4 text-gray-700" />
                              </button>
                              <div className="h-24 bg-gray-50 flex items-center justify-center p-2">
                                <img
                                  src={product.image_url || "/placeholder.svg?height=96&width=150"}
                                  alt={product.name}
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=96&width=150"
                                  }}
                                />
                              </div>
                              <div className="p-3">
                                <h4 className="font-semibold text-xs text-gray-800 mb-1 line-clamp-2 leading-tight">
                                  {product.name}
                                </h4>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm font-bold" style={{ color: chatbot.primary_color }}>
                                    {new Intl.NumberFormat("fa-IR").format(Number(product.price))} تومان
                                  </span>
                                  <a
                                    href={product.product_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all"
                                    style={{ backgroundColor: chatbot.primary_color }}
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                                <button
                                  onClick={() => handlePinProduct(product)}
                                  className="w-full mt-2 text-[10px] py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-gray-600 font-medium"
                                >
                                  دریافت مشاوره تخصصی
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {message.role === "assistant" &&
                    messageWithProducts?.suggested_questions &&
                    messageWithProducts.suggested_questions.length > 0 && (
                      <div className="mr-10 mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          {messageWithProducts.suggested_questions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestedQuestionClick(suggestion.question)}
                              className="h-auto p-3 text-right bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs transition-all hover:shadow-md active:scale-95 flex items-center gap-2"
                            >
                              <span className="text-lg flex-shrink-0">{suggestion.emoji}</span>
                              <span className="text-gray-700 font-medium leading-snug text-right flex-1">
                                {suggestion.question}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )
            })}

            {isLoadingRecommendations && (
              <div className="flex justify-start mr-10">
                <div className="mb-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="grid grid-cols-5 gap-2">
                    {POPULAR_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-2xl p-2 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder.svg" alt="Assistant" />
                    <AvatarFallback>{chatbot.chat_icon || "💬"}</AvatarFallback>
                  </Avatar>
                  <Card className="bg-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm border border-gray-100">
                    <CardContent className="flex gap-1 items-center p-0">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {showFAQs && messages.length <= 1 && faqs.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {faqs.slice(0, 4).map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFAQClick(faq)}
                      className="h-auto p-4 text-right bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-sm transition-all hover:shadow-md active:scale-95 flex items-center gap-2"
                    >
                      <span className="text-2xl flex-shrink-0">{faq.emoji}</span>
                      <span className="text-gray-700 font-medium leading-snug text-right flex-1">{faq.question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        {activeTab === "store" && (
          <div className="p-4">
            {newSuggestedProducts.length > 0 && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center animate-pulse">
                      <ShoppingCart className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">محصولات پیشنهادی جدید برای شما</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {newSuggestedProducts.slice(0, 4).map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border-2 border-green-300 overflow-hidden hover:shadow-lg transition-all group relative"
                      >
                        <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          جدید
                        </div>
                        <button
                          onClick={() => handlePinProduct(product)}
                          className="absolute top-2 left-2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 transition-colors shadow-md"
                          title="پین کردن محصول"
                        >
                          <Pin className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <div className="relative h-32 overflow-hidden bg-gray-100">
                          <img
                            src={product.image_url || "/placeholder.svg?height=128&width=200"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=128&width=200"
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-gray-900 mb-1 text-sm line-clamp-1">{product.name}</h4>
                          <div className="flex items-end justify-between mt-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs text-gray-400 line-through">
                                {(Number(product.price) * 1.2).toLocaleString("fa-IR")}
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-green-600">
                                  {Number(product.price).toLocaleString("fa-IR")}
                                </span>
                                <span className="text-xs text-gray-500">تومان</span>
                              </div>
                            </div>
                            <a
                              href={product.product_url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg flex-shrink-0"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </a>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full text-center font-bold">
                              ۱۵% تخفیف
                            </div>
                            <button
                              onClick={() => handlePinProduct(product)}
                              className="w-full text-xs py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                              style={{
                                backgroundColor: `${chatbot.primary_color}10`,
                                color: chatbot.primary_color,
                              }}
                            >
                              📌 دریافت مشاوره تخصصی
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {products && products.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">تمام محصولات</h3>
                <div className="grid grid-cols-2 gap-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                    >
                      <div className="relative h-32 overflow-hidden bg-gray-100">
                        <img
                          src={product.image_url || "/placeholder.svg?height=128&width=200"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=128&width=200"
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <h5 className="font-bold text-gray-900 mb-2 text-sm line-clamp-2">{product.name}</h5>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-base font-bold" style={{ color: chatbot.primary_color }}>
                            {new Intl.NumberFormat("fa-IR").format(Number(product.price))}
                          </span>
                          <span className="text-xs text-gray-500">تومان</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={product.product_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-white text-xs py-2 rounded-xl text-center font-bold transition-all hover:scale-105"
                            style={{ backgroundColor: chatbot.primary_color }}
                          >
                            {product.button_text || "خرید"}
                          </a>
                          <button
                            onClick={() => handlePinProduct(product)}
                            className="px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                            style={{
                              backgroundColor: `${chatbot.primary_color}15`,
                              color: chatbot.primary_color,
                            }}
                            title="مشاوره تخصصی"
                          >
                            📌
                          </button>
                        </div>
                        <p className="text-xs text-center mt-2 font-medium" style={{ color: chatbot.primary_color }}>
                          دریافت مشاوره تخصصی درباره این محصول
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>محصولی برای نمایش وجود ندارد</p>
              </div>
            )}
          </div>
        )}
        {activeTab === "ticket" && (
          // CHANGE: Added dark mode safe classes to ticket tab container
          <div className="p-4 bg-white dark:bg-white">
            {/* Ticket lookup toggle */}
            <div className="mb-4 flex gap-2">
              <Button
                variant={showTicketLookup ? "outline" : "default"}
                onClick={() => setShowTicketLookup(false)}
                className={`flex-1 rounded-2xl ${
                  showTicketLookup
                    ? "bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-gray-300 dark:border-gray-300"
                    : "bg-blue-600 dark:bg-blue-600 text-white dark:text-white"
                }`}
              >
                تیکت جدید
              </Button>
              <Button
                variant={showTicketLookup ? "default" : "outline"}
                onClick={() => setShowTicketLookup(true)}
                className={`flex-1 rounded-2xl ${
                  showTicketLookup
                    ? "bg-blue-600 dark:bg-blue-600 text-white dark:text-white"
                    : "bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-gray-300 dark:border-gray-300"
                }`}
              >
                پیگیری تیکت
              </Button>
            </div>

            {showTicketLookup ? (
              <TicketLookup chatbotId={chatbot.id} primaryColor={chatbot.primary_color} />
            ) : (
              <TicketForm chatbotId={chatbot.id} />
            )}
          </div>
        )}
      </div>

      {/* Footer Tabs - Fixed at bottom, no scroll */}
      <div className="flex-shrink-0 bg-white border-t dark:bg-white dark:border-gray-200 widget-no-scroll">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => handleTabChange("ai")}
            className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors rounded-t-xl ${
              activeTab === "ai" ? "text-gray-800 border-b-2 font-medium" : "text-gray-400 hover:text-gray-600"
            }`}
            style={{ borderBottomColor: activeTab === "ai" ? chatbot.primary_color : "transparent" }}
          >
            <MessageCircle className="w-5 h-5 mb-1" />
            <span>هوش مصنوعی</span>
          </button>
          <button
            onClick={() => handleTabChange("store")}
            className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors relative rounded-t-xl ${
              activeTab === "store" ? "text-gray-800 border-b-2 font-medium" : "text-gray-400 hover:text-gray-600"
            }`}
            style={{ borderBottomColor: activeTab === "store" ? chatbot.primary_color : "transparent" }}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-1" />
              {suggestionCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {suggestionCount}
                </div>
              )}
            </div>
            <span>فروشگاه</span>
          </button>
          <button
            onClick={() => handleTabChange("ticket")}
            className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors relative rounded-t-xl ${
              activeTab === "ticket" ? "text-gray-800 border-b-2 font-medium" : "text-gray-400 hover:text-gray-600"
            }`}
            style={{ borderBottomColor: activeTab === "ticket" ? chatbot.primary_color : "transparent" }}
          >
            <Ticket className="w-5 h-5 mb-1" />
            <span>تیکت</span>
          </button>
        </div>
        {/* Input Area - Fixed at bottom, no scroll */}
        {activeTab === "ai" && (
          <div className="flex-shrink-0 p-3 bg-white border-t dark:bg-white dark:border-gray-200 widget-no-scroll">
            {showEmojiPicker && (
              <div className="mb-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="grid grid-cols-5 gap-2">
                  {POPULAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl p-2 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={onSubmit} className="p-3 border-t flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 border-0 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus-visible:ring-0 h-9 [color-scheme:light]"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className={`p-1 h-9 w-9 rounded-full transition-colors flex-shrink-0 ${
                  isRecording
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="rounded-full w-9 h-9 p-0 transition-all flex-shrink-0"
                style={{ backgroundColor: !inputValue.trim() || isLoading ? "#9CA3AF" : chatbot.primary_color }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-400">ارائه شده توسط هوش مصنوعی تاکسل</p>
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden flex-shrink-0 bg-white" style={{ height: "60px" }} />
    </div>
  )
}

function findMatchingProducts(query: string, products: any[]) {
  if (!query) return []

  const queryLower = query.toLowerCase()
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(queryLower) || product.description.toLowerCase().includes(queryLower),
  )
}

function formatTextWithLinks(text: string) {
  const linkRegex = /\[([^\]]+)\]$$([^)]+)$$/g // Corrected regex to match markdown link format [text](url)
  const parts = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        {match[1]}
      </a>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

export default ChatbotWidget
