import { redirect } from "next/navigation"
import { getCurrentUser, isTrialActive, getTrialDaysRemaining } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Bell, Crown, ExternalLink, Zap, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const UPGRADE_URL = "https://talksell.ir/تعرفه-ها/"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const trialActive = await isTrialActive(user)
  const daysRemaining = await getTrialDaysRemaining(user)

  const getPlanInfo = (status: string) => {
    switch (status) {
      case "start":
        return {
          name: "پلن Start",
          icon: Zap,
          color: "from-green-500 to-emerald-600",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
        }
      case "grow":
        return {
          name: "پلن Grow",
          icon: TrendingUp,
          color: "from-blue-500 to-indigo-600",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
        }
      case "scale":
        return {
          name: "پلن Scale",
          icon: Crown,
          color: "from-purple-500 to-pink-600",
          bgColor: "bg-purple-50",
          textColor: "text-purple-700",
        }
      case "trial":
      default:
        return {
          name: "دوره آزمایشی",
          icon: Zap,
          color: "from-gray-500 to-gray-600",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
        }
    }
  }

  const planInfo = getPlanInfo(user.subscription_status || "trial")
  const PlanIcon = planInfo.icon

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">تنظیمات</h1>
        <p className="text-gray-600 mt-1">مدیریت حساب کاربری و تنظیمات</p>
      </div>

      <Card className={`rounded-3xl overflow-hidden border-0 bg-gradient-to-r ${planInfo.color}`}>
        <CardContent className="p-6 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <PlanIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{planInfo.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {trialActive ? (
                    <Badge className="bg-white/20 text-white rounded-xl text-sm">{daysRemaining} روز باقی‌مانده</Badge>
                  ) : (
                    <Badge className="bg-green-400/30 text-white rounded-xl text-sm">فعال</Badge>
                  )}
                </div>
              </div>
            </div>

            <Button asChild className="bg-white text-gray-900 hover:bg-gray-100 rounded-2xl font-bold shadow-lg">
              <a href={UPGRADE_URL} target="_blank" rel="noopener noreferrer">
                ارتقا پلن
                <ExternalLink className="w-4 h-4 mr-2" />
              </a>
            </Button>
          </div>

          <div className="relative mt-6 p-4 bg-white/10 rounded-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {user.subscription_status === "scale"
                    ? "نامحدود"
                    : user.subscription_status === "grow"
                      ? "۱.۵M"
                      : "۵۰۰K"}
                </div>
                <div className="text-sm opacity-80">توکن AI</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {user.subscription_status === "scale" ? "۵۰۰" : user.subscription_status === "grow" ? "۱۵۰" : "۵۰"}
                </div>
                <div className="text-sm opacity-80">محصول</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {user.subscription_status === "scale" ? "۵۰۰" : user.subscription_status === "grow" ? "۲۰۰" : "۲۰"}
                </div>
                <div className="text-sm opacity-80">مشاوره</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {user.subscription_status === "scale" ? "۲۰" : user.subscription_status === "grow" ? "۵" : "۱"}
                </div>
                <div className="text-sm opacity-80">لینک CTA</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(trialActive || user.subscription_status === "start") && (
        <Card className="rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">به پلن‌های بالاتر ارتقا دهید</h3>
                  <p className="text-gray-600 mt-1">
                    از امکانات بیشتر مثل همگام‌سازی محصولات، پیگیری سفارشات و توکن‌های نامحدود استفاده کنید
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold whitespace-nowrap"
              >
                <a href={UPGRADE_URL} target="_blank" rel="noopener noreferrer">
                  مشاهده تعرفه‌ها
                  <ExternalLink className="w-4 h-4 mr-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                اطلاعات حساب
              </CardTitle>
              <CardDescription>اطلاعات شخصی شما</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">نام</label>
              <p className="text-lg">{user.first_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">نام خانوادگی</label>
              <p className="text-lg">{user.last_name}</p>
            </div>
          </div>
          {user.email && (
            <div>
              <label className="text-sm font-medium text-gray-600">ایمیل</label>
              <p className="text-lg">{user.email}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-600">شماره تماس</label>
            <p className="text-lg" dir="ltr">
              +{user.phone}
            </p>
          </div>
          <Button variant="outline" className="rounded-xl bg-transparent">
            ویرایش اطلاعات
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                اعلان‌ها
              </CardTitle>
              <CardDescription>تنظیمات دریافت اعلان</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">پیام‌های جدید</p>
              <p className="text-sm text-gray-600">اعلان برای پیام‌های جدید</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
              فعال
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">تیکت‌های جدید</p>
              <p className="text-sm text-gray-600">اعلان برای تیکت‌های پشتیبانی</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
              فعال
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">گزارش هفتگی</p>
              <p className="text-sm text-gray-600">خلاصه آمار هفتگی</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
              غیرفعال
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
