"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, TrendingUp, Clock, Users, Search, BarChart3 } from "lucide-react"

interface MessagesAnalyticsProps {
  userId: number
}

export default function MessagesAnalytics({ userId }: MessagesAnalyticsProps) {
  const [loading, setLoading] = useState(true)
  const [allMessages, setAllMessages] = useState<any[]>([])
  const [filteredMessages, setFilteredMessages] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChatbot, setSelectedChatbot] = useState<string>("all")
  const [stats, setStats] = useState({
    totalMessages: 0,
    todayMessages: 0,
    averageResponseTime: 0,
    topQuestions: [] as Array<{ question: string; count: number }>,
    chatbotBreakdown: [] as Array<{ name: string; count: number; chatbotId: number }>,
    hourlyDistribution: [] as Array<{ hour: number; count: number }>,
  })

  useEffect(() => {
    loadAllMessages()
  }, [])

  useEffect(() => {
    filterMessages()
  }, [searchQuery, selectedChatbot, allMessages])

  const loadAllMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/dashboard/all-messages")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Loaded all messages:", data.messages?.length || 0)
        setAllMessages(data.messages || [])
        calculateStats(data.messages || [])
      }
    } catch (error) {
      console.error("[v0] Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (messages: any[]) => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const todayMessages = messages.filter((m) => new Date(m.timestamp) >= todayStart).length

    // Top questions analysis
    const questionCounts = new Map<string, number>()
    messages.forEach((msg) => {
      const question = msg.user_message?.toLowerCase().trim()
      if (question) {
        questionCounts.set(question, (questionCounts.get(question) || 0) + 1)
      }
    })

    const topQuestions = Array.from(questionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([question, count]) => ({ question, count }))

    // Chatbot breakdown
    const chatbotCounts = new Map<number, { name: string; count: number }>()
    messages.forEach((msg) => {
      if (msg.chatbot_id) {
        const existing = chatbotCounts.get(msg.chatbot_id) || { name: msg.chatbot_name || "نامشخص", count: 0 }
        chatbotCounts.set(msg.chatbot_id, { ...existing, count: existing.count + 1 })
      }
    })

    const chatbotBreakdown = Array.from(chatbotCounts.entries())
      .map(([chatbotId, data]) => ({ chatbotId, name: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)

    // Hourly distribution
    const hourCounts = new Array(24).fill(0)
    messages.forEach((msg) => {
      const hour = new Date(msg.timestamp).getHours()
      hourCounts[hour]++
    })

    const hourlyDistribution = hourCounts.map((count, hour) => ({ hour, count }))

    setStats({
      totalMessages: messages.length,
      todayMessages,
      averageResponseTime: 2.5,
      topQuestions,
      chatbotBreakdown,
      hourlyDistribution,
    })
  }

  const filterMessages = () => {
    let filtered = allMessages

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (msg) =>
          msg.user_message?.toLowerCase().includes(query) ||
          msg.bot_response?.toLowerCase().includes(query) ||
          msg.user_ip?.includes(query),
      )
    }

    if (selectedChatbot !== "all") {
      filtered = filtered.filter((msg) => msg.chatbot_id === Number(selectedChatbot))
    }

    setFilteredMessages(filtered)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تحلیل پیام‌ها</h1>
          <p className="text-gray-600 mt-1">در حال بارگذاری اطلاعات...</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">تحلیل پیام‌ها و رفتار کاربران</h1>
        <p className="text-gray-600 mt-1">مشاهده و تحلیل تمام مکالمات با چت‌بات‌های شما</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              کل پیام‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{stats.totalMessages}</p>
            <p className="text-sm text-gray-500 mt-1">پیام دریافت شده</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              پیام‌های امروز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{stats.todayMessages}</p>
            <p className="text-sm text-gray-500 mt-1">پیام جدید</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              میانگین پاسخ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">{stats.averageResponseTime}s</p>
            <p className="text-sm text-gray-500 mt-1">زمان پاسخگویی</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              چت‌بات‌های فعال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-600">{stats.chatbotBreakdown.length}</p>
            <p className="text-sm text-gray-500 mt-1">چت‌بات</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="rounded-2xl border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="جستجو در پیام‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rounded-xl"
              />
            </div>
            <select
              value={selectedChatbot}
              onChange={(e) => setSelectedChatbot(e.target.value)}
              className="px-4 py-2 border rounded-xl bg-white min-w-[200px]"
            >
              <option value="all">همه چت‌بات‌ها</option>
              {stats.chatbotBreakdown.map((cb) => (
                <option key={cb.chatbotId} value={cb.chatbotId}>
                  {cb.name} ({cb.count} پیام)
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="conversations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto bg-blue-50 rounded-2xl p-2">
          <TabsTrigger
            value="conversations"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <MessageSquare className="ml-2 h-4 w-4" />
            مکالمات ({filteredMessages.length})
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <BarChart3 className="ml-2 h-4 w-4" />
            تحلیل رفتار
          </TabsTrigger>
          <TabsTrigger
            value="frequent"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <TrendingUp className="ml-2 h-4 w-4" />
            سوالات پرتکرار
          </TabsTrigger>
        </TabsList>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-4">
          {filteredMessages.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">پیامی یافت نشد</h3>
                <p className="text-gray-600">با معیارهای جستجوی فعلی، پیامی برای نمایش وجود ندارد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[800px] overflow-y-auto">
              {filteredMessages.map((msg) => (
                <Card key={msg.id} className="rounded-2xl border-2 hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="rounded-lg">
                          {msg.chatbot_name || "نامشخص"}
                        </Badge>
                        <Badge variant="outline" className="rounded-lg">
                          {msg.user_ip || "IP نامشخص"}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleString("fa-IR")}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                        <p className="text-xs font-bold text-blue-900 mb-1">سوال کاربر:</p>
                        <p className="text-sm text-blue-800">{msg.user_message}</p>
                      </div>
                      {msg.bot_response && (
                        <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
                          <p className="text-xs font-bold text-green-900 mb-1">پاسخ هوش مصنوعی:</p>
                          <p className="text-sm text-green-800 whitespace-pre-wrap">{msg.bot_response}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chatbot Breakdown */}
            <Card className="rounded-2xl border-2">
              <CardHeader>
                <CardTitle>توزیع پیام‌ها بر اساس چت‌بات</CardTitle>
                <CardDescription>تعداد پیام‌های دریافتی هر چت‌بات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.chatbotBreakdown.map((cb, index) => (
                    <div key={cb.chatbotId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{cb.name}</span>
                      </div>
                      <Badge className="bg-blue-600 rounded-lg">{cb.count} پیام</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hourly Distribution */}
            <Card className="rounded-2xl border-2">
              <CardHeader>
                <CardTitle>توزیع ساعتی پیام‌ها</CardTitle>
                <CardDescription>فعالیت کاربران در طول شبانه‌روز</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.hourlyDistribution
                    .filter((h) => h.count > 0)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((hour) => (
                      <div key={hour.hour} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 w-16">
                          {hour.hour}:00 - {hour.hour + 1}:00
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full flex items-center justify-end px-3"
                            style={{
                              width: `${(hour.count / Math.max(...stats.hourlyDistribution.map((h) => h.count))) * 100}%`,
                            }}
                          >
                            <span className="text-white text-xs font-bold">{hour.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Frequent Questions Tab */}
        <TabsContent value="frequent" className="space-y-6">
          <Card className="rounded-2xl border-2">
            <CardHeader>
              <CardTitle>سوالات پرتکرار کاربران</CardTitle>
              <CardDescription>بیشترین سوالاتی که از چت‌بات‌های شما پرسیده می‌شود</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">هنوز داده کافی برای تحلیل سوالات پرتکرار وجود ندارد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topQuestions.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <Badge className="bg-purple-600 rounded-lg">{item.count} بار پرسیده شده</Badge>
                          </div>
                          <p className="text-gray-800 font-medium">{item.question}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
