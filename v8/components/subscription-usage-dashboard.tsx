"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Package,
  Users,
  Ticket,
  Link,
  Clock,
  AlertTriangle,
  Crown,
  TrendingUp,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
} from "lucide-react"

interface UsageData {
  used: number
  limit: number
  percentage: number
  remaining: number
}

interface SubscriptionStatus {
  planName: string
  planNameEn: string
  isDemo: boolean
  isActive: boolean
  isExpired: boolean
  daysRemaining: number
  expiryDate: string | null
  limits: any
  usage: {
    ai_tokens: UsageData
    products: UsageData
    sales_advisor: UsageData
    cta_links: UsageData
    tickets: UsageData
    messages: UsageData
  }
  shouldFreeze: boolean
  freezeReason: string | null
}

const UPGRADE_URL = "https://talksell.ir/تعرفه-ها/"

export default function SubscriptionUsageDashboard() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await fetch("/api/user/subscription-status", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        console.log("[SubscriptionDashboard] Status received:", data.planNameEn, "Usage:", data.usage)
        setStatus(data)
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error)
    }
    setLoading(false)
    setRefreshing(false)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchSubscriptionStatus()
  }

  const getRemainingColor = (remaining: number, limit: number) => {
    if (limit === -1 || limit === 999999) return "bg-green-500" // Unlimited
    const remainingPercent = (remaining / limit) * 100
    if (remainingPercent <= 10) return "bg-red-500"
    if (remainingPercent <= 30) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "start":
        return <Zap className="w-6 h-6" />
      case "grow":
        return <TrendingUp className="w-6 h-6" />
      case "scale":
        return <Crown className="w-6 h-6" />
      default:
        return <Zap className="w-6 h-6" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case "start":
        return "from-green-500 to-emerald-600"
      case "grow":
        return "from-blue-500 to-indigo-600"
      case "scale":
        return "from-purple-500 to-pink-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <Card className="p-6 bg-red-50 border-red-200 rounded-3xl">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-6 h-6" />
          <span>خطا در دریافت اطلاعات اشتراک</span>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="mr-auto rounded-xl bg-transparent">
            <RefreshCw className="w-4 h-4 ml-2" />
            تلاش مجدد
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Plan Header Card */}
      <Card
        className={`p-6 bg-gradient-to-r ${getPlanColor(status.planNameEn)} rounded-3xl text-white relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              {getPlanIcon(status.planNameEn)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">پلن {status.planName}</h2>
              <div className="flex items-center gap-2 mt-1">
                {status.isDemo ? (
                  <Badge className="bg-white/20 text-white rounded-xl">
                    <Clock className="w-3 h-3 ml-1" />
                    دوره آزمایشی
                  </Badge>
                ) : status.isActive ? (
                  <Badge className="bg-green-400/30 text-white rounded-xl">
                    <CheckCircle className="w-3 h-3 ml-1" />
                    فعال
                  </Badge>
                ) : (
                  <Badge className="bg-red-400/30 text-white rounded-xl">
                    <XCircle className="w-3 h-3 ml-1" />
                    منقضی
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-left">
              <div className="text-sm opacity-80">زمان باقی‌مانده</div>
              <div className="text-3xl font-bold">{status.daysRemaining} روز</div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="ghost"
              size="icon"
              className="bg-white/20 hover:bg-white/30 text-white rounded-xl"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Upgrade CTA for Demo or Low Days */}
        {(status.isDemo || status.daysRemaining <= 3 || status.shouldFreeze) && (
          <div className="mt-4 p-4 bg-white/10 rounded-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  {status.shouldFreeze
                    ? "منابع شما تمام شده است"
                    : status.isDemo
                      ? "برای دسترسی کامل، اشتراک تهیه کنید"
                      : "اشتراک شما در حال اتمام است"}
                </p>
                <p className="text-sm opacity-80 mt-1">از تمام امکانات بدون محدودیت استفاده کنید</p>
              </div>
              <Button asChild className="bg-white text-gray-900 hover:bg-gray-100 rounded-2xl font-bold">
                <a href={UPGRADE_URL} target="_blank" rel="noopener noreferrer">
                  ارتقا پلن
                  <ExternalLink className="w-4 h-4 mr-2" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Freeze Warning */}
      {status.shouldFreeze && (
        <Card className="p-6 bg-red-50 border-2 border-red-200 rounded-3xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800">محدودیت اشتراک</h3>
              <p className="text-red-600 mt-1">{status.freezeReason}</p>
              <Button asChild className="mt-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl">
                <a href={UPGRADE_URL} target="_blank" rel="noopener noreferrer">
                  ارتقا پلن
                  <ExternalLink className="w-4 h-4 mr-2" />
                </a>
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* AI Tokens - Show Remaining */}
        <RemainingCard
          title="توکن هوش مصنوعی"
          icon={<Zap className="w-5 h-5" />}
          usage={status.usage.ai_tokens}
          color="blue"
          formatValue={(val) => {
            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
            if (val >= 1000) return `${(val / 1000).toFixed(0)}K`
            return val.toLocaleString("fa-IR")
          }}
        />

        {/* Messages - Show Remaining */}
        <RemainingCard
          title="پیام‌های باقی‌مانده"
          icon={<MessageSquare className="w-5 h-5" />}
          usage={status.usage.messages}
          color="indigo"
          formatValue={(val) => val.toLocaleString("fa-IR")}
        />

        {/* Products - Show Remaining */}
        <RemainingCard
          title="ظرفیت محصولات"
          icon={<Package className="w-5 h-5" />}
          usage={status.usage.products}
          color="green"
        />

        {/* Sales Advisor - Show Remaining */}
        <RemainingCard
          title="مشاوره فروش"
          icon={<Users className="w-5 h-5" />}
          usage={status.usage.sales_advisor}
          color="purple"
        />

        {/* CTA Links - Show Remaining */}
        <RemainingCard
          title="لینک‌های CTA"
          icon={<Link className="w-5 h-5" />}
          usage={status.usage.cta_links}
          color="orange"
        />

        {/* Tickets - Show Remaining */}
        <RemainingCard
          title="تیکت پشتیبانی"
          icon={<Ticket className="w-5 h-5" />}
          usage={status.usage.tickets}
          color="pink"
        />
      </div>
    </div>
  )
}

function RemainingCard({
  title,
  icon,
  usage,
  color,
  formatValue = (val: number) => val.toString(),
}: {
  title: string
  icon: React.ReactNode
  usage: UsageData
  color: string
  formatValue?: (val: number) => string
}) {
  const colorClasses: Record<string, { bg: string; progress: string; text: string; light: string }> = {
    blue: { bg: "bg-blue-50", progress: "bg-blue-500", text: "text-blue-600", light: "bg-blue-100" },
    indigo: { bg: "bg-indigo-50", progress: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-100" },
    green: { bg: "bg-green-50", progress: "bg-green-500", text: "text-green-600", light: "bg-green-100" },
    purple: { bg: "bg-purple-50", progress: "bg-purple-500", text: "text-purple-600", light: "bg-purple-100" },
    orange: { bg: "bg-orange-50", progress: "bg-orange-500", text: "text-orange-600", light: "bg-orange-100" },
    pink: { bg: "bg-pink-50", progress: "bg-pink-500", text: "text-pink-600", light: "bg-pink-100" },
  }

  const colors = colorClasses[color] || colorClasses.blue

  // Calculate remaining percentage (100% = full, 0% = empty)
  const isUnlimited = usage.limit === -1 || usage.limit === 999999
  const remainingPercent = isUnlimited ? 100 : Math.max(0, ((usage.limit - usage.used) / usage.limit) * 100)

  // Determine progress bar color based on remaining
  let progressColor = colors.progress
  if (!isUnlimited) {
    if (remainingPercent <= 10) progressColor = "bg-red-500"
    else if (remainingPercent <= 30) progressColor = "bg-yellow-500"
  }

  return (
    <Card className={`p-4 ${colors.bg} border-0 rounded-2xl`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 ${colors.light} rounded-xl flex items-center justify-center ${colors.text}`}>
            {icon}
          </div>
          <span className="font-medium text-gray-700 text-sm">{title}</span>
        </div>
      </div>

      {/* Large remaining value */}
      <div className="mb-3">
        <span className={`text-2xl font-bold ${colors.text}`}>{isUnlimited ? "∞" : formatValue(usage.remaining)}</span>
        <span className="text-gray-500 text-sm mr-1">باقی‌مانده</span>
      </div>

      {/* Progress bar showing remaining (full = 100%, empty = 0%) */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${progressColor} rounded-full transition-all duration-500`}
          style={{ width: `${remainingPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatValue(usage.used)} استفاده شده</span>
        <span>از {isUnlimited ? "نامحدود" : formatValue(usage.limit)}</span>
      </div>
    </Card>
  )
}
