"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Plus, Globe, FileText, Paperclip, Code, HelpCircle, Package, Download, Upload } from "lucide-react"

interface KnowledgeBaseEntry {
  id: number
  chatbot_id: number
  type: "url" | "text" | "product" | "faq" | "file" | "wordpress" | "api"
  title: string
  content: string
  source_url: string | null
  file_name?: string
  file_size?: number
  file_type?: string
  created_at: string
  updated_at: string
}

interface KnowledgeBaseManagerProps {
  chatbots: Array<{ id: number; name: string }>
}

export default function KnowledgeBaseManager({ chatbots }: KnowledgeBaseManagerProps) {
  const [selectedChatbotId, setSelectedChatbotId] = useState<number>(chatbots[0]?.id || 0)
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseEntry[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // Form states
  const [newUrl, setNewUrl] = useState("")
  const [newText, setNewText] = useState({ title: "", content: "" })
  const [uploadingFile, setUploadingFile] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (selectedChatbotId) {
      loadKnowledgeBase()
      autoSync()
    }
  }, [selectedChatbotId])

  const autoSync = async () => {
    try {
      // Sync FAQs silently
      await fetch(`/api/dashboard/chatbot/${selectedChatbotId}/knowledge-base`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-faqs" }),
      })

      // Sync Products silently
      await fetch(`/api/dashboard/chatbot/${selectedChatbotId}/knowledge-base`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-products" }),
      })

      // Reload knowledge base
      await loadKnowledgeBase()
    } catch (error) {
      console.error("Auto-sync error:", error)
    }
  }

  const loadKnowledgeBase = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/dashboard/chatbot/${selectedChatbotId}/knowledge-base`)
      if (response.ok) {
        const data = await response.json()
        setKnowledgeBase(data.knowledgeBase || [])
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error("Error loading knowledge base:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setProcessing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/dashboard/chatbot/${selectedChatbotId}/knowledge-base`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        await loadKnowledgeBase()
        setShowAddModal(false)
        setSelectedType(null)
        alert("فایل با موفقیت آپلود و پردازش شد")
      } else {
        const error = await response.json()
        alert(error.error || "خطا در آپلود فایل")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("خطا در آپلود فایل")
    } finally {
      setUploadingFile(false)
      setProcessing(false)
    }
  }

  const scrapeUrl = async () => {
    if (!newUrl.trim()) {
      alert("لطفا یک آدرس URL وارد کنید")
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/dashboard/chatbot/${selectedChatbotId}/knowledge-base`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scrape-url", url: newUrl }),
      })

      if (response.ok) {
        await loadKnowledgeBase()
        setNewUrl("")
        setShowAddModal(false)
        setSelectedType(null)
        alert("محتوای URL با موفقیت استخراج شد")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "خطا در استخراج محتوای URL")
      }
    } catch (error) {
      alert("خطا در استخراج محتوای URL")
    } finally {
      setProcessing(false)
    }
  }

  const addTextEntry = async () => {
    if (!newText.title.trim() || !newText.content.trim()) {
      alert("لطفا عنوان و محتوا را وارد کنید")
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/dashboard/chatbot/${selectedChatbotId}/knowledge-base`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-text", entry: newText }),
      })

      if (response.ok) {
        await loadKnowledgeBase()
        setNewText({ title: "", content: "" })
        setShowAddModal(false)
        setSelectedType(null)
        alert("محتوای متنی با موفقیت اضافه شد")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "خطا در افزودن محتوای متنی")
      }
    } catch (error) {
      alert("خطا در افزودن محتوای متنی")
    } finally {
      setProcessing(false)
    }
  }

  const deleteEntry = async (entryId: number) => {
    if (!confirm("آیا از حذف این ورودی اطمینان دارید؟")) return

    try {
      const response = await fetch(`/api/dashboard/chatbot/${selectedChatbotId}/knowledge-base?entryId=${entryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadKnowledgeBase()
        alert("ورودی با موفقیت حذف شد")
      }
    } catch (error) {
      alert("خطا در حذف ورودی")
    }
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      url: <Globe className="h-5 w-5" />,
      text: <FileText className="h-5 w-5" />,
      file: <Paperclip className="h-5 w-5" />,
      product: <Package className="h-5 w-5" />,
      faq: <HelpCircle className="h-5 w-5" />,
      wordpress: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.158.956a11.043 11.043 0 00-8.55 3.655A10.955 10.955 0 00.956 13.16c0 3.2 1.388 6.086 3.595 8.085a10.955 10.955 0 008.607 2.76 11.043 11.043 0 008.55-3.655 10.955 10.955 0 002.652-8.549c0-3.2-1.388-6.086-3.595-8.085a10.955 10.955 0 00-8.607-2.76zM12 21.05a9.05 9.05 0 119.05-9.05A9.06 9.06 0 0112 21.05z" />
        </svg>
      ),
      api: <Code className="h-5 w-5" />,
    }
    return icons[type as keyof typeof icons] || <FileText className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="bg-blue-600 p-4 rounded-2xl flex-shrink-0">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">پایگاه دانش چیست؟</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                پایگاه دانش مجموعه‌ای از اطلاعات است که چت‌بات شما از آن برای پاسخ‌دهی استفاده می‌کند. با افزودن محتوا به
                پایگاه دانش، می‌توانید چت‌بات خود را هوشمندتر کنید.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-xl">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">محتوای متنی</h3>
                    <p className="text-sm text-gray-600">افزودن متن، سوالات متداول و مقالات</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">استخراج از وب‌سایت</h3>
                    <p className="text-sm text-gray-600">افزودن محتوای صفحات وب به صورت خودکار</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-xl">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">آپلود فایل</h3>
                    <p className="text-sm text-gray-600">PDF، Word، Excel، JSON و فایل‌های متنی</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-xl">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">محصولات و سوالات</h3>
                    <p className="text-sm text-gray-600">همگام‌سازی خودکار از فروشگاه وردپرس</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-yellow-800">
                    <strong>نکته:</strong> محصولات و سوالات متداول به صورت خودکار از بخش مربوطه به پایگاه دانش اضافه
                    می‌شوند و نیازی به افزودن دستی ندارند.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">پایگاه‌های دانش</h2>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => {
              window.open("https://talksell.ir/2025/12/23/آموزش-نصب-تاکسل-اضافه-کردن-هوش-مصنوعی-ت/", "_blank")
            }}
            variant="outline"
            className="rounded-2xl border-2 hover:bg-blue-50"
          >
            <Download className="ml-2 h-5 w-5 text-blue-600" />
            ادویه فرز
          </Button>

          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                <Plus className="ml-2 h-5 w-5" />
                ایجاد پایگاه دانش جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-center">افزودن داده به پایگاه دانش</DialogTitle>
              </DialogHeader>

              {!selectedType ? (
                <div className="grid grid-cols-2 gap-4 p-6">
                  <button
                    onClick={() => setSelectedType("faq")}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="bg-gray-100 p-4 rounded-2xl">
                      <HelpCircle className="h-8 w-8 text-gray-700" />
                    </div>
                    <span className="font-semibold text-gray-900">پرسش و پاسخ</span>
                  </button>

                  <button
                    onClick={() => setSelectedType("text")}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="bg-gray-100 p-4 rounded-2xl">
                      <FileText className="h-8 w-8 text-gray-700" />
                    </div>
                    <span className="font-semibold text-gray-900">متن</span>
                  </button>

                  <button
                    onClick={() => setSelectedType("url")}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="bg-gray-100 p-4 rounded-2xl">
                      <Globe className="h-8 w-8 text-gray-700" />
                    </div>
                    <span className="font-semibold text-gray-900">وبسایت</span>
                  </button>

                  <button
                    onClick={() => setSelectedType("file")}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="bg-gray-100 p-4 rounded-2xl">
                      <Paperclip className="h-8 w-8 text-gray-700" />
                    </div>
                    <span className="font-semibold text-gray-900">فایل متنی</span>
                  </button>

                  <button
                    onClick={() => setSelectedType("wordpress")}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="bg-gray-100 p-4 rounded-2xl">
                      <svg className="h-8 w-8 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.158.956a11.043 11.043 0 00-8.55 3.655A10.955 10.955 0 00.956 13.16c0 3.2 1.388 6.086 3.595 8.085a10.955 10.955 0 008.607 2.76 11.043 11.043 0 008.55-3.655 10.955 10.955 0 002.652-8.549c0-3.2-1.388-6.086-3.595-8.085a10.955 10.955 0 00-8.607-2.76zM12 21.05a9.05 9.05 0 119.05-9.05A9.06 9.06 0 0112 21.05z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-900">وردپرس</span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 bg-gray-50 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <div className="bg-gray-200 p-4 rounded-2xl relative">
                      <Code className="h-8 w-8 text-gray-500" />
                      <div className="absolute top-0 right-0 bg-gray-400 rounded-full p-1">
                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-500">API</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {selectedType === "file" && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        فایل‌های PDF، Word، Excel، JSON یا متنی را آپلود کنید (حداکثر ۷ مگابایت)
                      </p>
                      <div className="border-2 border-dashed rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-blue-600 font-medium hover:text-blue-700">فایل را انتخاب کنید</span>
                          <span className="text-gray-600"> یا بکشید و رها کنید</span>
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.json,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploadingFile}
                        />
                      </div>
                      {uploadingFile && (
                        <div className="text-center text-sm text-blue-600">در حال آپلود و پردازش فایل...</div>
                      )}
                    </div>
                  )}

                  {selectedType === "url" && (
                    <div className="space-y-4">
                      <Label>آدرس وب‌سایت</Label>
                      <Input
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="rounded-2xl"
                        dir="ltr"
                      />
                      <Button
                        onClick={scrapeUrl}
                        disabled={processing}
                        className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700"
                      >
                        {processing ? "در حال استخراج..." : "استخراج محتوا"}
                      </Button>
                    </div>
                  )}

                  {selectedType === "text" && (
                    <div className="space-y-4">
                      <div>
                        <Label>عنوان</Label>
                        <Input
                          value={newText.title}
                          onChange={(e) => setNewText({ ...newText, title: e.target.value })}
                          placeholder="عنوان محتوا"
                          className="rounded-2xl"
                        />
                      </div>
                      <div>
                        <Label>محتوا</Label>
                        <Textarea
                          value={newText.content}
                          onChange={(e) => setNewText({ ...newText, content: e.target.value })}
                          placeholder="متن را وارد کنید..."
                          rows={8}
                          className="rounded-2xl"
                        />
                      </div>
                      <Button
                        onClick={addTextEntry}
                        disabled={processing}
                        className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700"
                      >
                        {processing ? "در حال ذخیره..." : "ذخیره محتوا"}
                      </Button>
                    </div>
                  )}

                  {selectedType === "faq" && (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">سوالات متداول به صورت خودکار به پایگاه دانش اضافه می‌شوند</p>
                      <Button
                        onClick={() => {
                          setShowAddModal(false)
                          setSelectedType(null)
                        }}
                        variant="outline"
                        className="rounded-2xl"
                      >
                        بستن
                      </Button>
                    </div>
                  )}

                  {selectedType === "wordpress" && (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">برای اتصال وردپرس، از بخش محصولات استفاده کنید</p>
                      <Button
                        onClick={() => {
                          setShowAddModal(false)
                          setSelectedType(null)
                        }}
                        variant="outline"
                        className="rounded-2xl"
                      >
                        بستن
                      </Button>
                    </div>
                  )}

                  <Button onClick={() => setSelectedType(null)} variant="ghost" className="w-full rounded-2xl">
                    بازگشت
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-3xl border-2 shadow-lg">
        <CardContent className="p-6">
          {knowledgeBase.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">پایگاه دانش خالی است</h3>
              <p className="text-gray-600">با کلیک بر روی دکمه "ایجاد پایگاه دانش جدید" شروع کنید</p>
            </div>
          ) : (
            <div className="space-y-3">
              {knowledgeBase.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gray-100 p-3 rounded-xl">{getTypeIcon(entry.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{entry.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{entry.content.substring(0, 100)}...</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="rounded-xl text-xs">
                          {entry.type === "url" && "وب‌سایت"}
                          {entry.type === "text" && "متن"}
                          {entry.type === "file" && "فایل"}
                          {entry.type === "product" && "محصول"}
                          {entry.type === "faq" && "سوال متداول"}
                          {entry.type === "wordpress" && "وردپرس"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteEntry(entry.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
