"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CreditCard, Clock, Sparkles, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"
import { PURCHASE_URLS } from "@/lib/talksell-api"

export default function SubscriptionExpiredPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handlePurchaseMini = () => {
    window.open(PURCHASE_URLS.mini, "_blank")
  }

  const handlePurchasePro = () => {
    window.open(PURCHASE_URLS.pro, "_blank")
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-red-900 flex items-center justify-center p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-3xl p-8 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">اشتراک شما به پایان رسیده است</h1>

          <p className="text-xl text-red-200 mb-8 leading-relaxed">
            دسترسی شما به پنل کاربری و چت‌بات‌ها متوقف شده است.
            <br />
            برای ادامه استفاده از خدمات، لطفاً اشتراک خود را تمدید کنید.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <Clock className="w-8 h-8 text-orange-400 mb-3 mx-auto" />
              <h3 className="text-lg font-bold text-white mb-2">دسترسی پنل</h3>
              <p className="text-red-200 text-sm">تا زمان تمدید اشتراک، دسترسی به داشبورد و تنظیمات شما مسدود است</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <CreditCard className="w-8 h-8 text-orange-400 mb-3 mx-auto" />
              <h3 className="text-lg font-bold text-white mb-2">ویجت چت‌بات</h3>
              <p className="text-red-200 text-sm">چت‌بات‌های شما در سایت‌ها نمایش داده نمی‌شود و کار نمی‌کند</p>
            </div>
          </div>

          <div className="w-full mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">انتخاب پلن اشتراک</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mini Plan */}
              <div className="bg-white/10 rounded-2xl p-6 border border-blue-400/30 hover:border-blue-400/60 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">پلن پایه (Mini)</h4>
                <p className="text-blue-200 text-sm mb-4">مناسب برای کسب‌وکارهای کوچک</p>
                <ul className="text-right text-sm text-blue-100 mb-6 space-y-2">
                  <li>✓ ۱ چت‌بات</li>
                  <li>✓ ۱۰۰۰ پیام در ماه</li>
                  <li>✓ پشتیبانی ایمیلی</li>
                </ul>
                <Button
                  onClick={handlePurchaseMini}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl"
                >
                  خرید پلن پایه
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="bg-white/10 rounded-2xl p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  محبوب‌ترین
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">پلن حرفه‌ای (Pro)</h4>
                <p className="text-purple-200 text-sm mb-4">مناسب برای کسب‌وکارهای در حال رشد</p>
                <ul className="text-right text-sm text-purple-100 mb-6 space-y-2">
                  <li>✓ ۵ چت‌بات</li>
                  <li>✓ ۱۰,۰۰۰ پیام در ماه</li>
                  <li>✓ پشتیبانی اولویت‌دار</li>
                  <li>✓ تحلیل پیشرفته</li>
                </ul>
                <Button
                  onClick={handlePurchasePro}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl"
                >
                  خرید پلن حرفه‌ای
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            className="w-full max-w-md bg-white/10 hover:bg-white/20 text-white font-semibold py-6 rounded-2xl"
          >
            خروج از حساب کاربری
          </Button>

          <p className="text-red-200 text-sm mt-6">برای راهنمایی و پشتیبانی با ما تماس بگیرید</p>
        </div>
      </Card>
    </div>
  )
}
