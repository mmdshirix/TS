"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { THEME_PRESETS } from "@/lib/theme-presets"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Store,
  LayoutGrid,
  Palette,
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Upload,
  Image as ImageIcon,
} from "lucide-react"

const STEPS = [
  { id: 1, title: "اطلاعات فروشگاه", icon: Store, description: "نام، توضیحات و دسته‌بندی" },
  { id: 2, title: "انتخاب دسته‌بندی", icon: LayoutGrid, description: "دسته‌بندی اصلی فروشگاه شما" },
  { id: 3, title: "برندینگ", icon: Palette, description: "لوگو و رنگ اصلی" },
  { id: 4, title: "درگاه پرداخت", icon: CreditCard, description: "درگاه‌های پرداخت پشتیبانی‌شده" },
  { id: 5, title: "بازبینی و راه‌اندازی", icon: CheckCircle2, description: "تایید نهایی و ساخت فروشگاه" },
]

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/upload-image", { method: "POST", body: formData })
  const data = await res.json()
  if (!res.ok || !data.url) {
    throw new Error(data.error || "خطا در آپلود تصویر")
  }
  return data.url as string
}

export default function StoreCreateWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [primaryColor, setPrimaryColor] = useState("#2563eb")
  const [secondaryColor, setSecondaryColor] = useState("#0ea5e9")
  const [surfaceColor, setSurfaceColor] = useState("#f0f9ff")
  const [radius, setRadius] = useState("0.5rem")
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      setLogoUrl(await uploadImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود لوگو")
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) {
      setError("لطفاً نام فروشگاه را وارد کنید")
      return
    }
    if (currentStep === 2 && !category) {
      setError("لطفاً یک دسته‌بندی انتخاب کنید")
      return
    }
    setError("")
    if (currentStep < STEPS.length) setCurrentStep((s) => s + 1)
  }

  const handlePrevious = () => {
    setError("")
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  const handleLaunch = async () => {
    setCreating(true)
    setError("")
    try {
      const createRes = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, category }),
      })
      const createData = await createRes.json()
      if (!createRes.ok) {
        throw new Error(createData.error || "خطا در ساخت فروشگاه")
      }

      if (logoUrl || primaryColor) {
        await fetch("/api/store", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logo_url: logoUrl,
            color_scheme: { primary: primaryColor, secondary: secondaryColor, surface: surfaceColor, radius },
          }),
        })
      }

      router.push("/dashboard/store/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ساخت فروشگاه")
      setCreating(false)
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 md:p-8 -m-4 sm:-m-6 rounded-none">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300",
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                          ? "bg-blue-600 text-white ring-4 ring-blue-200"
                          : "bg-gray-200 text-gray-500",
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs mt-2 text-gray-700 font-medium hidden md:block text-center">
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-1 mx-1 sm:mx-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{ width: currentStep > step.id ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-2xl border-2 border-blue-200 shadow-xl">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-l from-blue-50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                {(() => {
                  const Icon = STEPS[currentStep - 1].icon
                  return <Icon className="w-6 h-6 text-white" />
                })()}
              </div>
              <div>
                <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wizard-name">نام فروشگاه</Label>
                  <Input
                    id="wizard-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: فروشگاه من"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wizard-description">توضیحات فروشگاه</Label>
                  <Textarea
                    id="wizard-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="توضیح کوتاهی درباره فروشگاه خود بنویسید"
                    className="rounded-xl resize-none"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {THEME_PRESETS.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setCategory(theme.id)
                      setPrimaryColor(theme.primary)
                      setSecondaryColor(theme.secondary)
                      setSurfaceColor(theme.surface)
                      setRadius(theme.radius)
                    }}
                    className={cn(
                      "rounded-2xl border-2 overflow-hidden text-right transition-all",
                      category === theme.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300",
                    )}
                  >
                    <div className="h-28 bg-gray-100 overflow-hidden">
                      <img src={theme.previewImage || "/placeholder.svg"} alt={theme.label} className="w-full h-full object-cover" />
                    </div>
                    <div className={cn("p-3 text-sm font-medium", category === theme.id ? "text-blue-700" : "text-gray-700")}>
                      {theme.label}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>لوگوی فروشگاه</Label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {logoUrl ? (
                        <img src={logoUrl || "/placeholder.svg"} alt="لوگو" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <label className="flex-1">
                      <Input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <div className="rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-2 text-sm text-center cursor-pointer transition-all">
                        {uploadingLogo ? (
                          <Loader2 className="w-4 h-4 animate-spin inline" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4 inline ml-2" />
                            آپلود لوگو
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wizard-color">رنگ اصلی فروشگاه</Label>
                  <div className="flex gap-2">
                    <Input
                      id="wizard-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-11 w-16 rounded-xl cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  پس از راه‌اندازی فروشگاه، می‌توانید هر یک از درگاه‌های زیر را از بخش تنظیمات درگاه پرداخت فعال کنید:
                </p>
                {["زرین‌پال", "بله‌پی (درون‌برنامه‌ای و ربات)", "کارت به کارت"].map((gateway) => (
                  <div key={gateway} className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">{gateway}</span>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-900 mb-1">آماده راه‌اندازی</p>
                      <p className="text-sm text-green-700">
                        فروشگاه «{name}» با دسته‌بندی{" "}
                        {THEME_PRESETS.find((t) => t.id === category)?.label || "—"} ساخته خواهد شد.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  پس از راه‌اندازی، می‌توانید محصولات خود را اضافه کنید.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t pt-6">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex-1" />
            {currentStep > 1 && (
              <Button type="button" onClick={handlePrevious} variant="outline" className="gap-2 rounded-xl">
                <ChevronRight className="w-4 h-4" />
                قبلی
              </Button>
            )}
            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                className="gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700"
              >
                بعدی
                <ChevronLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleLaunch}
                disabled={creating}
                className="gap-2 rounded-xl bg-gradient-to-l from-purple-600 to-pink-600"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    در حال ساخت...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    راه‌اندازی فروشگاه
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
