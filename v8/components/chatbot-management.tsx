"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  ChevronDown,
  Code,
  Eye,
  MessageSquare,
  Palette,
  HelpCircle,
  Package,
  BookOpen,
  Trash2,
  Plus,
  Save,
  Copy,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu" // Import DropdownMenu components
import type { Chatbot } from "@/lib/db"

interface ChatbotManagementProps {
  chatbots: Chatbot[]
  userId: number
}

// Define newProduct state here
const initialNewProductState = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  product_url: "",
  button_text: "خرید",
  secondary_text: "جزئیات",
}

export default function ChatbotManagement({ chatbots: initialChatbots, userId }: ChatbotManagementProps) {
  const [chatbots, setChatbots] = useState(initialChatbots)
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(
    initialChatbots.length > 0 ? initialChatbots[0] : null,
  )
  const [chatbotData, setChatbotData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Preview chat state
  const [messages, setMessages] = useState<any[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // WooCommerce settings states
  const [woocommerceOrdersEnabled, setWoocommerceOrdersEnabled] = useState(false)
  const [woocommerceApiUrl, setWoocommerceApiUrl] = useState("")
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    if (selectedChatbot) {
      loadChatbotData(selectedChatbot.id)
      resetPreviewChat()
    }
  }, [selectedChatbot])

  useEffect(() => {
    if (chatbotData?.chatbot) {
      console.log("[v0] Syncing WooCommerce settings from chatbot data:", {
        enabled: chatbotData.chatbot.woocommerce_orders_enabled,
        url: chatbotData.chatbot.woocommerce_api_url,
      })
      setWoocommerceOrdersEnabled(chatbotData.chatbot.woocommerce_orders_enabled || false)
      setWoocommerceApiUrl(chatbotData.chatbot.woocommerce_api_url || "")
    }
  }, [chatbotData])

  const loadChatbotData = async (chatbotId: number) => {
    setLoading(true)
    try {
      console.log("[v0] Loading chatbot data for ID:", chatbotId)
      const response = await fetch(`/api/dashboard/chatbot/${chatbotId}`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Chatbot data loaded:", {
          messagesCount: data.messages?.length || 0,
          faqsCount: data.faqs?.length || 0,
          productsCount: data.products?.length || 0,
        })
        setChatbotData(data)
      } else {
        console.error("[v0] Failed to load chatbot data, status:", response.status)
      }
    } catch (error) {
      console.error("[v0] Error loading chatbot data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateChatbotSettings = async (updates: Partial<Chatbot>) => {
    if (!selectedChatbot) return

    setSaving(true)
    try {
      const response = await fetch(`/api/dashboard/chatbot/${selectedChatbot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const { chatbot: updated } = await response.json()
        setSelectedChatbot(updated)
        setChatbots(chatbots.map((c) => (c.id === updated.id ? updated : c)))
        alert("تنظیمات با موفقیت ذخیره شد")
      }
    } catch (error) {
      console.error("Error updating chatbot:", error)
      alert("خطا در ذخیره تنظیمات")
    } finally {
      setSaving(true)
    }
  }

  const updateFAQs = async (faqs: any[]) => {
    if (!selectedChatbot) return

    setSaving(true)
    try {
      const response = await fetch(`/api/dashboard/chatbot/${selectedChatbot.id}/faqs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs }),
      })

      if (response.ok) {
        const { faqs: updatedFaqs } = await response.json()
        setChatbotData({ ...chatbotData, faqs: updatedFaqs })
        alert("سوالات با موفقیت ذخیره شد")
      }
    } catch (error) {
      console.error("Error updating FAQs:", error)
      alert("خطا در ذخیره سوالات")
    } finally {
      setSaving(true)
    }
  }

  const updateProducts = async (products: any[]) => {
    if (!selectedChatbot) return

    setSaving(true)
    try {
      const response = await fetch(`/api/dashboard/chatbot/${selectedChatbot.id}/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      })

      if (response.ok) {
        const { products: updatedProducts } = await response.json()
        setChatbotData({ ...chatbotData, products: updatedProducts })
        alert("محصولات با موفقیت ذخیره شد")
      }
    } catch (error) {
      console.error("Error updating products:", error)
      alert("خطا در ذخیره محصولات")
    } finally {
      setSaving(true)
    }
  }

  const copyEmbedCode = () => {
    if (!selectedChatbot) return

    const embedCode = `<script
  src="${process.env.NEXT_PUBLIC_APP_URL || "https://ororw.vercel.app"}/widget-loader.js"
  data-chatbot-id="${selectedChatbot.id}"
  data-margin-x="20"
  data-margin-y="20"
  data-position="bottom-right"
  data-primary-color="${selectedChatbot.primary_color}"
  async
></script>`

    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetPreviewChat = () => {
    if (!selectedChatbot) return
    setMessages([
      {
        id: 1,
        content: selectedChatbot.welcome_message || "سلام! چطور می‌تونم کمکتون کنم؟",
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  }

  const handleSendPreviewMessage = (content: string) => {
    if (!content.trim()) return

    const userMessage = {
      id: Date.now(),
      content,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        content: "این یک پیش‌نمایش است. پاسخ‌های واقعی توسط هوش مصنوعی تولید می‌شوند.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const fetchAndCacheOrders = async (apiUrl: string): Promise<boolean> => {
    try {
      console.log("[v0] Fetching orders from:", apiUrl)

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        console.error("[v0] Failed to fetch orders:", response.status)
        return false
      }

      const ordersData = await response.json()
      console.log("[v0] Received orders, total:", ordersData.total_orders)

      // Store orders in database
      const saveResponse = await fetch(`/api/dashboard/chatbot/${selectedChatbot?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          woocommerce_orders_data: JSON.stringify(ordersData),
        }),
      })

      if (!saveResponse.ok) {
        console.error("[v0] Failed to save orders data")
        return false
      }

      console.log("[v0] Orders data cached successfully")
      return true
    } catch (error) {
      console.error("[v0] Error fetching orders:", error)
      return false
    }
  }

  const saveWooCommerceSettings = async () => {
    if (!selectedChatbot) return

    setSavingSettings(true)
    try {
      let finalApiUrl = woocommerceApiUrl.trim()
      if (finalApiUrl && !finalApiUrl.includes("/wp-json/talksell/v1/orders")) {
        // Remove trailing slash if present
        finalApiUrl = finalApiUrl.replace(/\/$/, "")
        // Append the API endpoint
        finalApiUrl = `${finalApiUrl}/wp-json/talksell/v1/orders`
      }

      console.log("[v0] Saving WooCommerce settings:", {
        enabled: woocommerceOrdersEnabled,
        url: finalApiUrl,
      })

      const response = await fetch(`/api/dashboard/chatbot/${selectedChatbot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          woocommerce_orders_enabled: woocommerceOrdersEnabled,
          woocommerce_api_url: finalApiUrl,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] WooCommerce settings saved:", result)
        setWoocommerceApiUrl(finalApiUrl)

        if (woocommerceOrdersEnabled && finalApiUrl) {
          const cached = await fetchAndCacheOrders(finalApiUrl)
          if (cached) {
            alert("✅ تنظیمات WooCommerce و داده‌های سفارشات با موفقیت ذخیره شد")
          } else {
            alert("⚠️ تنظیمات ذخیره شد اما خطا در دریافت سفارشات. لطفاً آدرس API را بررسی کنید")
          }
        } else {
          alert("✅ تنظیمات WooCommerce با موفقیت ذخیره شد")
        }

        await loadChatbotData(selectedChatbot.id)
      } else {
        const error = await response.json()
        console.error("[v0] Error response:", error)
        alert("❌ خطا در ذخیره تنظیمات")
      }
    } catch (error) {
      console.error("[v0] Error saving WooCommerce settings:", error)
      alert("❌ خطا در ذخیره تنظیمات")
    } finally {
      setSavingSettings(false)
    }
  }

  if (chatbots.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl">
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">هنوز چت‌بات ندارید</h3>
            <p className="text-gray-600 mb-6">اولین چت‌بات خود را بسازید و شروع کنید</p>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              <Plus className="ml-2 h-5 w-5" />
              ساخت چت‌بات جدید
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!selectedChatbot || !chatbotData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chatbot Selector */}
      <Card className="rounded-2xl border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-3 px-4 py-6 rounded-xl hover:bg-gray-50 bg-transparent"
                  >
                    <div className="text-3xl">{selectedChatbot.chat_icon}</div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{selectedChatbot.name}</div>
                      <div className="text-xs text-gray-500">کلیک کنید برای تغییر</div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 bg-white rounded-xl border-2 shadow-lg p-2">
                  <div className="px-3 py-2 text-sm font-semibold text-gray-500 border-b mb-2">انتخاب چت‌بات</div>
                  {chatbots.map((chatbot) => (
                    <DropdownMenuItem
                      key={chatbot.id}
                      onClick={() => setSelectedChatbot(chatbot)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChatbot.id === chatbot.id ? "bg-blue-50 border-2 border-blue-500" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="text-2xl">{chatbot.chat_icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-base">{chatbot.name}</div>
                        <div className="text-xs text-gray-500">{chatbot.is_active ? "🟢 فعال" : "🔴 غیرفعال"}</div>
                      </div>
                      {selectedChatbot.id === chatbot.id && <Check className="h-5 w-5 text-blue-600" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* </CHANGE> */}
              <div>
                <CardDescription>مدیریت کامل چت‌بات خود</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setActiveTab("embed")}>
                <Code className="ml-2 h-4 w-4" />
                کد embed
              </Button>
              <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setActiveTab("preview")}>
                <Eye className="ml-2 h-4 w-4" />
                پیش‌نمایش
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 h-auto bg-blue-50 rounded-2xl p-2">
          <TabsTrigger
            value="overview"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <MessageSquare className="ml-2 h-4 w-4" />
            نمای کلی
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <Palette className="ml-2 h-4 w-4" />
            ظاهر
          </TabsTrigger>
          <TabsTrigger
            value="faqs"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <HelpCircle className="ml-2 h-4 w-4" />
            سوالات
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <Package className="ml-2 h-4 w-4" />
            محصولات
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <MessageSquare className="ml-2 h-4 w-4" />
            پیام‌ها
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <Eye className="ml-2 h-4 w-4" />
            پیش‌نمایش
          </TabsTrigger>
          <TabsTrigger
            value="embed"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <Code className="ml-2 h-4 w-4" />
            کد نصب
          </TabsTrigger>
          <TabsTrigger
            value="knowledge"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
          >
            <BookOpen className="ml-2 h-4 w-4" />
            پایگاه دانش
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedChatbot.is_active ? "🟢" : "🔴"}
                وضعیت چت‌بات
              </CardTitle>
              <CardDescription>
                {selectedChatbot.is_active
                  ? "چت‌بات شما فعال است و کاربران می‌توانند با آن تعامل داشته باشند"
                  : "چت‌بات شما غیرفعال است. برای فعال‌سازی، دکمه زیر را کلیک کنید"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/chatbots/${selectedChatbot.id}/toggle-active`, {
                      method: "POST",
                    })

                    if (response.ok) {
                      const { chatbot: updated } = await response.json()
                      setSelectedChatbot(updated)
                      setChatbots(chatbots.map((c) => (c.id === updated.id ? updated : c)))

                      if (updated.is_active) {
                        alert("✅ چت‌بات فعال شد! سایر چت‌بات‌های شما به صورت خودکار غیرفعال شدند.")
                      } else {
                        alert("⚠️ چت‌بات غیرفعال شد")
                      }

                      // Reload chatbots list
                      const chatbotsResponse = await fetch(`/api/dashboard/chatbots`)
                      if (chatbotsResponse.ok) {
                        const updatedChatbots = await chatbotsResponse.json()
                        setChatbots(updatedChatbots)
                      }
                    }
                  } catch (error) {
                    console.error("Error toggling chatbot:", error)
                    alert("خطا در تغییر وضعیت چت‌بات")
                  }
                }}
                className={`rounded-xl ${
                  selectedChatbot.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {selectedChatbot.is_active ? "غیرفعال کردن چت‌بات" : "فعال کردن چت‌بات"}
              </Button>
              <p className="text-sm text-gray-600 mt-3">
                💡 توجه: در هر لحظه فقط یک چت‌بات می‌تواند فعال باشد. با فعال کردن این چت‌بات، سایر چت‌بات‌ها به صورت خودکار
                غیرفعال خواهند شد.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">کل پیام‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-600">{chatbotData?.messages?.length || 0}</p>
                <p className="text-sm text-gray-500 mt-2">پیام دریافت شده</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">سوالات متداول</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600">{chatbotData?.faqs?.length || 0}</p>
                <p className="text-sm text-gray-500 mt-2">سوال تعریف شده</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">محصولات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-purple-600">{chatbotData?.products?.length || 0}</p>
                <p className="text-sm text-gray-500 mt-2">محصول فعال</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-2">
            <CardHeader>
              <CardTitle>تنظیمات کلی</CardTitle>
              <CardDescription>اطلاعات اصلی چت‌بات را ویرایش کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">نام چت‌بات</Label>
                <Input
                  id="name"
                  value={selectedChatbot.name}
                  onChange={(e) => setSelectedChatbot({ ...selectedChatbot, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="welcome_message">پیام خوشامدگویی</Label>
                <Textarea
                  id="welcome_message"
                  value={selectedChatbot.welcome_message}
                  onChange={(e) => setSelectedChatbot({ ...selectedChatbot, welcome_message: e.target.value })}
                  rows={3}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="navigation_message">پیام راهنمایی</Label>
                <Textarea
                  id="navigation_message"
                  value={selectedChatbot.navigation_message}
                  onChange={(e) => setSelectedChatbot({ ...selectedChatbot, navigation_message: e.target.value })}
                  rows={2}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="knowledge_base_text">پایگاه دانش</Label>
                <Textarea
                  id="knowledge_base_text"
                  value={selectedChatbot.knowledge_base_text || ""}
                  onChange={(e) => setSelectedChatbot({ ...selectedChatbot, knowledge_base_text: e.target.value })}
                  rows={6}
                  placeholder="اطلاعات مربوط به کسب‌وکار خود را اینجا وارد کنید..."
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={() => updateChatbotSettings(selectedChatbot)}
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                <Save className="ml-2 h-4 w-4" />
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="rounded-2xl border-2">
            <CardHeader>
              <CardTitle>رنگ‌ها و ظاهر</CardTitle>
              <CardDescription>ظاهر چت‌بات خود را شخصی‌سازی کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="primary_color">رنگ اصلی</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={selectedChatbot.primary_color}
                      onChange={(e) => setSelectedChatbot({ ...selectedChatbot, primary_color: e.target.value })}
                      className="w-20 h-12 rounded-xl cursor-pointer"
                    />
                    <Input
                      value={selectedChatbot.primary_color}
                      onChange={(e) => setSelectedChatbot({ ...selectedChatbot, primary_color: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="text_color">رنگ متن</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="text_color"
                      type="color"
                      value={selectedChatbot.text_color}
                      onChange={(e) => setSelectedChatbot({ ...selectedChatbot, text_color: e.target.value })}
                      className="w-20 h-12 rounded-xl cursor-pointer"
                    />
                    <Input
                      value={selectedChatbot.text_color}
                      onChange={(e) => setSelectedChatbot({ ...selectedChatbot, text_color: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="background_color">رنگ پس‌زمینه</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="background_color"
                      type="color"
                      value={selectedChatbot.background_color}
                      onChange={(e) => setSelectedChatbot({ ...selectedChatbot, background_color: e.target.value })}
                      className="w-20 h-12 rounded-xl cursor-pointer"
                    />
                    <Input
                      value={selectedChatbot.background_color}
                      onChange={(e) => setSelectedChatbot({ ...selectedChatbot, background_color: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="chat_icon">آیکون چت</Label>
                  <Input
                    id="chat_icon"
                    value={selectedChatbot.chat_icon}
                    onChange={(e) => setSelectedChatbot({ ...selectedChatbot, chat_icon: e.target.value })}
                    placeholder="🤖"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="position">موقعیت نمایش</Label>
                  <select
                    id="position"
                    value={selectedChatbot.position}
                    onChange={(e) => setSelectedChatbot({ ...selectedChatbot, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="bottom-right">پایین راست</option>
                    <option value="bottom-left">پایین چپ</option>
                    <option value="top-right">بالا راست</option>
                    <option value="top-left">بالا چپ</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border-2">
                <h4 className="font-bold mb-4">پیش‌نمایش رنگ‌ها</h4>
                <div className="space-y-3">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: selectedChatbot.primary_color,
                      color: selectedChatbot.text_color,
                    }}
                  >
                    <p className="font-bold">هدر چت‌بات</p>
                    <p className="text-sm opacity-90">این رنگ‌ها در چت‌بات شما نمایش داده می‌شوند</p>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: selectedChatbot.background_color,
                      color: selectedChatbot.primary_color,
                    }}
                  >
                    <p className="font-bold">پس‌زمینه چت</p>
                    <p className="text-sm">پیام‌های کاربران در این پس‌زمینه نمایش داده می‌شوند</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => updateChatbotSettings(selectedChatbot)}
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 w-full"
              >
                <Save className="ml-2 h-4 w-4" />
                {saving ? "در حال ذخیره..." : "ذخیره تنظیمات ظاهری"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-6">
          <FAQManager faqs={chatbotData.faqs || []} onSave={updateFAQs} saving={saving} />
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <ProductManager
            products={chatbotData.products || []}
            onSave={updateProducts}
            saving={saving}
            chatbotId={selectedChatbot?.id}
            chatbotData={chatbotData}
          />
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card className="rounded-2xl border-2">
            <CardHeader>
              <CardTitle>پیام‌های دریافتی</CardTitle>
              <CardDescription>
                {loading
                  ? "در حال بارگذاری..."
                  : `${chatbotData?.messages?.length || 0} پیام از کاربران دریافت شده است`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">در حال بارگذاری پیام‌ها...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {chatbotData?.messages && chatbotData.messages.length > 0 ? (
                    chatbotData.messages.map((msg: any) => (
                      <div key={msg.id} className="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="rounded-lg">
                              {msg.user_ip || "ناشناس"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(msg.timestamp).toLocaleString("fa-IR")}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-900">کاربر:</p>
                            <p className="text-sm text-blue-800">{msg.user_message}</p>
                          </div>
                          {msg.bot_response && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-900">پاسخ بات:</p>
                              <p className="text-sm text-gray-700">{msg.bot_response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">هنوز پیامی دریافت نشده است</p>
                      <p className="text-sm text-gray-500 mt-2">
                        وقتی کاربران با چت‌بات شما صحبت کنند، پیام‌ها اینجا نمایش داده می‌شوند
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card className="rounded-2xl border-2">
            <CardHeader>
              <CardTitle>پیش‌نمایش چت‌بات</CardTitle>
              <CardDescription>نمایش زنده چت‌بات شما</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="relative">
                  <iframe
                    src={`/widget/${selectedChatbot.id}`}
                    className="w-[400px] h-[700px] rounded-3xl shadow-2xl border-4 border-gray-200"
                    title="Chatbot Preview"
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">پیش‌نمایش زنده</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  توضیحات پیش‌نمایش
                </h4>
                <ul className="text-blue-800 space-y-2 text-sm">
                  <li>• این نمایش دقیق چت‌باتی است که در وب‌سایت شما نمایش داده می‌شود</li>
                  <li>• شامل 3 تب: هوش مصنوعی، فروشگاه و تیکت</li>
                  <li>• تمام سوالات متداول و محصولات شما در آن قابل مشاهده است</li>
                  <li>• ظاهر و رنگ‌بندی دقیقاً مطابق با تنظیماتی است که انجام داده‌اید</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Embed Code Tab */}
        <TabsContent value="embed" className="space-y-6">
          <Card className="rounded-2xl border-2">
            <CardHeader>
              <CardTitle>کد نصب چت‌بات</CardTitle>
              <CardDescription>این کد را در وب‌سایت خود قرار دهید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 text-green-400 rounded-xl p-6 font-mono text-sm relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyEmbedCode}
                  className="absolute top-2 left-2 text-white hover:bg-gray-800 rounded-lg"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="whitespace-pre-wrap break-all">
                  {`<script
  src="https://platform-talksell.ir/widget-loader.js"
  data-chatbot-id="${selectedChatbot.id}"
  data-margin-x="20"
  data-margin-y="20"
  data-position="bottom-right"
  data-primary-color="${selectedChatbot.primary_color}"
  async
></script>`}
                </pre>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <h4 className="font-bold text-blue-900 mb-3">راهنمای نصب</h4>
                <ol className="text-blue-800 space-y-2 list-decimal list-inside">
                  <li>کد بالا را کپی کنید</li>
                  <li>کد را در فایل HTML وب‌سایت خود قبل از تگ {"</body>"} قرار دهید</li>
                  <li>صفحه را ذخیره و بروزرسانی کنید</li>
                  <li>چت‌بات به صورت خودکار در گوشه صفحه نمایش داده می‌شود</li>
                </ol>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 mb-3">تنظیمات قابل تغییر</h4>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>
                    <code className="bg-gray-200 px-2 py-1 rounded">data-margin-x</code> - فاصله از راست/چپ (پیش‌فرض: 20)
                  </li>
                  <li>
                    <code className="bg-gray-200 px-2 py-1 rounded">data-margin-y</code> - فاصله از بالا/پایین (پیش‌فرض:
                    20)
                  </li>
                  <li>
                    <code className="bg-gray-200 px-2 py-1 rounded">data-position</code> - موقعیت نمایش: bottom-right,
                    bottom-left, top-right, top-left
                  </li>
                  <li>
                    <code className="bg-gray-200 px-2 py-1 rounded">data-primary-color</code> - رنگ اصلی (مثال: #1068da)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <KnowledgeBaseManager chatbotId={selectedChatbot.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// FAQ Manager Component
function FAQManager({ faqs, onSave, saving }: { faqs: any[]; onSave: (faqs: any[]) => void; saving: boolean }) {
  const [localFaqs, setLocalFaqs] = useState(faqs)
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", emoji: "❓" })

  const addFaq = () => {
    if (!newFaq.question || !newFaq.answer) return
    setLocalFaqs([...localFaqs, { ...newFaq, id: Date.now(), position: localFaqs.length }])
    setNewFaq({ question: "", answer: "", emoji: "❓" })
  }

  const deleteFaq = (index: number) => {
    setLocalFaqs(localFaqs.filter((_, i) => i !== index))
  }

  const updateFaq = (index: number, updates: any) => {
    setLocalFaqs(localFaqs.map((faq, i) => (i === index ? { ...faq, ...updates } : faq)))
  }

  return (
    <Card className="rounded-2xl border-2">
      <CardHeader>
        <CardTitle>مدیریت سوالات متداول</CardTitle>
        <CardDescription>سوالات و پاسخ‌های متداول را اضافه یا ویرایش کنید</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New FAQ */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h4 className="font-bold mb-4 text-blue-900">افزودن سوال جدید</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="ایموجی (مثلاً ❓)"
                value={newFaq.emoji}
                onChange={(e) => setNewFaq({ ...newFaq, emoji: e.target.value })}
                className="rounded-xl text-2xl text-center"
              />
              <Input
                placeholder="سوال"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                className="rounded-xl md:col-span-2"
              />
            </div>
            <Textarea
              placeholder="پاسخ کامل"
              value={newFaq.answer}
              onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
              rows={3}
              className="rounded-xl"
            />
            <Button onClick={addFaq} className="rounded-xl bg-green-600 hover:bg-green-700">
              <Plus className="ml-2 h-4 w-4" />
              افزودن سوال
            </Button>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {localFaqs.map((faq, index) => (
            <Card key={index} className="rounded-2xl border-2">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      <Input
                        value={faq.emoji}
                        onChange={(e) => updateFaq(index, { emoji: e.target.value })}
                        className="text-2xl text-center w-20 rounded-xl"
                      />
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFaq(index, { question: e.target.value })}
                        placeholder="سوال"
                        className="rounded-xl font-medium"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, { answer: e.target.value })}
                        placeholder="پاسخ"
                        rows={3}
                        className="rounded-xl"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFaq(index)}
                      className="rounded-xl text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => onSave(localFaqs)}
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          <Save className="ml-2 h-4 w-4" />
          {saving ? "در حال ذخیره..." : "ذخیره تمام سوالات"}
        </Button>
      </CardContent>
    </Card>
  )
}

// Product Manager Component
function ProductManager({
  products,
  onSave,
  saving,
  chatbotId,
  chatbotData,
}: {
  products: any[]
  onSave: (products: any[]) => void
  saving: boolean
  chatbotId?: number
  chatbotData?: any
}) {
  const [localProducts, setLocalProducts] = useState(products)
  const [showJsonImport, setShowJsonImport] = useState(false)
  const [jsonText, setJsonText] = useState("")
  const [wpUrl, setWpUrl] = useState("")
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState("")
  const [woocommerceOrdersEnabled, setWoocommerceOrdersEnabled] = useState(
    chatbotData?.chatbot?.woocommerce_orders_enabled || false,
  )
  const [woocommerceApiUrl, setWoocommerceApiUrl] = useState(chatbotData?.chatbot?.woocommerce_api_url || "")
  const [savingSettings, setSavingSettings] = useState(false)
  const [newProduct, setNewProduct] = useState(initialNewProductState) // Initialize newProduct state here

  const handleExportJson = () => {
    const jsonData = JSON.stringify(localProducts, null, 2)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `products-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJson = () => {
    try {
      const imported = JSON.parse(jsonText)
      if (!Array.isArray(imported)) {
        alert("فایل JSON باید یک آرایه باشد")
        return
      }
      setLocalProducts(imported)
      setJsonText("")
      setShowJsonImport(false)
      alert("محصولات با موفقیت وارد شدند")
    } catch (error) {
      alert("خطا در پردازش JSON. لطفا فرمت را بررسی کنید.")
    }
  }

  const importFromWordPress = async () => {
    if (!wpUrl.trim()) {
      alert("لطفا آدرس وب‌سایت را وارد کنید")
      return
    }

    let apiUrl = wpUrl.trim()
    // Add /wp-json/talksell/v1/products if not already present
    if (!apiUrl.includes("/wp-json/talksell/v1/products")) {
      apiUrl = apiUrl.replace(/\/$/, "") + "/wp-json/talksell/v1/products"
    }

    console.log("[v0] Importing products from WordPress:", apiUrl)
    setImporting(true)
    setImportProgress(0)
    setImportStatus("در حال اتصال به سایت...")

    const progressInterval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      setImportStatus("در حال دریافت محصولات...")
      const response = await fetch(apiUrl)

      console.log("[v0] WordPress API response status:", response.status)
      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`خطای ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("پاسخ سرور JSON نیست")
      }

      const data = await response.text()
      console.log("[v0] Raw WordPress data length:", data.length)

      try {
        const parsedData = JSON.parse(data)

        // Check if response has products array structure
        let productsArray = []
        if (parsedData.products && Array.isArray(parsedData.products)) {
          productsArray = parsedData.products
        } else if (Array.isArray(parsedData)) {
          productsArray = parsedData
        } else {
          throw new Error("فرمت داده دریافتی معتبر نیست")
        }

        if (productsArray.length === 0) {
          throw new Error("هیچ محصولی در سایت یافت نشد")
        }

        setImportProgress(100)
        setImportStatus("استخراج کامل شد!")

        // Map WordPress products to our format
        const importedProducts = productsArray.map((wpProduct: any, index: number) => {
          // Clean HTML tags from description
          const cleanDescription = wpProduct.description
            ? wpProduct.description
                .replace(/<[^>]*>/g, " ")
                .replace(/&nbsp;/g, " ")
                .replace(/\s+/g, " ")
                .trim()
            : ""

          return {
            id: Date.now() + index,
            name: wpProduct.name || wpProduct.title || "محصول بدون نام",
            description: cleanDescription.substring(0, 200), // Limit description length
            price: String(Number.parseFloat(wpProduct.price || wpProduct.regular_price || "0")),
            image_url: wpProduct.image_url || wpProduct.image || wpProduct.featured_image || "",
            product_url: wpProduct.product_url || wpProduct.link || wpProduct.permalink || "",
            button_text: wpProduct.button_text || "خرید",
            secondary_text: wpProduct.secondary_text || "جزئیات",
            position: localProducts.length + index,
          }
        })

        console.log("[v0] Successfully imported", importedProducts.length, "products")
        console.log("[v0] Sample product:", importedProducts[0])

        setLocalProducts([...localProducts, ...importedProducts])
        setWpUrl("")

        setTimeout(() => {
          alert(`✅ ${importedProducts.length} محصول با موفقیت وارد شد!`)
          setImportProgress(0)
          setImportStatus("")
        }, 500)
      } catch (parseError: any) {
        console.error("[v0] JSON parse error:", parseError)
        throw new Error(`خطا در پردازش داده‌ها: ${parseError.message}`)
      }
    } catch (error: any) {
      clearInterval(progressInterval)
      console.error("[v0] WordPress import error:", error)
      alert(`❌ ${error.message}`)
      setImportProgress(0)
      setImportStatus("")
    } finally {
      setTimeout(() => {
        setImporting(false)
        setImportProgress(0)
        setImportStatus("")
      }, 1000)
    }
  }

  const saveWooCommerceSettings = async () => {
    if (!chatbotId) return

    setSavingSettings(true)
    try {
      let finalApiUrl = woocommerceApiUrl.trim()
      if (finalApiUrl && !finalApiUrl.includes("/wp-json/talksell/v1/orders")) {
        // Remove trailing slash if present
        finalApiUrl = finalApiUrl.replace(/\/$/, "")
        // Append the API endpoint
        finalApiUrl = `${finalApiUrl}/wp-json/talksell/v1/orders`
      }

      console.log("[v0] Saving WooCommerce settings:", {
        enabled: woocommerceOrdersEnabled,
        url: finalApiUrl,
      })

      const response = await fetch(`/api/dashboard/chatbot/${chatbotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          woocommerce_orders_enabled: woocommerceOrdersEnabled,
          woocommerce_api_url: finalApiUrl,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] WooCommerce settings saved:", result)
        setWoocommerceApiUrl(finalApiUrl)
        alert("✅ تنظیمات WooCommerce با موفقیت ذخیره شد")
      } else {
        const error = await response.json()
        console.error("[v0] Error response:", error)
        alert("❌ خطا در ذخیره تنظیمات")
      }
    } catch (error) {
      console.error("[v0] Error saving WooCommerce settings:", error)
      alert("❌ خطا در ذخیره تنظیمات")
    } finally {
      setSavingSettings(false)
    }
  }

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) return
    setLocalProducts([
      ...localProducts,
      {
        ...newProduct,
        id: Date.now(),
        price: Number.parseFloat(newProduct.price),
        position: localProducts.length,
      },
    ])
    setNewProduct(initialNewProductState) // Reset to initial state
  }

  const deleteProduct = (index: number) => {
    setLocalProducts(localProducts.filter((_, i) => i !== index))
  }

  const updateProduct = (index: number, updates: any) => {
    setLocalProducts(localProducts.map((product, i) => (i === index ? { ...product, ...updates } : product)))
  }

  return (
    <Card className="rounded-2xl border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>مدیریت محصولات و اتصالات</CardTitle>
            <CardDescription>محصولات فروشگاه و اتصال به WooCommerce</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 -mx-6 -mt-6 px-6 py-4 mb-6">
          <Button
            onClick={() => onSave(localProducts)}
            disabled={saving}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg shadow-lg transition-all hover:shadow-xl"
          >
            <Save className="ml-2 h-5 w-5" />
            {saving ? "در حال ذخیره..." : "ذخیره تمام محصولات"}
          </Button>
        </div>

        <WordPressPluginInfo />

        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h4 className="font-bold text-blue-900 flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                اتصال به فروشگاه وردپرس
              </h4>
              <p className="text-sm text-blue-700">دریافت خودکار محصولات و پیگیری سفارشات</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Single URL Input */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-100 shadow-inner">
              <Label htmlFor="wp-site-url" className="text-sm text-blue-900 font-medium mb-2 block">
                آدرس وب‌سایت شما
              </Label>
              <div className="flex gap-3">
                <Input
                  id="wp-site-url"
                  placeholder="https://yoursite.com"
                  value={wpUrl}
                  onChange={(e) => setWpUrl(e.target.value)}
                  className="rounded-2xl border-2 focus:border-blue-500 bg-white flex-1 py-6 text-lg"
                  dir="ltr"
                  disabled={importing}
                />
                <Button
                  onClick={importFromWordPress}
                  disabled={importing || !wpUrl.trim()}
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-6 px-8 text-lg shadow-lg"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent ml-2" />
                      در حال دریافت...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="ml-2 h-5 w-5" />
                      دریافت محصولات
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 فقط آدرس سایت را وارد کنید. محصولات از طریق افزونه TalkSell دریافت می‌شوند
              </p>
            </div>

            {/* Import Progress */}
            {importing && (
              <div className="space-y-3 bg-white rounded-2xl p-6 border-2 border-blue-200 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">{importStatus}</span>
                  <span className="text-sm font-bold text-blue-600">{importProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* API Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Products API Status */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-bold text-blue-900 mb-1">دریافت محصولات</h5>
                    <p className="text-xs text-blue-700">استخراج خودکار محصولات</p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${localProducts.length > 0 ? "bg-green-500" : "bg-gray-300"}`}
                  />
                </div>
                <div className="text-2xl font-bold text-blue-900">{localProducts.length}</div>
                <p className="text-xs text-blue-600 mt-1">محصول در سیستم</p>
              </div>

              {/* WooCommerce Orders API Status */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-bold text-blue-900 mb-1">پیگیری سفارشات</h5>
                    <p className="text-xs text-blue-700">WooCommerce Orders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={woocommerceOrdersEnabled}
                      onChange={(e) => setWoocommerceOrdersEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="text-sm text-blue-900 font-medium">
                  {woocommerceOrdersEnabled ? "✅ فعال" : "⭕ غیرفعال"}
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            {woocommerceOrdersEnabled && (
              <Button
                onClick={saveWooCommerceSettings}
                disabled={savingSettings}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-6 text-lg shadow-lg"
              >
                {savingSettings ? "در حال ذخیره..." : "ذخیره تنظیمات پیگیری سفارشات"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="rounded-xl bg-transparent"
            disabled={localProducts.length === 0}
          >
            صادر کردن JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowJsonImport(!showJsonImport)} className="rounded-xl">
            وارد کردن JSON
          </Button>
        </div>

        {showJsonImport && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
            <h4 className="font-bold mb-4 text-purple-900">وارد کردن از JSON</h4>
            <p className="text-sm text-purple-700 mb-3">
              فرمت JSON باید شامل آرایه‌ای از محصولات با فیلدهای: name, description, price, image_url, button_text,
              secondary_text, product_url باشد.
            </p>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='[{"name": "Product #1", "description": "Product #1 Description", "image_url": "https://example.com/image1.jpg", "price": 150000, "button_text": "Buy", "secondary_text": "More information", "product_url": "https://example.com/product1"}]'
              rows={8}
              className="rounded-xl font-mono text-xs mb-3"
            />
            <div className="flex gap-2">
              <Button onClick={handleImportJson} className="rounded-xl bg-purple-600 hover:bg-purple-700">
                وارد کردن
              </Button>
              <Button variant="outline" onClick={() => setShowJsonImport(false)} className="rounded-xl">
                لغو
              </Button>
            </div>
          </div>
        )}

        {/* Add New Product */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <h4 className="font-bold mb-4 text-green-900">افزودن محصول جدید</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="نام محصول"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="rounded-xl"
              />
              <Input
                placeholder="قیمت (تومان)"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <Textarea
              placeholder="توضیحات محصول"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              rows={2}
              className="rounded-xl"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="آدرس تصویر (URL)"
                value={newProduct.image_url}
                onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                className="rounded-xl"
              />
              <Input
                placeholder="لینک محصول"
                value={newProduct.product_url}
                onChange={(e) => setNewProduct({ ...newProduct, product_url: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="متن دکمه (مثلاً خرید)"
                value={newProduct.button_text}
                onChange={(e) => setNewProduct({ ...newProduct, button_text: e.target.value })}
                className="rounded-xl"
              />
              <Input
                placeholder="متن ثانویه (مثلاً جزئیات)"
                value={newProduct.secondary_text}
                onChange={(e) => setNewProduct({ ...newProduct, secondary_text: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <Button onClick={addProduct} className="rounded-xl bg-green-600 hover:bg-green-700">
              <Plus className="ml-2 h-4 w-4" />
              افزودن محصول
            </Button>
          </div>
        </div>

        {/* Product list section with cards */}
        <div className="space-y-4">
          {localProducts.map((product, index) => (
            <Card key={index} className="rounded-2xl border-2 border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Input
                    value={product.name}
                    onChange={(e) => updateProduct(index, { name: e.target.value })}
                    placeholder="نام محصول"
                    className="rounded-xl font-bold"
                  />
                  <Textarea
                    value={product.description}
                    onChange={(e) => updateProduct(index, { description: e.target.value })}
                    placeholder="توضیحات"
                    rows={2}
                    className="rounded-xl text-sm"
                  />
                  <Input
                    value={product.price}
                    onChange={(e) => updateProduct(index, { price: Number.parseFloat(e.target.value) })}
                    type="number"
                    placeholder="قیمت"
                    className="rounded-xl"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={product.button_text}
                      onChange={(e) => updateProduct(index, { button_text: e.target.value })}
                      placeholder="متن دکمه"
                      className="rounded-xl flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(index)}
                      className="rounded-xl text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Knowledge Base Manager Component
function KnowledgeBaseManager({ chatbotId }: { chatbotId: number }) {
  // Placeholder for Knowledge Base Manager component
  return (
    <Card className="rounded-2xl border-2">
      <CardHeader>
        <CardTitle>مدیریت پایگاه دانش</CardTitle>
        <CardDescription>اطلاعات پایگاه دانش را اضافه یا ویرایش کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">این بخش برای مدیریت پایگاه دانش طراحی شده است.</p>
        {/* Add Knowledge Base Management UI here */}
      </CardContent>
    </Card>
  )
}

function WordPressPluginInfo() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-md">
      {/* Header with icon and title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-blue-900 mb-3 text-center">افزونه وردپرس TalkSell</h3>
          <p className="text-sm text-blue-800 text-center leading-relaxed">
            برای اتصال، دریافت و به‌روزرسانی خودکار محصولات و قیمت‌ها، باید این افزونه را نصب کنید.
          </p>
        </div>
        <div className="bg-blue-500 rounded-2xl p-4 mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-package"
          >
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        </div>
      </div>

      <p className="text-sm text-blue-800 text-center mb-6 leading-relaxed">
        با نصب افزونه، چت‌بات به اطلاعات محصولات و سفارشات دسترسی پیدا می‌کند.
      </p>

      {/* Feature pills grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between border border-blue-100 shadow-sm">
          <span className="text-blue-900 font-medium text-sm">ارسال خودکار محصولات</span>
          <div className="bg-green-100 rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between border border-blue-100 shadow-sm">
          <span className="text-blue-900 font-medium text-sm">نمایش قیمت و ویژگی‌ها</span>
          <div className="bg-green-100 rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between border border-blue-100 shadow-sm">
          <span className="text-blue-900 font-medium text-sm">به‌روزرسانی لحظه‌ای</span>
          <div className="bg-green-100 rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between border border-blue-100 shadow-sm">
          <span className="text-blue-900 font-medium text-sm">پیگیری سفارشات مشتری</span>
          <div className="bg-green-100 rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Download button */}
      <a
        href="https://talksell.ir/wp-content/uploads/2025/12/talksell.zip"
        download
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors mb-3 shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-download"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        دانلود افزونه TalkSell
      </a>

      {/* Tutorial button */}
      <a
        href="https://talksell.ir/2025/12/23/%d8%a2%d9%85%d9%88%d8%b2%d8%b4-%d9%86%d8%b5%d8%a8-%d8%aa%d8%a7%da%a9%d8%b3%d9%84-%d8%a7%d8%b6%d8%a7%d9%81%d9%87-%da%a9%d8%b1%d8%af%d9%86-%d9%87%d9%88%d8%b4-%d9%85%d8%b5%d9%86%d9%88%d8%b9%db%8c-%d8%aa/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-white hover:bg-blue-50 text-blue-600 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors border-2 border-blue-200 shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-book-open"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        آموزش نصب و راه‌اندازی
      </a>
    </div>
  )
}
