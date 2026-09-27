"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Plus, Trash2, Edit, TrendingUp, Calculator } from "lucide-react"

interface FAQ {
  id: number
  question: string
  answer: string
  emoji: string
  position: number
}

interface ChatbotSettings {
  id: number
  name: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  welcome_message: string
  navigation_message: string
  knowledge_base_text: string
  knowledge_base_url: string
  store_url: string
  ai_url: string
  stats_multiplier: number
  response_tone: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ChatbotSettings>({
    id: 1,
    name: "چت‌بات فروشگاه تکنولوژی",
    primary_color: "#2563EB",
    text_color: "#1F2937",
    background_color: "#FFFFFF",
    chat_icon: "🤖",
    position: "bottom-right",
    welcome_message: "سلام! 👋 به فروشگاه تکنولوژی خوش آمدید!",
    navigation_message: "چه چیزی شما را به اینجا آورده است؟",
    knowledge_base_text: "ما یک فروشگاه آنلاین تکنولوژی هستیم...",
    knowledge_base_url: "https://example.com/about",
    store_url: "https://example.com/store",
    ai_url: "https://example.com/ai-info",
    stats_multiplier: 1.0,
    response_tone: "friendly",
  })

  const [faqs, setFaqs] = useState<FAQ[]>([
    { id: 1, question: "محصولات موجود", answer: "ما انواع گوشی هوشمند، لپ‌تاپ، تبلت...", emoji: "📱", position: 0 },
    { id: 2, question: "نحوه سفارش", answer: "برای سفارش کافیست محصول مورد نظرتان را...", emoji: "🛒", position: 1 },
  ])

  const [newFaq, setNewFaq] = useState({ question: "", answer: "", emoji: "❓" })
  const [editingFaq, setEditingFaq] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load settings from API
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/chatbots/1") // Assuming chatbot ID 1
      if (response.ok) {
        const data = await response.json()
        setSettings({
          ...settings,
          ...data,
          stats_multiplier: data.stats_multiplier || 1.0,
          response_tone: data.response_tone || "friendly",
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chatbots/${settings.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert("تنظیمات با موفقیت ذخیره شد!")
      } else {
        alert("خطا در ذخیره تنظیمات")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("خطا در ذخیره تنظیمات")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFaq = () => {
    if (newFaq.question && newFaq.answer) {
      const faq: FAQ = {
        id: Date.now(),
        ...newFaq,
        position: faqs.length,
      }
      setFaqs([...faqs, faq])
      setNewFaq({ question: "", answer: "", emoji: "❓" })
    }
  }

  const handleDeleteFaq = (id: number) => {
    setFaqs(faqs.filter((faq) => faq.id !== id))
  }

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq(faq.id)
  }

  const handleSaveFaq = (id: number, updatedFaq: Partial<FAQ>) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...faq, ...updatedFaq } : faq)))
    setEditingFaq(null)
  }

  const calculateExampleStats = (baseValue: number) => {
    return Math.round(baseValue * settings.stats_multiplier)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تنظیمات چت‌بات</h1>
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
        >
          <Save className="ml-2 h-4 w-4" />
          {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-blue-50/50 h-auto">
          <TabsTrigger
            value="stats"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3 px-4"
          >
            ⭐ ضریب آماری
          </TabsTrigger>
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3 px-4"
          >
            تنظیمات کلی
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3 px-4"
          >
            ظاهر
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3 px-4"
          >
            پیام‌ها
          </TabsTrigger>
          <TabsTrigger
            value="faqs"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3 px-4"
          >
            سوالات متداول
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6 mt-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calculator className="h-6 w-6 text-blue-600" />🎯 تنظیم ضریب آماری
              </CardTitle>
              <CardDescription className="text-lg">
                ضریبی که در آمار نمایش داده شده به کاربران اعمال می‌شود. مثلاً اگر ضریب 2 باشد، آمار دو برابر نمایش داده
                می‌شود.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="stats_multiplier" className="text-lg font-bold">
                    ضریب آماری
                  </Label>
                  <Input
                    id="stats_multiplier"
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={settings.stats_multiplier}
                    onChange={(e) => setSettings({ ...settings, stats_multiplier: Number(e.target.value) })}
                    className="text-2xl font-bold text-center h-16 border-2 border-blue-300 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-600">مقدار بین 0.1 تا 100 وارد کنید. مقدار 1 یعنی بدون تغییر.</p>

                  {/* Quick preset buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[0.5, 1, 2, 5].map((value) => (
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        onClick={() => setSettings({ ...settings, stats_multiplier: value })}
                        className={
                          settings.stats_multiplier === value
                            ? "bg-blue-500 text-white border-blue-500"
                            : "hover:bg-blue-50"
                        }
                      >
                        {value}x
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />📊 پیش‌نمایش آمار
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span>پیام‌ها (واقعی: 10):</span>
                      <span className="font-bold text-blue-600 text-lg">{calculateExampleStats(10)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span>کاربران (واقعی: 5):</span>
                      <span className="font-bold text-green-600 text-lg">{calculateExampleStats(5)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span>تیکت‌ها (واقعی: 3):</span>
                      <span className="font-bold text-orange-600 text-lg">{calculateExampleStats(3)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <h4 className="font-bold text-yellow-800 mb-3 text-lg">⚠️ نکات مهم:</h4>
                <ul className="text-yellow-700 space-y-2">
                  <li>• این ضریب فقط روی آماری که در پنل ادمین نمایش داده می‌شود تأثیر دارد</li>
                  <li>• داده‌های واقعی در دیتابیس تغییر نمی‌کنند</li>
                  <li>• برای نمایش آمار بیشتر از واقعیت، عددی بزرگتر از 1 وارد کنید</li>
                  <li>• برای نمایش آمار کمتر از واقعیت، عددی کوچکتر از 1 وارد کنید</li>
                  <li>• تغییرات بلافاصله در پنل ادمین اعمال می‌شوند</li>
                </ul>
              </div>

              {/* Current multiplier display */}
              <div className="text-center p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                <p className="text-lg">
                  <span className="font-bold">ضریب فعلی:</span>{" "}
                  <span className="text-2xl font-bold text-blue-600">{settings.stats_multiplier}x</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  آمار{" "}
                  {settings.stats_multiplier > 1 ? "افزایش" : settings.stats_multiplier < 1 ? "کاهش" : "بدون تغییر"}{" "}
                  نمایش داده می‌شود
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>اطلاعات کلی</CardTitle>
              <CardDescription>تنظیمات اصلی چت‌بات خود را مدیریت کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">نام چت‌بات</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="position">موقعیت چت‌بات</Label>
                  <Select
                    value={settings.position}
                    onValueChange={(value) => setSettings({ ...settings, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">پایین راست</SelectItem>
                      <SelectItem value="bottom-left">پایین چپ</SelectItem>
                      <SelectItem value="top-right">بالا راست</SelectItem>
                      <SelectItem value="top-left">بالا چپ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="response_tone" className="text-base font-semibold">
                  🎭 لحن پاسخ‌دهی چت‌بات
                </Label>
                <Select
                  value={settings.response_tone}
                  onValueChange={(value) => setSettings({ ...settings, response_tone: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">
                      <div className="flex items-center gap-2">
                        <span>📝</span>
                        <div>
                          <div className="font-semibold">مختصر و مفید</div>
                          <div className="text-xs text-gray-500">پاسخ‌های کوتاه و دقیق</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="friendly">
                      <div className="flex items-center gap-2">
                        <span>😊</span>
                        <div>
                          <div className="font-semibold">دوستانه با ایموجی</div>
                          <div className="text-xs text-gray-500">صمیمی و همراه با ایموجی</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="professional">
                      <div className="flex items-center gap-2">
                        <span>💼</span>
                        <div>
                          <div className="font-semibold">حرفه‌ای</div>
                          <div className="text-xs text-gray-500">رسمی و تخصصی</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="intelligent">
                      <div className="flex items-center gap-2">
                        <span>🧠</span>
                        <div>
                          <div className="font-semibold">هوشمند و تحلیلی</div>
                          <div className="text-xs text-gray-500">تفصیلی با توضیحات کامل</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-2">نحوه پاسخ‌دهی چت‌بات به کاربران را انتخاب کنید</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store_url">آدرس فروشگاه</Label>
                  <Input
                    id="store_url"
                    value={settings.store_url}
                    onChange={(e) => setSettings({ ...settings, store_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ai_url">آدرس صفحه هوش مصنوعی</Label>
                  <Input
                    id="ai_url"
                    value={settings.ai_url}
                    onChange={(e) => setSettings({ ...settings, ai_url: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>تنظیمات ظاهری</CardTitle>
              <CardDescription>رنگ‌ها و آیکون چت‌بات را تنظیم کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary_color">رنگ اصلی</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      className="w-16 h-10 shadow-md border-2 border-blue-200"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="text_color">رنگ متن</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text_color"
                      type="color"
                      value={settings.text_color}
                      onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                      className="w-16 h-10 shadow-md border-2 border-blue-200"
                    />
                    <Input
                      value={settings.text_color}
                      onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="background_color">رنگ پس‌زمینه</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background_color"
                      type="color"
                      value={settings.background_color}
                      onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                      className="w-16 h-10 shadow-md border-2 border-blue-200"
                    />
                    <Input
                      value={settings.background_color}
                      onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="chat_icon">آیکون چت</Label>
                <Input
                  id="chat_icon"
                  value={settings.chat_icon}
                  onChange={(e) => setSettings({ ...settings, chat_icon: e.target.value })}
                  placeholder="🤖"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6 mt-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>پیام‌های چت‌بات</CardTitle>
              <CardDescription>پیام‌های خوشامدگویی و راهنمایی را تنظیم کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="welcome_message">پیام خوشامدگویی</Label>
                <Textarea
                  id="welcome_message"
                  value={settings.welcome_message}
                  onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="navigation_message">پیام راهنمایی</Label>
                <Textarea
                  id="navigation_message"
                  value={settings.navigation_message}
                  onChange={(e) => setSettings({ ...settings, navigation_message: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="knowledge_base_text">متن پایگاه دانش</Label>
                <Textarea
                  id="knowledge_base_text"
                  value={settings.knowledge_base_text}
                  onChange={(e) => setSettings({ ...settings, knowledge_base_text: e.target.value })}
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-6 mt-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>مدیریت سوالات متداول</CardTitle>
              <CardDescription>سوالات متداول چت‌بات را اضافه و ویرایش کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new FAQ */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <h3 className="font-medium mb-3">افزودن سوال جدید</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="ایموجی"
                    value={newFaq.emoji}
                    onChange={(e) => setNewFaq({ ...newFaq, emoji: e.target.value })}
                  />
                  <Input
                    placeholder="سوال"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  />
                  <Input
                    placeholder="پاسخ"
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  />
                  <Button
                    onClick={handleAddFaq}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    افزودن
                  </Button>
                </div>
              </div>

              {/* FAQ List */}
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border rounded-lg p-4">
                    {editingFaq === faq.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input value={faq.emoji} onChange={(e) => handleSaveFaq(faq.id, { emoji: e.target.value })} />
                        <Input
                          value={faq.question}
                          onChange={(e) => handleSaveFaq(faq.id, { question: e.target.value })}
                        />
                        <Input value={faq.answer} onChange={(e) => handleSaveFaq(faq.id, { answer: e.target.value })} />
                        <Button onClick={() => setEditingFaq(null)}>ذخیره</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{faq.emoji}</span>
                          <div>
                            <h4 className="font-medium">{faq.question}</h4>
                            <p className="text-sm text-gray-600">{faq.answer.substring(0, 100)}...</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditFaq(faq)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteFaq(faq.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
