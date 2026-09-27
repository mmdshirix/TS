"use client"

import React from "react"

import type { ReactElement } from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { createUserChatbot } from "@/lib/user-db"
import ChatbotWidget from "./chatbot-widget"
import {
  Palette,
  HelpCircle,
  Package,
  Globe,
  Download,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  BookOpen,
  AlertCircle,
  Loader2,
} from "lucide-react"

interface FAQ {
  question: string
  answer: string
  emoji: string
}

interface FormData {
  name: string
  welcome_message: string
  navigation_message: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  store_url: string
  ai_url: string
}

interface NewChatbotFormProps {
  userId: string
}

const STEPS = [
  { id: 1, title: "ظاهر چت‌بات", icon: Palette, description: "تنظیمات رنگ، نام و پیام‌ها" },
  { id: 2, title: "سوالات متداول", icon: HelpCircle, description: "سوالات پرتکرار کاربران" },
  { id: 3, title: "افزونه وردپرس", icon: Package, description: "اتصال به محصولات و سفارشات" },
  { id: 4, title: "پایگاه دانش", icon: Globe, description: "استخراج اطلاعات از سایت" },
]

const DEFAULT_FAQS = [
  { question: "محصولات شما چیست؟", answer: "ما محصولات متنوعی داریم که می‌توانید در سایت ما مشاهده کنید.", emoji: "🛍️" },
  { question: "چگونه سفارش دهم؟", answer: "از طریق سایت ما می‌توانید به راحتی سفارش خود را ثبت کنید.", emoji: "🛒" },
  { question: "زمان ارسال چقدر است؟", answer: "معمولاً ۳ تا ۵ روز کاری طول می‌کشد.", emoji: "🚚" },
]

export default function NewChatbotForm({ userId }: NewChatbotFormProps): ReactElement {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [createdChatbotId, setCreatedChatbotId] = useState<number | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState(0)
  const [extractionStatus, setExtractionStatus] = useState("")
  const [pluginStatus, setPluginStatus] = useState<"checking" | "installed" | "not_installed" | null>(null)
  const [pluginInstalled, setPluginInstalled] = useState(false) // New state
  const [pluginCheckMessage, setPluginCheckMessage] = useState("") // New state
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionComplete, setExtractionComplete] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: "چت‌بات من",
    welcome_message: "سلام! چطور می‌تونم کمکتون کنم؟",
    navigation_message: "لطفاً یکی از گزینه‌های زیر را انتخاب کنید:",
    primary_color: "#3B82F6",
    text_color: "#FFFFFF",
    background_color: "#F3F4F6",
    chat_icon: "💬",
    position: "bottom-right",
    store_url: "",
    ai_url: "",
  })

  const [faqs, setFaqs] = useState(DEFAULT_FAQS)

  const handleComplete = async () => {
    setIsCreating(true)
    try {
      const chatbotData = {
        name: formData.name,
        welcome_message: formData.welcome_message,
        primary_color: formData.primary_color,
        text_color: formData.text_color,
        background_color: formData.background_color,
        chat_icon: formData.chat_icon,
        position: formData.position,
        store_url: formData.store_url,
        ai_url: formData.ai_url,
        faqs,
      }

      console.log("[v0] Creating chatbot with userId:", userId, "data:", chatbotData)

      const newChatbot = await createUserChatbot(userId, chatbotData)

      if (!newChatbot || !newChatbot.id) {
        throw new Error("Failed to create chatbot")
      }

      console.log("[v0] Chatbot created successfully with ID:", newChatbot.id)

      // Show success animation
      setShowSuccess(true)

      // Redirect to dashboard chatbots page after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/chatbots")
      }, 2000)
    } catch (error) {
      console.error("Error creating chatbot:", error)
      alert("خطا در ساخت چت‌بات. لطفاً دوباره تلاش کنید.")
      setIsCreating(false)
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && !formData.name) {
      alert("لطفاً نام چت‌بات را وارد کنید")
      return
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const checkPluginInstallation = async (url: string) => {
    try {
      const cleanUrl = url.replace(/\/$/, "")
      const response = await fetch(`${cleanUrl}/wp-json/talksell/v1/products`)

      if (response.status === 404) {
        setPluginInstalled(false)
        setPluginCheckMessage("افزونه TalkSell نصب نشده است. برای عملکرد بهتر، نصب افزونه توصیه می‌شود.")
      } else if (response.ok) {
        setPluginInstalled(true)
        setPluginCheckMessage("افزونه TalkSell با موفقیت شناسایی شد!")
      } else {
        setPluginInstalled(false)
        setPluginCheckMessage("عدم دسترسی به سایت. می‌توانید این مرحله را رد کنید.")
      }
    } catch (error) {
      setPluginInstalled(false)
      setPluginCheckMessage("عدم دسترسی به سایت. می‌توانید این مرحله را رد کنید.")
    }
  }

  const extractWebsiteContent = async () => {
    if (!websiteUrl) return

    setIsExtracting(true)
    setExtractionProgress(0)
    setExtractionStatus("در حال بررسی افزونه...")
    setPluginCheckMessage("")

    try {
      // Step 1: Check if plugin is installed (404 check)
      setExtractionProgress(10)
      const pluginCheckUrl = `${websiteUrl}/wp-json/talksell/v1/products`

      try {
        const pluginResponse = await fetch(pluginCheckUrl)
        if (pluginResponse.status === 404) {
          // Plugin not installed
          setPluginInstalled(false)
          setPluginCheckMessage(
            "افزونه TalkSell در سایت شما نصب نشده است. برای عملکرد بهتر و دریافت اطلاعات محصولات، توصیه می‌کنیم افزونه را نصب کنید. اگر نمی‌خواهید، می‌توانید این مرحله را رد کنید.",
          )
        } else {
          // Plugin is installed
          setPluginInstalled(true)
          setPluginCheckMessage("✅ افزونه TalkSell با موفقیت شناسایی شد!")
        }
      } catch (error) {
        // Network error or CORS - assume plugin not installed
        setPluginInstalled(false)
        setPluginCheckMessage(
          "افزونه TalkSell در سایت شما نصب نشده است. برای عملکرد بهتر و دریافت اطلاعات محصولات، توصیه می‌کنیم افزونه را نصب کنید. اگر نمی‌خواهید، می‌توانید این مرحله را رد کنید.",
        )
      }

      // Step 2: Extract home page content
      setExtractionProgress(30)
      setExtractionStatus("در حال استخراج محتوای صفحه اصلی...")
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Step 3: Extract knowledge base
      setExtractionProgress(60)
      setExtractionStatus("در حال بررسی پایگاه دانش...")
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Step 4: Save URLs to formData
      setExtractionProgress(90)
      setExtractionStatus("در حال ذخیره اطلاعات...")
      setFormData((prev) => ({
        ...prev,
        store_url: websiteUrl,
        ai_url: websiteUrl,
      }))

      // Complete
      setExtractionProgress(100)
      setExtractionStatus("✅ استخراج با موفقیت انجام شد!")
      setExtractionComplete(true)

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Extraction error:", error)
      alert("خطا در استخراج اطلاعات. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsExtracting(false)
    }
  }

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "", emoji: "❓" }])
  }

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    setFaqs(faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Only allow submission on step 4 and after extraction is complete (or skipped)
    if (currentStep === 4 && (extractionComplete || websiteUrl === "")) {
      await handleComplete()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 md:p-8">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full w-24 h-24 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">چت‌بات با موفقیت ساخته شد!</h3>
            <p className="text-gray-600">در حال انتقال به داشبورد...</p>
          </div>
        </div>
      )}

      <div className="mb-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep > step.id
                      ? "bg-green-500 text-white"
                      : currentStep === step.id
                        ? "bg-blue-600 text-white ring-4 ring-blue-200"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    React.createElement(step.icon, { className: "w-6 h-6" })
                  )}
                </div>
                <p className="text-xs mt-2 text-gray-700 font-medium hidden md:block">{step.title}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-1 mx-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: currentStep > step.id ? "100%" : "0%" }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-8 h-fit order-2 lg:order-1">
            <Card className="overflow-hidden border-2 border-blue-100 shadow-xl bg-white rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-3xl">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  پیش‌نمایش زنده
                </CardTitle>
                <CardDescription className="text-blue-100">چت‌بات شما در حال ساخت</CardDescription>
              </CardHeader>
              <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex justify-center items-center">
                  <div className="relative">
                    <div className="w-[400px] h-[750px] rounded-3xl shadow-2xl border-4 border-gray-200 bg-white overflow-hidden">
                      <ChatbotWidget
                        chatbot={{
                          id: 0,
                          name: formData.name,
                          welcome_message: formData.welcome_message,
                          navigation_message: formData.navigation_message,
                          primary_color: formData.primary_color,
                          text_color: formData.text_color,
                          background_color: formData.background_color,
                          chat_icon: formData.chat_icon,
                          position: formData.position,
                          store_url: formData.store_url,
                          ai_url: formData.ai_url,
                        }}
                        faqs={faqs}
                        products={[]}
                        isPreview={true}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="order-1 lg:order-2">
            <form onSubmit={handleFormSubmit}>
              <Card className="rounded-2xl border-2 border-blue-200 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-blue-100 rounded-t-2xl bg-gradient-to-l from-blue-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      {React.createElement(STEPS[currentStep - 1].icon, { className: "w-6 h-6 text-white" })}
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 text-xl">{STEPS[currentStep - 1].title}</CardTitle>
                      <CardDescription className="text-gray-600">{STEPS[currentStep - 1].description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                  {/* Step 1: Appearance - NO CHANGES */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-500">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-blue-900 font-semibold">
                          نام چت‌بات
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="مثال: پشتیبان فروشگاه"
                          required
                          className="rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="chat_icon" className="text-blue-900 font-semibold">
                          آیکون چت (ایموجی)
                        </Label>
                        <Input
                          id="chat_icon"
                          value={formData.chat_icon}
                          onChange={(e) => setFormData({ ...formData, chat_icon: e.target.value })}
                          placeholder="💬"
                          className="rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primary_color" className="text-blue-900 font-semibold">
                            رنگ اصلی
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="primary_color"
                              type="color"
                              value={formData.primary_color}
                              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                              className="h-12 rounded-xl border-2 border-blue-200 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={formData.primary_color}
                              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                              className="flex-1 rounded-xl border-2 border-blue-200 focus:border-blue-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="text_color" className="text-blue-900 font-semibold">
                            رنگ متن
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="text_color"
                              type="color"
                              value={formData.text_color}
                              onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                              className="h-12 rounded-xl border-2 border-blue-200 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={formData.text_color}
                              onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                              className="flex-1 rounded-xl border-2 border-blue-200 focus:border-blue-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="background_color" className="text-blue-900 font-semibold">
                            رنگ پس‌زمینه
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="background_color"
                              type="color"
                              value={formData.background_color}
                              onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                              className="h-12 rounded-xl border-2 border-blue-200 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={formData.background_color}
                              onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                              className="flex-1 rounded-xl border-2 border-blue-200 focus:border-blue-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="welcome_message" className="text-blue-900 font-semibold">
                          پیام خوش‌آمدگویی
                        </Label>
                        <Textarea
                          id="welcome_message"
                          value={formData.welcome_message}
                          onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                          placeholder="سلام! چطور می‌تونم کمکتون کنم؟"
                          rows={3}
                          className="rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="navigation_message" className="text-blue-900 font-semibold">
                          پیام راهنمایی
                        </Label>
                        <Textarea
                          id="navigation_message"
                          value={formData.navigation_message}
                          onChange={(e) => setFormData({ ...formData, navigation_message: e.target.value })}
                          placeholder="از منوی زیر می‌تونید گزینه مورد نظرتون رو انتخاب کنید"
                          rows={2}
                          className="rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: FAQs - NO CHANGES */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-500">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-blue-900">سوالات متداول (FAQ)</h3>
                        <Button
                          type="button"
                          onClick={addFaq}
                          variant="outline"
                          className="gap-2 rounded-xl border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all bg-transparent"
                        >
                          <Plus className="w-4 h-4" />
                          افزودن سوال
                        </Button>
                      </div>

                      {faqs.length === 0 ? (
                        <div className="text-center py-12 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-300">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                          <p className="text-blue-700 font-medium">هنوز سوالی اضافه نشده</p>
                          <p className="text-blue-500 text-sm mt-1">برای شروع، روی "افزودن سوال" کلیک کنید</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {faqs.map((faq, index) => (
                            <div
                              key={index}
                              className="p-6 rounded-2xl border-2 border-blue-200 bg-white hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                            >
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-blue-900 font-semibold">سوال {index + 1}</Label>
                                    <Button
                                      type="button"
                                      onClick={() => removeFaq(index)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <Input
                                    value={faq.question}
                                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                                    placeholder="سوال خود را وارد کنید"
                                    className="rounded-xl border-2 border-blue-200 focus:border-blue-400"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-blue-900 font-semibold">پاسخ {index + 1}</Label>
                                  <Textarea
                                    value={faq.answer}
                                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                                    placeholder="پاسخ خود را وارد کنید"
                                    rows={3}
                                    className="rounded-xl border-2 border-blue-200 focus:border-blue-400 resize-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-500">
                      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-blue-900 mb-2">افزونه وردپرس TalkSell</h3>
                            <p className="text-blue-700 text-sm leading-relaxed">
                              برای اتصال، دریافت و به‌روزرسانی خودکار محصولات و قیمت‌ها، باید این افزونه را نصب کنید.
                            </p>
                            <p className="text-blue-700 text-sm leading-relaxed mt-2">
                              با نصب افزونه، چت‌بات به اطلاعات محصولات و سفارشات دسترسی پیدا می‌کند.
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 mb-6">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-blue-200 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-green-100">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm text-blue-900 font-medium">ارسال خودکار محصولات</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-blue-200 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-green-100">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm text-blue-900 font-medium">نمایش قیمت و ویژگی‌ها</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-blue-200 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-green-100">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm text-blue-900 font-medium">به‌روزرسانی لحظه‌ای</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-blue-200 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-green-100">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm text-blue-900 font-medium">پیگیری سفارشات مشتری</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <Button
                            type="button"
                            onClick={() =>
                              window.open("https://talksell.ir/wp-content/uploads/2025/12/talksell.zip", "_blank")
                            }
                            className="w-full gap-2 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-12 shadow-lg hover:shadow-xl transition-all"
                          >
                            <Download className="w-5 h-5" />
                            دانلود افزونه TalkSell
                          </Button>
                          <Button
                            type="button"
                            onClick={() =>
                              window.open(
                                "https://talksell.ir/2025/12/23/%d8%a2%d9%85%d9%88%d8%b2%d8%b4-%d9%86%d8%b5%d8%a8-%d8%aa%d8%a7%da%a9%d8%b3%d9%84-%d8%a7%d8%b6%d8%a7%d9%81%d9%87-%da%a9%d8%b1%d8%af%d9%86-%d9%87%d9%88%d8%b4-%d9%85%d8%b5%d9%86%d9%88%d8%b9%db%8c-%d8%aa/",
                                "_blank",
                              )
                            }
                            variant="outline"
                            className="w-full gap-2 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 rounded-xl h-12 transition-all bg-white"
                          >
                            <BookOpen className="w-5 h-5" />
                            آموزش نصب و راه‌اندازی
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                        <p className="text-sm text-amber-900 text-center leading-relaxed">
                          💡 اگر از ووکامرس استفاده نمی‌کنید، می‌توانید این مرحله را رد کنید و محصولات را به صورت دستی در
                          داشبورد اضافه کنید.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Website Extraction */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-500">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="website_url" className="text-blue-900 font-semibold text-lg mb-2 block">
                            🌐 آدرس وب‌سایت شما
                          </Label>
                          <p className="text-sm text-blue-600 mb-3">
                            با وارد کردن آدرس سایت، چت‌بات به صورت هوشمند محتوای سایت را مطالعه و به سوالات مشتریان پاسخ
                            می‌دهد.
                          </p>
                          <div className="flex gap-2">
                            <Input
                              id="website_url"
                              type="url"
                              value={websiteUrl}
                              onChange={(e) => setWebsiteUrl(e.target.value)}
                              placeholder="https://yoursite.com"
                              className="flex-1 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 h-12"
                              dir="ltr"
                              disabled={isExtracting || extractionComplete}
                            />
                            {!extractionComplete && (
                              <Button
                                type="button"
                                onClick={extractWebsiteContent}
                                disabled={!websiteUrl || isExtracting}
                                className="gap-2 bg-gradient-to-l from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl px-6 h-12 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                              >
                                <Sparkles className="w-4 h-4" />
                                استخراج اطلاعات
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Beautiful extraction animation */}
                        {isExtracting && (
                          <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 text-center animate-in zoom-in-95 duration-300">
                            <div className="relative w-32 h-32 mx-auto mb-6">
                              <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-spin"></div>
                              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 animate-pulse"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Globe className="w-12 h-12 text-white animate-pulse" />
                              </div>
                              <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="60"
                                  fill="none"
                                  stroke="url(#gradient)"
                                  strokeWidth="4"
                                  strokeDasharray={`${(extractionProgress / 100) * 377} 377`}
                                  strokeLinecap="round"
                                  className="transition-all duration-300"
                                />
                                <defs>
                                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="100%" stopColor="#8B5CF6" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </div>
                            <div className="space-y-2">
                              <p className="text-blue-900 font-bold text-xl">{extractionStatus}</p>
                              <div className="flex items-center justify-center gap-2">
                                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                  {Math.round(extractionProgress)}%
                                </div>
                              </div>
                              <p className="text-blue-600 text-sm">در حال ساخت پایگاه دانش هوشمند...</p>
                            </div>
                          </div>
                        )}

                        {/* Plugin status message */}
                        {pluginCheckMessage && !isExtracting && (
                          <div
                            className={`rounded-xl p-4 border-2 ${
                              pluginInstalled ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"
                            } animate-in slide-in-from-top-2 duration-300`}
                          >
                            <div className="flex items-start gap-3">
                              {pluginInstalled ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-medium ${
                                    pluginInstalled ? "text-green-900" : "text-amber-900"
                                  }`}
                                >
                                  {pluginCheckMessage}
                                </p>
                                {!pluginInstalled && (
                                  <p className="text-xs text-amber-700 mt-1">
                                    می‌توانید بدون افزونه ادامه دهید و محصولات را به صورت دستی در داشبورد اضافه کنید.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Extraction complete message */}
                        {extractionComplete && (
                          <div className="space-y-4 animate-in zoom-in-95 duration-500">
                            <div className="rounded-2xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-green-100">
                                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-green-900 font-bold text-lg mb-1">اطلاعات با موفقیت ذخیره شد!</p>
                                  <p className="text-green-700 text-sm">
                                    چت‌بات شما آماده است و محتوای سایت به عنوان پایگاه دانش ذخیره شد.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
                              <p className="text-sm text-blue-900 text-center">
                                ✨ اکنون می‌توانید چت‌بات خود را بسازید و در سایت قرار دهید
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Skip option if no extraction done */}
                        {!isExtracting && !extractionComplete && (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                            <p className="text-sm text-purple-900 text-center leading-relaxed">
                              💡 می‌توانید این مرحله را رد کنید و بعداً در تنظیمات، آدرس سایت را اضافه کنید.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Action Buttons */}
                <CardFooter className="flex justify-between items-center border-t border-blue-100 pt-6">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={handlePrevious}
                      variant="outline"
                      className="gap-2 rounded-xl border-2 border-blue-300 hover:bg-blue-50 text-blue-700 bg-transparent"
                    >
                      <ChevronRight className="w-4 h-4" />
                      قبلی
                    </Button>
                  )}

                  <div className="flex-1"></div>

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="gap-2 bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      بعدی
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  ) : currentStep === 4 && !extractionComplete && websiteUrl ? (
                    <Button
                      type="button"
                      onClick={() => setExtractionComplete(true)}
                      variant="outline"
                      className="gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-700"
                    >
                      <AlertCircle className="w-4 h-4" />
                      رد کردن و ادامه
                    </Button>
                  ) : currentStep === 4 && (extractionComplete || websiteUrl === "") ? (
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="gap-2 bg-gradient-to-l from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          در حال ساخت...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          ساخت چت‌بات
                        </>
                      )}
                    </Button>
                  ) : null}
                </CardFooter>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
