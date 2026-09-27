"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loginWithPassword, registerUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  EyeOff,
  Bot,
  Sparkles,
  Zap,
  Shield,
  Phone,
  RefreshCw,
  User,
  Lock,
} from "lucide-react"

const carouselImages = [
  {
    icon: Bot,
    title: "چت‌بات هوشمند",
    description: "ساخت چت‌بات حرفه‌ای با آخرین مدل‌های هوش مصنوعی",
    color: "from-[#00B8CC] to-[#0086FF]",
  },
  {
    icon: Sparkles,
    title: "آمار و تحلیل داده‌ها",
    description: "مشاهده آمار دقیق مکالمات و تحلیل رفتار کاربران در لحظه",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "شخصی‌سازی پیشرفته",
    description: "تنظیمات ظاهری و عملکردی پیشرفته برای تطابق کامل با برند شما",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "نصب و راه‌اندازی آسان",
    description: "با کپی کردن یک خط کد ساده، چت‌بات را روی وب‌سایت خود فعال کنید",
    color: "from-emerald-500 to-teal-500",
  },
]

function getNextUrl(): string {
  if (typeof window === "undefined") return "/dashboard"
  const next = new URLSearchParams(window.location.search).get("next")
  // only allow same-origin relative paths
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
}

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  useEffect(() => {
    // /login?tab=register (used by the WordPress "build my site" hand-off)
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "register") {
      setActiveTab("register")
    }
  }, [])
  const [showPassword, setShowPassword] = useState(false)

  const [loginPhone, setLoginPhone] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  const [registerPhone, setRegisterPhone] = useState("")
  const [registerFirstName, setRegisterFirstName] = useState("")
  const [registerLastName, setRegisterLastName] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState("")

  const [currentSlide, setCurrentSlide] = useState(0)
  const [initializing, setInitializing] = useState(true)
  const [dbInitError, setDbInitError] = useState<string | null>(null)
  const [dbInitRetrying, setDbInitRetrying] = useState(false)

  const initDatabase = async () => {
    try {
      console.log("[v0] Initializing database...")
      setDbInitError(null)
      const response = await fetch("/api/database/init", { method: "POST" })
      const result = await response.json()
      console.log("[v0] Database initialization result:", result)

      if (!result.success) {
        setDbInitError(result.message || "خطا در راه‌اندازی پایگاه داده")
      }
    } catch (error: any) {
      console.error("[v0] Database initialization error:", error)
      setDbInitError(`خطا در ارتباط با سرور: ${error.message}`)
    } finally {
      setInitializing(false)
      setDbInitRetrying(false)
    }
  }

  useEffect(() => {
    initDatabase()
  }, [])

  const handleRetryInit = async () => {
    setDbInitRetrying(true)
    setInitializing(true)
    await initDatabase()
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const registerToTalkSell = async (phone: string, fullName: string) => {
    try {
      const response = await fetch("/api/talksell/register-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: `${phone}@talksell.ir`,
          name: fullName,
          phone: phone,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      return { success: false }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)

    if (!loginPhone || !loginPassword) {
      setLoginError("لطفاً تمام فیلدها را پر کنید")
      setLoginLoading(false)
      return
    }

    const phoneDigits = loginPhone.replace(/\D/g, "")

    if (!phoneDigits.startsWith("09") || phoneDigits.length !== 11) {
      setLoginError("شماره تلفن باید ۱۱ رقم باشد و با ۰۹ شروع شود")
      setLoginLoading(false)
      return
    }

    const localPhone = `98${phoneDigits.slice(1)}`

    try {
      const result = await loginWithPassword(localPhone, loginPassword)

      if (result.success) {
        console.log("[v0] Login successful, redirecting...")
        router.push(getNextUrl())
      } else {
        setLoginError(result.error || "رمز عبور یا شماره تلفن اشتباه است")
      }
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      setLoginError("خطا در ارتباط با سرور")
    }

    setLoginLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")
    setRegisterLoading(true)

    if (!registerPhone || !registerFirstName || !registerLastName || !registerPassword) {
      setRegisterError("لطفاً تمام فیلدها را پر کنید")
      setRegisterLoading(false)
      return
    }

    if (registerPassword.length < 6) {
      setRegisterError("رمز عبور باید حداقل ۶ کاراکتر باشد")
      setRegisterLoading(false)
      return
    }

    const phoneDigits = registerPhone.replace(/\D/g, "")

    if (!phoneDigits.startsWith("09") || phoneDigits.length !== 11) {
      setRegisterError("شماره تلفن باید ۱۱ رقم باشد و با ۰۹ شروع شود")
      setRegisterLoading(false)
      return
    }

    const talkSellPhone = phoneDigits
    const localPhone = `98${phoneDigits.slice(1)}`
    const fullName = `${registerFirstName} ${registerLastName}`

    try {
      const result = await registerUser(localPhone, registerFirstName, registerLastName, registerPassword)

      if (!result.success) {
        setRegisterError(result.error || "خطا در ثبت‌نام")
        setRegisterLoading(false)
        return
      }

      registerToTalkSell(talkSellPhone, fullName).catch(() => {
        // Silently fail - TalkSell registration is non-critical
      })

      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("[v0] Registration error:", error)
      setRegisterError("خطا در ارتباط با سرور")
      setRegisterLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-gray-900">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-[#00B8CC]/20 border-t-[#00B8CC] rounded-full animate-spin mx-auto" />
            <Bot className="w-10 h-10 text-[#00B8CC] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xl font-medium text-gray-600">
            {dbInitRetrying ? "در حال تلاش مجدد..." : "در حال راه‌اندازی سیستم..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 text-gray-900" dir="rtl">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-gradient-to-b from-white to-gray-50 p-6 text-center border-b border-gray-200">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B8CC] to-[#0086FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,184,204,0.25)]">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">
            TalkSell
          </h1>
        </div>
        <p className="text-sm text-gray-500">پلتفرم ساخت چت‌بات هوش مصنوعی</p>
      </div>

      {/* Left Side - Showcase Carousel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-12 flex-col justify-between relative overflow-hidden border-l border-gray-200">
        {/* Glow shapes */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00B8CC] rounded-full opacity-[0.06] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500 rounded-full opacity-[0.05] blur-3xl pointer-events-none" />

        <div className="z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00B8CC] to-[#0086FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,184,204,0.3)]">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              TalkSell
            </h1>
            <p className="text-xs text-gray-500">هوشمندسازی خدمات مشتریان</p>
          </div>
        </div>

        <div className="relative flex-1 flex items-center justify-center z-10 my-8">
          <div className="w-full max-w-lg">
            <div className="relative h-96 mb-8">
              {carouselImages.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ${
                      index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 h-full flex flex-col items-center justify-center border border-gray-200 shadow-xl">
                      <div
                        className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)]`}
                      >
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                      <p className="text-gray-500 text-center text-base leading-relaxed max-w-md">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-10 w-10 border border-gray-200"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              <div className="flex gap-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? "w-8 h-2 bg-[#00B8CC]"
                        : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselImages.length)}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-10 w-10 border border-gray-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="z-10 text-gray-400 text-sm">
          © {new Date().getFullYear()} TalkSell. تمامی حقوق مادی و معنوی محفوظ است.
        </div>
      </div>

      {/* Right Side - Authentication Card (Mobile Optimized) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-white relative">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500 rounded-full opacity-[0.04] blur-3xl pointer-events-none" />

        <Card className="w-full max-w-md p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-200 rounded-3xl bg-white z-10">
          {/* Logo Title (Mobile only) */}
          <div className="text-center mb-8 hidden sm:block lg:hidden">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">TalkSell</h2>
            <p className="text-gray-500 text-sm">ورود و ثبت‌نام در پلتفرم</p>
          </div>

          <div className="mb-6 text-center sm:text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {activeTab === "login" ? "ورود به حساب کاربری" : "ایجاد حساب کاربری"}
            </h2>
            <p className="text-sm text-gray-500">
              {activeTab === "login"
                ? "شماره تلفن و رمز عبور خود را وارد کنید"
                : "برای راه‌اندازی چت‌بات اختصاصی خود ثبت‌نام کنید"}
            </p>
          </div>

          {dbInitError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-600 mb-1">خطای اتصال به دیتابیس</p>
                  <p className="text-xs text-gray-600 mb-3">{dbInitError}</p>
                  <Button
                    onClick={handleRetryInit}
                    variant="outline"
                    size="sm"
                    disabled={dbInitRetrying}
                    className="text-gray-900 border-gray-200 hover:bg-gray-100 bg-white rounded-xl h-9 px-4 text-xs"
                  >
                    {dbInitRetrying ? (
                      <>
                        <RefreshCw className="h-3 w-3 ml-2 animate-spin" />
                        در حال تلاش...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 ml-2" />
                        تلاش مجدد
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 border border-gray-200 rounded-2xl h-12 p-1">
              <TabsTrigger
                value="login"
                className="rounded-xl data-[state=active]:bg-[#00B8CC] data-[state=active]:text-white font-bold text-sm h-10 transition-all duration-300"
              >
                ورود
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-xl data-[state=active]:bg-[#00B8CC] data-[state=active]:text-white font-bold text-sm h-10 transition-all duration-300"
              >
                ثبت‌نام جدید
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0 focus-visible:outline-none">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginPhone" className="text-gray-700 font-medium text-sm">
                    شماره همراه
                  </Label>
                  <div className="relative">
                    <Input
                      id="loginPhone"
                      type="tel"
                      placeholder="09123456789"
                      value={loginPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        setLoginPhone(value.slice(0, 11))
                      }}
                      className="text-base h-12 rounded-xl bg-white border-gray-300 text-gray-900 focus:border-[#00B8CC] focus:ring-[#00B8CC] pr-4 pl-10"
                      dir="ltr"
                      required
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 text-right">مثال: ۰۹۱۲۳۴۵۶۷۸۹ (۱۱ رقم)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword" className="text-gray-700 font-medium text-sm">
                    رمز عبور
                  </Label>
                  <div className="relative">
                    <Input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="رمز عبور خود را وارد کنید"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="text-base h-12 rounded-xl bg-white border-gray-300 text-gray-900 focus:border-[#00B8CC] focus:ring-[#00B8CC] pr-4 pl-10"
                      required
                    />
                    <Lock className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p className="font-medium">{loginError}</p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold rounded-2xl bg-gradient-to-r from-[#00B8CC] to-[#0086FF] hover:from-[#00CADD] hover:to-[#0096FF] text-white shadow-[0_4px_15px_rgba(0,184,204,0.25)] transition-all hover:scale-[1.01]"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      در حال بررسی اطلاعات...
                    </>
                  ) : (
                    "ورود به حساب"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-0 focus-visible:outline-none">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="registerPhone" className="text-gray-700 font-medium text-sm">
                    شماره همراه
                  </Label>
                  <div className="relative">
                    <Input
                      id="registerPhone"
                      type="tel"
                      placeholder="09123456789"
                      value={registerPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        setRegisterPhone(value.slice(0, 11))
                      }}
                      className="text-base h-12 rounded-xl bg-white border-gray-300 text-gray-900 focus:border-[#00B8CC] focus:ring-[#00B8CC] pr-4 pl-10"
                      dir="ltr"
                      required
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="registerFirstName" className="text-gray-700 font-medium text-sm">
                      نام
                    </Label>
                    <div className="relative">
                      <Input
                        id="registerFirstName"
                        type="text"
                        placeholder="مثال: علی"
                        value={registerFirstName}
                        onChange={(e) => setRegisterFirstName(e.target.value)}
                        className="text-base h-12 rounded-xl bg-white border-gray-300 text-gray-900 focus:border-[#00B8CC] focus:ring-[#00B8CC] px-3"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerLastName" className="text-gray-700 font-medium text-sm">
                      نام خانوادگی
                    </Label>
                    <Input
                      id="registerLastName"
                      type="text"
                      placeholder="مثال: علوی"
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      className="text-base h-12 rounded-xl bg-white border-gray-300 text-gray-900 focus:border-[#00B8CC] focus:ring-[#00B8CC] px-3"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerPassword" className="text-gray-700 font-medium text-sm">
                    رمز عبور دلخواه
                  </Label>
                  <div className="relative">
                    <Input
                      id="registerPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="حداقل ۶ کاراکتر"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="text-base h-12 rounded-xl bg-white border-gray-300 text-gray-900 focus:border-[#00B8CC] focus:ring-[#00B8CC] pr-4 pl-10"
                      required
                    />
                    <Lock className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {registerError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p className="font-medium">{registerError}</p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold rounded-2xl bg-gradient-to-r from-[#00B8CC] to-[#0086FF] hover:from-[#00CADD] hover:to-[#0096FF] text-white shadow-[0_4px_15px_rgba(0,184,204,0.25)] transition-all hover:scale-[1.01]"
                  disabled={registerLoading}
                >
                  {registerLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      در حال ثبت‌نام...
                    </>
                  ) : (
                    "ایجاد حساب و شروع دوره هدیه"
                  )}
                </Button>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500 inline-flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#00B8CC]" />
                    با ثبت‌نام، ۷ روز اشتراک هدیه برای تست تمامی امکانات فعال می‌شود.
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
