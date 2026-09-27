"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, Users, MessageSquare, ChevronDown } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

const earningsData = [
  { month: "Jan", value: 18500 },
  { month: "Feb", value: 19200 },
  { month: "Mar", value: 20100 },
  { month: "Apr", value: 21500 },
  { month: "May", value: 22850 },
]

const salesData = [
  { month: "Jan", current: 15000, last: 12000 },
  { month: "Feb", current: 16500, last: 14000 },
  { month: "Mar", current: 17200, last: 15500 },
  { month: "Apr", current: 18000, last: 16200 },
  { month: "May", current: 18361, last: 17000 },
]

const satisfactionData = [
  { name: "راضی", value: 96, color: "#3B82F6" },
  { name: "متوسط", value: 3, color: "#FFC107" },
  { name: "ناراضی", value: 1, color: "#EF4444" },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("14")
  const [sortBy, setSortBy] = useState("date")
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUsers: 0,
    satisfaction: 96,
    messagesGrowth: 12.5,
    usersGrowth: 8.3,
  })
  const [dailyMessages, setDailyMessages] = useState<Array<{ date: string; count: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/dashboard/stats")

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Analytics stats loaded:", data)

          setStats({
            totalMessages: data.totalMessages || 0,
            totalUsers: data.totalConversations || 0,
            satisfaction: 96,
            messagesGrowth: data.conversationsGrowth || 0,
            usersGrowth: data.conversationsGrowth || 0,
          })

          if (data.dailyMessages && data.dailyMessages.length > 0) {
            setDailyMessages(data.dailyMessages)
          }
        } else {
          console.error("[v0] Failed to fetch analytics:", response.status)
        }
      } catch (error) {
        console.error("[v0] Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [dateRange])

  const handleSortChange = (value: string) => {
    setSortBy(value)
    console.log("[v0] Sorting by:", value)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">آمار و تحلیل</h1>
          <p className="text-gray-600 mt-1">نمای کلی از عملکرد چت‌بات‌های شما</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] rounded-2xl border-2 bg-white">
              <Calendar className="h-4 w-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="7">7 روز گذشته</SelectItem>
              <SelectItem value="14">14 روز گذشته</SelectItem>
              <SelectItem value="30">30 روز گذشته</SelectItem>
              <SelectItem value="90">90 روز گذشته</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white overflow-hidden relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] border-white/30 bg-white/10 text-white rounded-xl text-xs">
                  <SelectValue placeholder="بازه زمانی" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="7">7 روز</SelectItem>
                  <SelectItem value="14">14 روز</SelectItem>
                  <SelectItem value="30">30 روز</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm opacity-90">کل مکالمات</p>
              <p className="text-4xl font-bold">{isLoading ? "..." : stats.totalMessages.toLocaleString()}</p>
              <p className="text-xs opacity-75">
                <span className="text-green-300">↑ {stats.messagesGrowth}%</span> نسبت به ماه قبل
              </p>
            </div>
            <div className="mt-4 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyMessages.slice(-5)}>
                  <Bar dataKey="count" fill="rgba(255,255,255,0.3)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 bg-gradient-to-br from-pink-400 to-pink-600 text-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] border-white/30 bg-white/10 text-white rounded-xl text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="7">7 روز</SelectItem>
                  <SelectItem value="14">14 روز</SelectItem>
                  <SelectItem value="30">30 روز</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm opacity-90">تعداد کاربران</p>
              <p className="text-4xl font-bold">{isLoading ? "..." : stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs opacity-75">
                <span className="text-green-300">↑ {stats.usersGrowth}%</span> نسبت به هفته قبل
              </p>
            </div>
            <div className="mt-4 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="rgba(255,255,255,0.5)"
                    fill="url(#pinkGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 bg-gradient-to-br from-green-400 to-green-600 text-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] border-white/30 bg-white/10 text-white rounded-xl text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="7">7 روز</SelectItem>
                  <SelectItem value="14">14 روز</SelectItem>
                  <SelectItem value="30">30 روز</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm opacity-90">رضایت کاربران</p>
              <p className="text-4xl font-bold">96%</p>
              <p className="text-xs opacity-75">میانگین امتیاز مثبت</p>
            </div>
            <div className="mt-4 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="rgba(255,255,255,0.5)"
                    fill="url(#greenGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[200px] rounded-2xl border-2 bg-white">
            <SelectValue placeholder="مرتب‌سازی بر اساس" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="date">تاریخ</SelectItem>
            <SelectItem value="messages">تعداد پیام</SelectItem>
            <SelectItem value="users">تعداد کاربر</SelectItem>
            <SelectItem value="satisfaction">رضایت</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-2 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">کاربران پاسخ داده شده و هدایت شده</h3>
                <p className="text-sm text-gray-600">تعداد مکالمات در 30 روز گذشته</p>
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="7">7 روز</SelectItem>
                  <SelectItem value="14">14 روز</SelectItem>
                  <SelectItem value="30">30 روز</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyMessages}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", r: 5 }}
                    name="تعداد مکالمات"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-sm text-gray-600">تعداد مکالمات</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">توزیع رضایت</h3>
                <p className="text-sm text-gray-600">نظرسنجی کاربران</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">96%</p>
                  <p className="text-sm text-gray-600">رضایت کلی</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {satisfactionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
