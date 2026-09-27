"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, CheckCircle, AlertCircle, Upload, ArrowRight, ArrowLeft } from "lucide-react"

interface TicketFormProps {
  chatbotId: number
}

export function TicketForm({ chatbotId }: TicketFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      let imageUrl: string | null = null
      if (image) {
        console.log("[v0] Uploading image to imgCDN.dev...")
        const imageFormData = new FormData()
        imageFormData.append("file", image)

        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: imageFormData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
          console.log("[v0] Image uploaded:", imageUrl)
        } else {
          console.error("[v0] Failed to upload image")
          setSubmitStatus("error")
          setIsSubmitting(false)
          return
        }
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          chatbot_id: chatbotId,
          image_url: imageUrl,
        }),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({
          name: "",
          phone: "",
          subject: "",
          message: "",
        })
        setImage(null)
        setImagePreview(null)
        setStep(1)
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("Error submitting ticket:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStep1Valid = formData.name.trim() && formData.phone.trim()
  const isStep2Valid = formData.subject.trim() && formData.message.trim()

  if (submitStatus === "success") {
    return (
      <Card className="w-full border-0 shadow-none bg-white dark:bg-white">
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900 mb-2">تیکت شما با موفقیت ارسال شد!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-600 mb-6">
            تیکت شما دریافت شد و تیم پشتیبانی به زودی پاسخ خواهد داد.
          </p>
          <Button
            onClick={() => setSubmitStatus("idle")}
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:text-white"
          >
            ارسال تیکت جدید
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-0 shadow-none bg-white dark:bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-900">ارسال تیکت پشتیبانی</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-600 mt-1">
          {step === 1 ? "مرحله 1: اطلاعات تماس" : "مرحله 2: جزئیات تیکت"}
        </p>
        <div className="flex gap-2 mt-4">
          <div
            className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-200"}`}
          ></div>
          <div
            className={`flex-1 h-2 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-200"}`}
          ></div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-700 mb-2 block">
                  نام و نام خانوادگی *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="rounded-2xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 dark:bg-white dark:text-gray-900 dark:border-gray-300 dark:placeholder:text-gray-400 [color-scheme:light]"
                  placeholder="نام کامل خود را وارد کنید"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-700 mb-2 block">
                  شماره تماس *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="rounded-2xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 dark:bg-white dark:text-gray-900 dark:border-gray-300 dark:placeholder:text-gray-400 [color-scheme:light]"
                  placeholder="09xxxxxxxxx"
                  dir="ltr"
                />
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:text-white h-12 text-base font-medium"
              >
                مرحله بعد
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-700 mb-2 block">
                  موضوع تیکت *
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="rounded-2xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 dark:bg-white dark:text-gray-900 dark:border-gray-300 dark:placeholder:text-gray-400 [color-scheme:light]"
                  placeholder="موضوع تیکت خود را وارد کنید"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-700 mb-2 block">
                  توضیحات کامل *
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="rounded-2xl border-gray-300 resize-none bg-white text-gray-900 placeholder:text-gray-400 dark:bg-white dark:text-gray-900 dark:border-gray-300 dark:placeholder:text-gray-400 [color-scheme:light]"
                  placeholder="لطفاً توضیحات کامل مشکل یا سوال خود را بنویسید..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-700 mb-2 block">
                  تصویر ضمیمه (اختیاری)
                </Label>
                <div className="relative">
                  <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <Label
                    htmlFor="image"
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-300 rounded-2xl p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-50 transition-colors bg-white dark:bg-white"
                  >
                    {imagePreview ? (
                      <div className="relative w-full">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                          <span className="text-white text-sm">کلیک برای تغییر</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-600">آپلود تصویر</span>
                      </>
                    )}
                  </Label>
                </div>
              </div>

              {submitStatus === "error" && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-600 text-sm bg-red-50 dark:bg-red-50 p-3 rounded-2xl">
                  <AlertCircle className="w-4 h-4" />
                  خطا در ارسال تیکت. لطفاً دوباره تلاش کنید.
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 rounded-2xl h-12 text-base font-medium bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-gray-300 dark:border-gray-300"
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                  بازگشت
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isStep2Valid}
                  className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:text-white h-12 text-base font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      در حال ارسال...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      ارسال تیکت
                    </div>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export { TicketForm as default }
