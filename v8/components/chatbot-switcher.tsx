"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Check, MessageSquare } from "lucide-react"

interface Chatbot {
  id: number
  name: string
  chat_icon: string
  is_active: boolean
}

export default function ChatbotSwitcher() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChatbots()
  }, [])

  const fetchChatbots = async () => {
    try {
      const response = await fetch("/api/dashboard/chatbots")
      const data = await response.json()

      // Handle both array format and object format
      const chatbotList = Array.isArray(data) ? data : data.chatbots || []

      if (chatbotList.length > 0) {
        setChatbots(chatbotList)

        const savedChatbotId = localStorage.getItem("selectedChatbotId")
        if (savedChatbotId) {
          const savedChatbot = chatbotList.find((c: Chatbot) => c.id === Number.parseInt(savedChatbotId))
          setSelectedChatbot(savedChatbot || chatbotList[0])
        } else {
          setSelectedChatbot(chatbotList[0])
        }
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChatbot = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot)
    localStorage.setItem("selectedChatbotId", chatbot.id.toString())

    window.dispatchEvent(new CustomEvent("chatbotChanged", { detail: { chatbotId: chatbot.id } }))
  }

  if (loading || !selectedChatbot) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl animate-pulse">
        <MessageSquare className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-500">در حال بارگذاری...</span>
      </div>
    )
  }

  if (chatbots.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 border-2 dark:bg-white dark:text-gray-900 dark:border-gray-300 bg-transparent"
        >
          <div className="text-xl">{selectedChatbot.chat_icon}</div>
          <div className="text-right hidden md:block">
            <div className="font-semibold text-sm dark:text-gray-900">{selectedChatbot.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-600">
              {selectedChatbot.is_active ? "🟢 فعال" : "🔴 غیرفعال"}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-700" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-white dark:bg-white rounded-xl border-2 shadow-lg p-2">
        <div className="px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-700 border-b mb-2">
          انتخاب چت‌بات
        </div>
        {chatbots.map((chatbot) => (
          <DropdownMenuItem
            key={chatbot.id}
            onClick={() => handleSelectChatbot(chatbot)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedChatbot.id === chatbot.id
                ? "bg-blue-50 border-2 border-blue-500 dark:bg-blue-50 dark:border-blue-500"
                : "hover:bg-gray-100 dark:hover:bg-gray-100 dark:text-gray-900"
            }`}
          >
            <div className="text-2xl">{chatbot.chat_icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-base dark:text-gray-900">{chatbot.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-600">
                {chatbot.is_active ? "🟢 فعال" : "🔴 غیرفعال"}
              </div>
            </div>
            {selectedChatbot.id === chatbot.id && <Check className="h-5 w-5 text-blue-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
