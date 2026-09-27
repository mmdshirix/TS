"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Zap, Clock, CheckCircle2, RefreshCw, ExternalLink, Sparkles } from "lucide-react"
import Link from "next/link"

interface SubscriptionStatusProps {
  userEmail: string
  userPhone: string
  initialStatus?: string
  initialDaysRemaining?: number
}

interface StatusData {
  subscription_type: "demo" | "mini" | "pro" | null
  has_subscription: boolean
  has_demo: boolean
  days_remaining?: number
}

const PURCHASE_URLS = {
  mini: "https://talksell.ir/?add-to-cart=23902&quantity=1&e-redirect=https://talksell.ir/checkout/",
  pro: "https://talksell.ir/?add-to-cart=23900&quantity=1&e-redirect=https://talksell.ir/checkout/",
}

function normalizePhoneForTalkSell(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")

  // Handle different formats:
  // 989028655392 -> 09028655392
  // +989028655392 -> 09028655392
  // 09028655392 -> 09028655392
  // 9028655392 -> 09028655392

  if (digits.startsWith("98") && digits.length === 12) {
    // Format: 989028655392 -> 09028655392
    return "0" + digits.slice(2)
  } else if (digits.startsWith("0") && digits.length === 11) {
    // Already correct: 09028655392
    return digits
  } else if (digits.length === 10 && !digits.startsWith("0")) {
    // Format: 9028655392 -> 09028655392
    return "0" + digits
  }

  return digits
}

export default function SubscriptionStatus({
  userEmail,
  userPhone,
  initialStatus = "trial",
  initialDaysRemaining = 30,
}: SubscriptionStatusProps) {
  const [status, setStatus] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const normalizedPhone = normalizePhoneForTalkSell(userPhone)

  const checkStatus = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setIsRefreshing(true)

      try {
        console.log("[v0] Checking subscription status for:", { userEmail, normalizedPhone })

        const response = await fetch(
          `/api/talksell/check-status?email=${encodeURIComponent(userEmail)}&phone=${encodeURIComponent(normalizedPhone)}`,
        )
        const data = await response.json()

        console.log("[v0] Subscription check response:", data)

        if (data.success) {
          setStatus(data)
          setLastUpdated(new Date())

          if (data.subscription_type && data.subscription_type !== initialStatus) {
            console.log("[v0] Subscription changed! Updating local database...")
            await fetch("/api/user/update-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscription_type: data.subscription_type }),
            })
            // Status will update automatically in the UI without reload
          }
        }
      } catch (error) {
        console.error("[v0] Error checking subscription status:", error)
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    },
    [userEmail, normalizedPhone, initialStatus],
  )

  useEffect(() => {
    checkStatus()
    const interval = setInterval(() => checkStatus(), 5000)
    return () => clearInterval(interval)
  }, [checkStatus])

  const getStatusCard = () => {
    const isPro = status?.subscription_type === "pro"
    const isMini = status?.subscription_type === "mini"
    const isDemo = status?.has_demo || initialStatus === "trial" || initialStatus === "demo"

    if (isPro) {
      return (
        <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 text-white rounded-3xl border-0 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                  <Crown className="w-12 h-12 text-yellow-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-3xl font-bold">اشتراک حرفه‌ای</h3>
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </div>
                  <p className="text-purple-100 text-lg mt-1">دسترسی کامل به تمام امکانات</p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-green-300" />
                <span className="text-sm text-green-200 mt-1">فعال</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-purple-200">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>آخرین به‌روزرسانی: {lastUpdated?.toLocaleTimeString("fa-IR")}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => checkStatus(true)}
                className="text-white hover:bg-white/10 rounded-xl mr-2"
              >
                بررسی مجدد
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (isMini) {
      return (
        <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white rounded-3xl border-0 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                  <Zap className="w-12 h-12 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">اشتراک پایه</h3>
                  <p className="text-blue-100 text-lg mt-1">دسترسی به امکانات اصلی</p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-green-300" />
                <span className="text-sm text-green-200 mt-1">فعال</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>آخرین به‌روزرسانی: {lastUpdated?.toLocaleTimeString("fa-IR")}</span>
              </div>
              <Link href={PURCHASE_URLS.pro} target="_blank">
                <Button size="sm" className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
                  <Crown className="w-4 h-4 ml-2" />
                  ارتقا به حرفه‌ای
                  <ExternalLink className="w-4 h-4 mr-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Demo or trial
    return (
      <Card className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white rounded-3xl border-0 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <CardContent className="p-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <Clock className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">دوره آزمایشی رایگان</h3>
                <p className="text-amber-100 text-lg mt-1">
                  {status?.days_remaining || initialDaysRemaining} روز باقی‌مانده از ۳۰ روز
                </p>
              </div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur rounded-2xl p-4 shadow-lg">
              <div className="text-5xl font-bold">{status?.days_remaining || initialDaysRemaining}</div>
              <div className="text-sm text-amber-100">روز باقی‌مانده</div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <Link href={PURCHASE_URLS.mini} target="_blank" className="block">
              <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg shadow-lg transition-transform hover:scale-105">
                <Zap className="w-5 h-5 ml-2" />
                خرید اشتراک پایه
              </Button>
            </Link>
            <Link href={PURCHASE_URLS.pro} target="_blank" className="block">
              <Button className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-lg shadow-lg transition-transform hover:scale-105">
                <Crown className="w-5 h-5 ml-2" />
                خرید اشتراک حرفه‌ای
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-amber-100">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>آخرین به‌روزرسانی: {lastUpdated?.toLocaleTimeString("fa-IR")}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => checkStatus(true)}
              className="text-white hover:bg-white/10 rounded-xl mr-2"
            >
              بررسی مجدد
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            <span className="text-gray-600 text-lg">در حال بررسی وضعیت اشتراک...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <div className="space-y-4">{getStatusCard()}</div>
}
