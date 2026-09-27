"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Settings, BarChart3, MessageSquare } from "lucide-react"
import Link from "next/link"
import { getUserChatbots } from "@/lib/user-db"
import type { Chatbot } from "@/lib/db"

export default function ChatbotsListContent({ userId }: { userId: number }) {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadChatbots() {
      try {
        const data = await getUserChatbots(userId)
        setChatbots(data)
      } catch (error) {
        console.error("Error loading chatbots:", error)
      } finally {
        setLoading(false)
      }
    }
    loadChatbots()
  }, [userId])

  if (loading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">چت‌بات‌های من</h1>
          <p className="text-gray-600 mt-1">مدیریت و تنظیم چت‌بات‌های خود</p>
        </div>
        <Link href="/dashboard/chatbots/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="ml-2 h-5 w-5" />
            چت‌بات جدید
          </Button>
        </Link>
      </div>

      {chatbots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز چت‌بات ندارید</h3>
            <p className="text-gray-600 mb-6">اولین چت‌بات خود را بسازید و شروع کنید</p>
            <Link href="/dashboard/chatbots/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="ml-2 h-5 w-5" />
                ساخت چت‌بات
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map((chatbot) => (
            <Card key={chatbot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{chatbot.chat_icon}</div>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: chatbot.primary_color }} />
                </div>
                <CardTitle className="mt-4">{chatbot.name}</CardTitle>
                <CardDescription className="line-clamp-2">{chatbot.welcome_message}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/admin/${chatbot.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      <Settings className="ml-2 h-4 w-4" />
                      تنظیمات
                    </Button>
                  </Link>
                  <Link href={`/dashboard/analytics/${chatbot.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      <BarChart3 className="ml-2 h-4 w-4" />
                      آمار
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
