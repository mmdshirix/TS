"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sparkles,
  MessageCircle,
  Users,
  Ticket,
  TrendingUp,
  BarChart3,
  Clock,
  RefreshCw,
  ChevronDown,
} from "lucide-react"

interface AdminPanelData {
  chatbot: { id: number; name: string; multiplier: number }
  stats: {
    totalMessages: number
    uniqueUsers: number
    avgMessagesPerUser: number
    todayMessages: number
    thisWeekMessages: number
    todayGrowth: number
    activeTickets: number
    resolvedTickets: number
  }
  messages: Array<{
    id: number
    user_message: string
    bot_response: string
    timestamp: string
    user_ip: string
  }>
  todayMessages: Array<{
    id: number
    user_message: string
    bot_response: string
    timestamp: string
    user_ip: string
  }>
  tickets: Array<{
    id: number
    subject: string
    message: string
    status: string
    priority: string
    created_at: string
  }>
  analytics: {
    dailyData: Array<{ name: string; value: number }>
    weeklyData: Array<{ name: string; value: number }>
    monthlyData: Array<{ name: string; value: number }>
    hourlyData: Array<{ name: string; value: number }>
    responseTimeData: Array<{ name: string; value: number }>
    userEngagement: Array<{ name: string; messages: number; users: number }>
    topQuestions: Array<{ question: string; count: number; lastAsked: string }>
  }
  meta: {
    timestamp: string
    dataSource: string
    multiplier: number
    baseStats?: any
  }
}

export default function ModernAdminPanel() {
  const params = useParams()
  const router = useRouter()
  const chatbotId = params.id as string
  const [data, setData] = useState<AdminPanelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [allChatbots, setAllChatbots] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    fetchData()
    fetchAllChatbots()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [chatbotId])

  const fetchData = async () => {
    try {
      setError(null)
      console.log(`🔄 Fetching data for chatbot ${chatbotId}`)

      const response = await fetch(`/api/admin-panel/${chatbotId}/data`, {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      })

      console.log(`📡 Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log(`✅ Data received:`, {
        chatbot: result.chatbot?.name,
        messages: result.messages?.length || 0,
        tickets: result.tickets?.length || 0,
        stats: result.stats,
        dataSource: result.meta?.dataSource,
      })

      setData(result)
      setLastUpdate(new Date().toLocaleTimeString("fa-IR"))
    } catch (error) {
      console.error("❌ Error fetching admin panel data:", error)
      setError(error instanceof Error ? error.message : "خطا در اتصال به سرور")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllChatbots = async () => {
    try {
      const response = await fetch("/api/chatbots")
      if (response.ok) {
        const chatbots = await response.json()
        setAllChatbots(chatbots.map((c: any) => ({ id: c.id, name: c.name })))
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error)
    }
  }

  const switchChatbot = (newChatbotId: number) => {
    router.push(`/admin-panel/${newChatbotId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">در حال بارگذاری پنل مدیریت...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😔</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">خطا در بارگذاری</h2>
            <p className="text-gray-600 mb-6">{error || "امکان دسترسی به اطلاعات وجود ندارد"}</p>
            <div className="space-y-2">
              <Button
                onClick={fetchData}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                تلاش مجدد
              </Button>
              <Button variant="outline" onClick={() => router.push("/debug-admin")} className="w-full">
                صفحه عیب‌یابی
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  پنل مدیریت هوشمند
                </h1>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                        <div className="flex items-center gap-2">
                          <p className="text-gray-600 font-medium">{data?.chatbot.name}</p>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-64 bg-white rounded-xl shadow-lg border-2 max-h-96 overflow-y-auto"
                    >
                      {allChatbots.map((chatbot) => (
                        <DropdownMenuItem
                          key={chatbot.id}
                          onClick={() => switchChatbot(chatbot.id)}
                          className={`cursor-pointer hover:bg-gray-100 rounded-lg p-3 ${
                            chatbot.id === Number(chatbotId) ? "bg-blue-50 font-bold" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🤖</span>
                            <span>{chatbot.name}</span>
                            {chatbot.id === Number(chatbotId) && (
                              <Badge variant="default" className="mr-auto">
                                فعال
                              </Badge>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {allChatbots.length === 0 && (
                        <div className="p-3 text-center text-gray-500 text-sm">چت‌بات دیگری موجود نیست</div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {data?.chatbot.multiplier !== 1 && (
                    <Badge variant="secondary">ضریب: {data.chatbot.multiplier}x</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">آخرین به‌روزرسانی: {lastUpdate}</div>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Connection Status */}
        <div className="mb-6">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${data.meta.dataSource === "database" ? "bg-green-500" : "bg-yellow-500"}`}
                  ></div>
                  <span className="text-sm font-medium">
                    {data.meta.dataSource === "database" ? "متصل به دیتابیس" : "حالت آفلاین"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  چت‌بات #{chatbotId} |{" "}
                  {data.meta.timestamp ? new Date(data.meta.timestamp).toLocaleString("fa-IR") : ""}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">پیام‌های امروز</p>
                  <p className="text-3xl font-bold">{data.stats.todayMessages}</p>
                  {data.meta.baseStats && (
                    <p className="text-xs text-blue-200">واقعی: {data.meta.baseStats.todayMessages}</p>
                  )}
                </div>
                <MessageCircle className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">کل کاربران</p>
                  <p className="text-3xl font-bold">{data.stats.uniqueUsers}</p>
                  {data.meta.baseStats && (
                    <p className="text-xs text-green-200">واقعی: {data.meta.baseStats.uniqueUsers}</p>
                  )}
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">تیکت‌های فعال</p>
                  <p className="text-3xl font-bold">{data.stats.activeTickets}</p>
                  {data.meta.baseStats && (
                    <p className="text-xs text-orange-200">واقعی: {data.meta.baseStats.activeTickets}</p>
                  )}
                </div>
                <Ticket className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">کل پیام‌ها</p>
                  <p className="text-3xl font-bold">{data.stats.totalMessages}</p>
                  {data.meta.baseStats && (
                    <p className="text-xs text-purple-200">واقعی: {data.meta.baseStats.totalMessages}</p>
                  )}
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              📊 نمای کلی
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              💬 مکالمات
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              🎫 تیکت‌ها
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              📈 تحلیل‌ها
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    آمار پیام‌های روزانه
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <p className="text-gray-600">نمودار آمار روزانه</p>
                      <div className="mt-4 grid grid-cols-7 gap-2">
                        {data.analytics.dailyData.map((day, index) => (
                          <div key={index} className="text-center">
                            <div className="text-xs text-gray-500">{day.name}</div>
                            <div className="text-sm font-bold">{day.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    پیام‌های ساعتی امروز
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 overflow-y-auto">
                    <div className="space-y-1">
                      {data.analytics.hourlyData
                        .filter((hour) => hour.value > 0)
                        .map((hour, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{hour.name}</span>
                            <span className="font-bold">{hour.value} پیام</span>
                          </div>
                        ))}
                      {data.analytics.hourlyData.every((hour) => hour.value === 0) && (
                        <div className="text-center py-8 text-gray-500">امروز هیچ پیامی دریافت نشده است</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Questions */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🔥 سوالات پرتکرار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.analytics.topQuestions.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.question}</p>
                        <p className="text-xs text-gray-500">{item.count} بار پرسیده شده</p>
                      </div>
                      <span className="text-lg">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅"}
                      </span>
                    </div>
                  ))}
                  {data.analytics.topQuestions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>هنوز سوالی پرسیده نشده است</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">💬 مکالمات اخیر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {data.messages.map((message, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="bg-blue-50 p-3 rounded-lg mb-2">
                        <p className="text-sm font-medium text-blue-900">کاربر:</p>
                        <p className="text-gray-800">{message.user_message}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-900">پاسخ AI:</p>
                        <p className="text-gray-800">{message.bot_response}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(message.timestamp).toLocaleString("fa-IR")} - IP: {message.user_ip}
                      </p>
                    </div>
                  ))}
                  {data.messages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>هیچ پیامی دریافت نشده است</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🎫 تیکت‌های پشتیبانی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.tickets.map((ticket, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              ticket.status === "open"
                                ? "destructive"
                                : ticket.status === "closed"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {ticket.status === "open" ? "باز" : ticket.status === "closed" ? "بسته" : "در حال بررسی"}
                          </Badge>
                          <Badge variant="outline">
                            {ticket.priority === "high" ? "بالا" : ticket.priority === "medium" ? "متوسط" : "پایین"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{ticket.message}</p>
                      <p className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleString("fa-IR")}</p>
                    </div>
                  ))}
                  {data.tickets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>هیچ تیکتی وجود ندارد</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>📅 آمار هفتگی</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.analytics.weeklyData.map((week, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{week.name}</span>
                        <span className="font-bold">{week.value} پیام</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>📊 آمار ماهانه</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.analytics.monthlyData.map((month, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{month.name}</span>
                        <span className="font-bold">{month.value} پیام</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  تعامل کاربران
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-right py-2 px-4 border-b">روز</th>
                        <th className="text-right py-2 px-4 border-b">تعداد پیام</th>
                        <th className="text-right py-2 px-4 border-b">کاربران منحصر به فرد</th>
                        <th className="text-right py-2 px-4 border-b">میانگین پیام هر کاربر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.analytics.userEngagement.map((day, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                          <td className="py-2 px-4">{day.name}</td>
                          <td className="py-2 px-4">{day.messages}</td>
                          <td className="py-2 px-4">{day.users}</td>
                          <td className="py-2 px-4">
                            {day.users > 0 ? Math.round((day.messages / day.users) * 10) / 10 : 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
