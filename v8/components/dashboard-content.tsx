"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Ticket, TrendingUp, Plus, Settings } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import SubscriptionUsageDashboard from "@/components/subscription-usage-dashboard"

interface DashboardStats {
  activeChatbots: number
  totalConversations: number
  openTickets: number
  satisfaction: number
  totalMessages: number
  chatbotsGrowth: number
  conversationsGrowth: number
}

export default function DashboardContent({ user }: { user: User }) {
  const [stats, setStats] = useState<DashboardStats>({
    activeChatbots: 0,
    totalConversations: 0,
    openTickets: 0,
    satisfaction: 0,
    totalMessages: 0,
    chatbotsGrowth: 0,
    conversationsGrowth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [defaultTone, setDefaultTone] = useState<string>("friendly")
  const [savingTone, setSavingTone] = useState(false)

  useEffect(() => {
    const fetchDefaultTone = async () => {
      try {
        const response = await fetch("/api/dashboard/chatbots")
        if (response.ok) {
          const chatbots = await response.json()
          if (chatbots.length > 0) {
            // Get the most common tone among user's chatbots
            setDefaultTone(chatbots[0].response_tone || "friendly")
          }
        }
      } catch (error) {
        console.error("Error fetching default tone:", error)
      }
    }

    fetchDefaultTone()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("[v0] Fetching dashboard statistics...")
        const response = await fetch("/api/dashboard/stats")
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Stats loaded:", data)
          setStats(data)
        } else {
          console.error("[v0] Failed to fetch stats:", response.status)
        }
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleToneChange = async (newTone: string) => {
    console.log("[v0] Tone change requested:", newTone)
    setDefaultTone(newTone) // Update UI immediately for better UX
    setSavingTone(true)

    try {
      console.log("[v0] Sending tone update to API...")
      const response = await fetch("/api/dashboard/update-default-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone: newTone }),
      })

      const data = await response.json()
      console.log("[v0] API response:", data)

      if (!response.ok) {
        console.error("[v0] Failed to update tone:", data)
        // Revert the change if API fails
        const fetchDefaultTone = async () => {
          try {
            const response = await fetch("/api/dashboard/chatbots")
            if (response.ok) {
              const chatbots = await response.json()
              if (chatbots.length > 0) {
                setDefaultTone(chatbots[0].response_tone || "friendly")
              }
            }
          } catch (error) {
            console.error("[v0] Error fetching default tone:", error)
          }
        }
        fetchDefaultTone()
      } else {
        console.log("[v0] Tone updated successfully to:", newTone)
      }
    } catch (error) {
      console.error("[v0] Error updating tone:", error)
      // Revert the change on error
      setDefaultTone(defaultTone)
    } finally {
      setSavingTone(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Subscription Usage Dashboard */}
      <SubscriptionUsageDashboard />

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            سلام، {user.first_name} {user.last_name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">به داشبورد خود خوش آمدید</p>
        </div>
        <Link href="/dashboard/chatbots/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl shadow-lg text-sm sm:text-base py-5 sm:py-2.5">
            <Plus className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            ساخت چت‌بات جدید
          </Button>
        </Link>
      </div>

      {/* Default Tone Settings Card */}
      <Card className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
            تنظیمات پیش‌فرض پاسخ‌دهی
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">سبک پاسخ‌دهی چت‌بات‌های خود را انتخاب کنید</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Label htmlFor="default-tone" className="text-sm sm:text-base font-medium text-gray-900">
                سبک پاسخ‌دهی:
              </Label>
              <Select value={defaultTone} onValueChange={handleToneChange} disabled={savingTone}>
                <SelectTrigger
                  id="default-tone"
                  className="w-full sm:w-[300px] rounded-xl border-2 bg-white text-gray-900"
                >
                  <SelectValue placeholder="انتخاب سبک" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white border-2 shadow-lg">
                  <SelectItem value="friendly" className="rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-100">
                    <div className="flex items-center gap-2">
                      <span>🌟</span>
                      <span>دوستانه و باهوش</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="concise" className="rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-100">
                    <div className="flex items-center gap-2">
                      <span>⚡</span>
                      <span>مختصر و مفید</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="professional"
                    className="rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-100"
                  >
                    <div className="flex items-center gap-2">
                      <span>💼</span>
                      <span>حرفه‌ای</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="intelligent"
                    className="rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-100"
                  >
                    <div className="flex items-center gap-2">
                      <span>🧠</span>
                      <span>هوشمند و تحلیلی</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {savingTone && <span className="text-xs sm:text-sm text-gray-500">در حال ذخیره...</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
              <div className="p-3 rounded-xl bg-white border-2 border-blue-200">
                <div className="font-medium text-xs sm:text-sm text-blue-900 mb-1">🌟 دوستانه و باهوش</div>
                <div className="text-[10px] sm:text-xs text-gray-600">
                  پاسخ‌های کوتاه و هوشمند با ایموجی برای شروع مکالمه
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border-2 border-green-200">
                <div className="font-medium text-xs sm:text-sm text-green-900 mb-1">⚡ مختصر و مفید</div>
                <div className="text-[10px] sm:text-xs text-gray-600">مستقیم به اصل مطلب، بدون حاشیه</div>
              </div>
              <div className="p-3 rounded-xl bg-white border-2 border-purple-200">
                <div className="font-medium text-xs sm:text-sm text-purple-900 mb-1">💼 حرفه‌ای</div>
                <div className="text-[10px] sm:text-xs text-gray-600">رسمی، محترمانه و قابل اعتماد</div>
              </div>
              <div className="p-3 rounded-xl bg-white border-2 border-orange-200">
                <div className="font-medium text-xs sm:text-sm text-orange-900 mb-1">🧠 هوشمند و تحلیلی</div>
                <div className="text-[10px] sm:text-xs text-gray-600">جامع، تفصیلی با توضیحات فنی</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="rounded-2xl border-2 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">چت‌بات‌های فعال</CardTitle>
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">{loading ? "..." : stats.activeChatbots}</div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              <span className={stats.chatbotsGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.chatbotsGrowth >= 0 ? "+" : ""}
                {stats.chatbotsGrowth}%
              </span>{" "}
              نسبت به ماه قبل
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">تعداد مکالمات</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">{loading ? "..." : stats.totalConversations}</div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              <span className={stats.conversationsGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.conversationsGrowth >= 0 ? "+" : ""}
                {stats.conversationsGrowth}%
              </span>{" "}
              نسبت به هفته قبل
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">تیکت‌های باز</CardTitle>
            <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">{loading ? "..." : stats.openTickets}</div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">نیاز به پیگیری</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">رضایت کاربران</CardTitle>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">{loading ? "..." : stats.satisfaction}%</div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">میانگین امتیاز</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-2xl border-2">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">اقدامات سریع</CardTitle>
          <CardDescription className="text-xs sm:text-sm">دسترسی سریع به امکانات پرکاربرد</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Link href="/dashboard/chatbots/new" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 sm:py-4 rounded-2xl border-2 hover:shadow-lg active:shadow-md bg-transparent"
              >
                <div className="flex items-start gap-3 text-right w-full">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm sm:text-base">ساخت چت‌بات</div>
                    <div className="text-xs sm:text-sm text-gray-500">چت‌بات جدید بسازید</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/analytics" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 sm:py-4 rounded-2xl border-2 hover:shadow-lg active:shadow-md bg-transparent"
              >
                <div className="flex items-start gap-3 text-right w-full">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm sm:text-base">مشاهده آمار</div>
                    <div className="text-xs sm:text-sm text-gray-500">تحلیل عملکرد</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/settings" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 sm:py-4 rounded-2xl border-2 hover:shadow-lg active:shadow-md bg-transparent sm:col-span-2 md:col-span-1"
              >
                <div className="flex items-start gap-3 text-right w-full">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm sm:text-base">تنظیمات</div>
                    <div className="text-xs sm:text-sm text-gray-500">مدیریت حساب</div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      <Card className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg">شروع کنید</CardTitle>
              <CardDescription className="text-xs sm:text-sm">چند قدم ساده تا راه‌اندازی اولین چت‌بات</CardDescription>
            </div>
            <Badge className="bg-blue-600 text-white rounded-xl px-3 sm:px-4 py-1 text-xs sm:text-sm">راهنما</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 shadow-lg">
                1
              </div>
              <div>
                <div className="font-medium text-blue-900 text-sm sm:text-base">چت‌بات خود را بسازید</div>
                <div className="text-xs sm:text-sm text-blue-700">نام و تنظیمات اولیه را مشخص کنید</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 shadow-lg">
                2
              </div>
              <div>
                <div className="font-medium text-blue-900 text-sm sm:text-base">ظاهر را شخصی‌سازی کنید</div>
                <div className="text-xs sm:text-sm text-blue-700">رنگ‌ها، سوالات و محصولات را تنظیم کنید</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 shadow-lg">
                3
              </div>
              <div>
                <div className="font-medium text-blue-900 text-sm sm:text-base">در وب‌سایت نصب کنید</div>
                <div className="text-xs sm:text-sm text-blue-700">کد embed را کپی کرده و در سایت قرار دهید</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
