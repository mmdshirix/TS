"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Plus, Trash2, Upload, ImageIcon, MoveUp, MoveDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Chatbot, ChatbotFAQ, ChatbotProduct } from "@/lib/db"
import ProductsManager from "@/components/products-manager"

interface ChatbotSettingsFormProps {
  chatbot: Chatbot
}

export default function ChatbotSettingsForm({ chatbot }: ChatbotSettingsFormProps) {
  const [settings, setSettings] = useState<Chatbot>(chatbot)
  const [faqs, setFaqs] = useState<Partial<ChatbotFAQ>[]>([])
  const [loadingFaqs, setLoadingFaqs] = useState(true)
  const [products, setProducts] = useState<Partial<ChatbotProduct>[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadFaqs()
    loadProducts()
  }, [chatbot.id])

  // For debugging state changes
  useEffect(() => {
    console.log("FAQs state updated:", faqs)
  }, [faqs])

  useEffect(() => {
    console.log("Products state updated:", products)
  }, [products])

  const loadFaqs = async () => {
    try {
      setLoadingFaqs(true)
      const response = await fetch(`/api/chatbots/${chatbot.id}/faqs`)
      if (response.ok) {
        const data = await response.json()
        setFaqs(Array.isArray(data) ? data : [])
      } else {
        throw new Error("Failed to load FAQs")
      }
    } catch (error) {
      console.error("Error loading FAQs:", error)
      toast({
        title: "❌ خطا",
        description: "خطا در بارگذاری سوالات متداول",
        variant: "destructive",
      })
      setFaqs([])
    } finally {
      setLoadingFaqs(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const response = await fetch(`/api/chatbots/${chatbot.id}/products`)
      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } else {
        throw new Error("Failed to load products")
      }
    } catch (error) {
      console.error("Error loading products:", error)
      toast({
        title: "❌ خطا",
        description: "خطا در بارگذاری محصولات",
        variant: "destructive",
      })
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoadingSettings(true)
    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save settings")
      }
      toast({
        title: "✅ موفقیت",
        description: "تنظیمات با موفقیت ذخیره شد!",
      })
    } catch (error: any) {
      toast({
        title: "❌ خطا",
        description: error.message || "خطا در ذخیره تنظیمات",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const handleSaveFaqs = async () => {
    setIsLoadingFaqs(true)
    try {
      const validFaqs = faqs
        .filter((faq) => faq.question?.trim() && faq.answer?.trim())
        .map((faq, index) => ({
          ...faq,
          position: index,
        }))

      const response = await fetch(`/api/chatbots/${chatbot.id}/faqs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validFaqs),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save FAQs")
      }

      toast({
        title: "✅ موفقیت",
        description: "سوالات متداول با موفقیت ذخیره شد!",
      })
      await loadFaqs()
    } catch (error: any) {
      toast({
        title: "❌ خطا",
        description: error.message || "خطا در ذخیره سوالات متداول",
        variant: "destructive",
      })
    } finally {
      setIsLoadingFaqs(false)
    }
  }

  const handleSaveProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const validProducts = products
        .filter((p) => p.name?.trim())
        .map((p, index) => ({
          ...p,
          position: index,
        }))

      const response = await fetch(`/api/chatbots/${chatbot.id}/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validProducts),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save products")
      }

      toast({
        title: "✅ موفقیت",
        description: "محصولات با موفقیت ذخیره شد!",
      })
      await loadProducts()
    } catch (error: any) {
      toast({
        title: "❌ خطا",
        description: error.message || "خطا در ذخیره محصولات",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({ title: "❌ خطا", description: "لطفاً فقط فایل تصویری انتخاب کنید", variant: "destructive" })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "❌ خطا", description: "حجم فایل نباید بیشتر از 5 مگابایت باشد", variant: "destructive" })
      return
    }

    setIsLoadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/upload", { method: "POST", body: formData })
      if (!response.ok) throw new Error("Upload failed")
      const data = await response.json()
      setSettings({ ...settings, chat_icon: data.url })
      toast({ title: "✅ موفقیت", description: "تصویر با موفقیت آپلود شد!" })
    } catch (error) {
      toast({ title: "❌ خطا", description: "خطا در آپلود تصویر", variant: "destructive" })
    } finally {
      setIsLoadingImage(false)
    }
  }

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "", emoji: "❓", position: faqs.length }])
  const updateFaq = (index: number, field: keyof ChatbotFAQ, value: string) => {
    setFaqs(faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)))
  }
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index))
  const moveFaq = (index: number, direction: "up" | "down") => {
    const newFaqs = [...faqs]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newFaqs.length) return
    ;[newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]]
    setFaqs(newFaqs)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تنظیمات چت‌بات</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-blue-50/50 h-auto">
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
            value="faqs"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3 px-4"
          >
            سوالات متداول
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3 px-4"
          >
            محصولات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>اطلاعات کلی</CardTitle>
                  <CardDescription>تنظیمات اصلی چت‌بات خود را مدیریت کنید</CardDescription>
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isLoadingSettings}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                >
                  <Save className="ml-2 h-4 w-4" />
                  {isLoadingSettings ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                </Button>
              </div>
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
                  value={settings.response_tone || "friendly"}
                  onValueChange={(value) => setSettings({ ...settings, response_tone: value })}
                >
                  <SelectTrigger className="mt-2 rounded-xl">
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

              <div>
                <Label htmlFor="welcome_message">پیام خوشامدگویی</Label>
                <Textarea
                  id="welcome_message"
                  value={settings.welcome_message}
                  onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                  rows={3}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="knowledge_base_text">متن پایگاه دانش</Label>
                <Textarea
                  id="knowledge_base_text"
                  value={settings.knowledge_base_text || ""}
                  onChange={(e) => setSettings({ ...settings, knowledge_base_text: e.target.value })}
                  rows={8}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>تنظیمات ظاهری</CardTitle>
                  <CardDescription>رنگ‌ها و آیکون چت‌بات را تنظیم کنید</CardDescription>
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isLoadingSettings}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                >
                  <Save className="ml-2 h-4 w-4" />
                  {isLoadingSettings ? "در حال ذخیره..." : "ذخیره ظاهر"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <div className="space-y-4">
                <Label>آیکون چت‌بات</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">آیکون فعلی:</span>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm border-2 border-gray-200"
                      style={{ backgroundColor: settings.primary_color }}
                    >
                      {settings.chat_icon &&
                      (settings.chat_icon.startsWith("http") || settings.chat_icon.startsWith("/uploads/")) ? (
                        <img
                          src={settings.chat_icon || "/placeholder.svg"}
                          alt="Chat Icon"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">{settings.chat_icon}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isLoadingImage}
                  />
                  <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoadingImage}
                    className="mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isLoadingImage ? "در حال آپلود..." : "آپلود تصویر"}
                  </Button>
                  <p className="text-xs text-gray-500">حداکثر 5MB - JPG, PNG, GIF</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-6 mt-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>مدیریت سوالات متداول</CardTitle>
                  <CardDescription>سوالات متداول چت‌بات را اضافه و ویرایش کنید</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveFaqs}
                    disabled={isLoadingFaqs}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                  >
                    <Save className="ml-2 h-4 w-4" />
                    {isLoadingFaqs ? "در حال ذخیره..." : "ذخیره سوالات"}
                  </Button>
                  <Button onClick={addFaq} variant="outline">
                    <Plus className="ml-2 h-4 w-4" />
                    افزودن سوال
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingFaqs ? (
                <div className="text-center py-4">در حال بارگذاری...</div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-1">
                          <Label>ایموجی</Label>
                          <Input
                            value={faq.emoji || ""}
                            onChange={(e) => updateFaq(index, "emoji", e.target.value)}
                            placeholder="❓"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <Label>سوال</Label>
                          <Input
                            value={faq.question || ""}
                            onChange={(e) => updateFaq(index, "question", e.target.value)}
                            placeholder="سوال شما..."
                          />
                        </div>
                        <div className="md:col-span-5">
                          <Label>پاسخ</Label>
                          <Textarea
                            value={faq.answer || ""}
                            onChange={(e) => updateFaq(index, "answer", e.target.value)}
                            placeholder="پاسخ شما..."
                            rows={2}
                          />
                        </div>
                        <div className="md:col-span-2 flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveFaq(index, "up")}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveFaq(index, "down")}
                            disabled={index === faqs.length - 1}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removeFaq(index)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {faqs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>هیچ سوال متداولی تعریف نشده است. برای افزودن سوال، روی دکمه "افزودن سوال" کلیک کنید.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6 mt-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>مدیریت محصولات فروشگاه</CardTitle>
                  <CardDescription>محصولات فروشگاه خود را مدیریت کنید</CardDescription>
                </div>
                <Button
                  onClick={handleSaveProducts}
                  disabled={isLoadingProducts}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg"
                >
                  <Save className="ml-2 h-4 w-4" />
                  {isLoadingProducts ? "در حال ذخیره..." : "ذخیره محصولات"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="text-center py-4">در حال بارگذاری...</div>
              ) : (
                <ProductsManager products={products} setProducts={setProducts} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
