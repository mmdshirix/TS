"use client"

import { useState } from "react"
import type { Store } from "@/lib/store-db"
import { STORE_CATEGORIES } from "@/lib/store-categories"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload, CheckCircle2, Image as ImageIcon } from "lucide-react"

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

const HEADER_STYLES = [
  { value: "classic", label: "کلاسیک", description: "لوگو راست، منو و جستجو در یک ردیف" },
  { value: "centered", label: "وسط‌چین", description: "لوگو و نام فروشگاه در مرکز هدر" },
  { value: "minimal", label: "مینیمال", description: "نوار جمع‌وجور با تمرکز روی جستجو" },
]

function HeaderStylePreview({ style, color, secondaryColor }: { style: string; color: string; secondaryColor: string }) {
  if (style === "centered") {
    return (
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="h-10 flex flex-col items-center justify-center gap-1 border-b">
          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
          <div className="flex gap-1.5">
            <div className="w-3 h-1 rounded-full bg-gray-300" />
            <div className="w-3 h-1 rounded-full bg-gray-300" />
            <div className="w-3 h-1 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    )
  }
  if (style === "minimal") {
    return (
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="h-10 flex items-center gap-1.5 px-2 border-b">
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <div className="flex-1 h-2.5 rounded-full bg-gray-100" />
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryColor }} />
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="h-10 flex items-center justify-between px-2 border-b">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          <div className="w-6 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-1 rounded-full bg-gray-300" />
          <div className="w-3 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: secondaryColor }} />
      </div>
    </div>
  )
}

export default function StoreSettingsForm({ store }: { store: Store }) {
  const [name, setName] = useState(store.name)
  const [description, setDescription] = useState(store.description || "")
  const [category, setCategory] = useState(store.category || "")
  const [logoUrl, setLogoUrl] = useState(store.logo_url || "")
  const [faviconUrl, setFaviconUrl] = useState(store.favicon_url || "")
  const [primaryColor, setPrimaryColor] = useState(store.color_scheme?.primary || "#2563eb")
  const [secondaryColor, setSecondaryColor] = useState(store.color_scheme?.secondary || "#0ea5e9")
  const [navColor, setNavColor] = useState(store.color_scheme?.nav || "")
  const [headerStyle, setHeaderStyle] = useState(store.color_scheme?.header_style || "classic")
  const [contactPhone, setContactPhone] = useState(store.contact_phone || "")
  const [contactAddress, setContactAddress] = useState(store.contact_address || "")
  const [instagram, setInstagram] = useState(store.social_links?.instagram || "")
  const [telegram, setTelegram] = useState(store.social_links?.telegram || "")
  const [isPublished, setIsPublished] = useState(store.status === "published")
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
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

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFavicon(true)
    try {
      setFaviconUrl(await uploadImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود آیکون")
    } finally {
      setUploadingFavicon(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError("")
    try {
      const res = await fetch("/api/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          color_scheme: {
            ...(store.color_scheme || {}),
            primary: primaryColor,
            secondary: secondaryColor,
            header_style: headerStyle,
            ...(navColor ? { nav: navColor } : { nav: undefined }),
          },
          contact_phone: contactPhone,
          contact_address: contactAddress,
          social_links: { instagram, telegram },
          status: isPublished ? "published" : "draft",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "خطا در ذخیره تنظیمات")
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره تنظیمات")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>اطلاعات پایه</CardTitle>
          <CardDescription>نام، توضیحات و دسته‌بندی فروشگاه شما</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">نام فروشگاه</Label>
            <Input id="store-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-description">توضیحات فروشگاه</Label>
            <Textarea
              id="store-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>دسته‌بندی فروشگاه</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="انتخاب دسته‌بندی" />
              </SelectTrigger>
              <SelectContent>
                {STORE_CATEGORIES.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <Label>وضعیت انتشار</Label>
              <p className="text-sm text-gray-500 mt-1">
                {isPublished ? "فروشگاه شما فعال و قابل مشاهده است" : "فروشگاه شما هنوز پیش‌نویس است"}
              </p>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>برندینگ</CardTitle>
          <CardDescription>لوگو، آیکون مرورگر و رنگ اصلی فروشگاه</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label>آیکون تب مرورگر (فاوآیکون)</Label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {faviconUrl ? (
                    <img src={faviconUrl || "/placeholder.svg"} alt="فاوآیکون" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <label className="flex-1">
                  <Input type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
                  <div className="rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-2 text-sm text-center cursor-pointer transition-all">
                    {uploadingFavicon ? (
                      <Loader2 className="w-4 h-4 animate-spin inline" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 inline ml-2" />
                        آپلود آیکون
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">رنگ اصلی فروشگاه</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-11 w-16 rounded-xl cursor-pointer"
                />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-color">رنگ ثانویه (تکمیلی)</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-11 w-16 rounded-xl cursor-pointer"
                />
                <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nav-color">رنگ نوار پایین (منوی موبایل)</Label>
            <p className="text-xs text-gray-500">در صورت خالی گذاشتن، از ترکیب رنگ اصلی و ثانویه استفاده می‌شود</p>
            <div className="flex gap-2">
              <Input
                id="nav-color"
                type="color"
                value={navColor || primaryColor}
                onChange={(e) => setNavColor(e.target.value)}
                className="h-11 w-16 rounded-xl cursor-pointer"
              />
              <Input
                value={navColor}
                onChange={(e) => setNavColor(e.target.value)}
                placeholder="پیش‌فرض (خودکار)"
                className="flex-1 rounded-xl"
              />
              {navColor && (
                <Button type="button" variant="outline" onClick={() => setNavColor("")} className="rounded-xl">
                  بازنشانی
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>طرح هدر سایت</CardTitle>
          <CardDescription>یکی از سه مدل هدر را برای نمایش در صفحات فروشگاه انتخاب کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {HEADER_STYLES.map((h) => (
              <button
                key={h.value}
                type="button"
                onClick={() => setHeaderStyle(h.value)}
                className={`text-right rounded-xl border-2 p-3 transition-colors ${
                  headerStyle === h.value ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <HeaderStylePreview style={h.value} color={primaryColor} secondaryColor={secondaryColor} />
                <p className="text-sm font-medium text-gray-900 mt-2">{h.label}</p>
                <p className="text-xs text-gray-500">{h.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>اطلاعات تماس و شبکه‌های اجتماعی</CardTitle>
          <CardDescription>این اطلاعات در صفحه تماس با ما و چت‌بات نمایش داده می‌شود</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-phone">شماره تماس</Label>
              <Input
                id="contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                dir="ltr"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">آیدی اینستاگرام</Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                dir="ltr"
                placeholder="@yourstore"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram">آیدی تلگرام</Label>
              <Input
                id="telegram"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                dir="ltr"
                placeholder="@yourstore"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-address">آدرس فروشگاه</Label>
            <Textarea
              id="contact-address"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> ذخیره شد
            </p>
          )}
          <div className="flex-1" />
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            ذخیره تغییرات
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
