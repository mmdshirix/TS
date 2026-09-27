"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product, ProductCategory } from "@/lib/store-db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, ImageIcon, ArrowRight } from "lucide-react"
import Link from "next/link"

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

const PRODUCT_TYPES = [
  { value: "physical", label: "فیزیکی" },
  { value: "digital", label: "دیجیتال (دانلودی)" },
  { value: "service", label: "خدماتی" },
]

export default function StoreProductEditForm({
  product,
  categories,
  initialImageUrl,
}: {
  product: Product
  categories: ProductCategory[]
  initialImageUrl: string
}) {
  const router = useRouter()
  const [name, setName] = useState(product.name)
  const [price, setPrice] = useState(String(product.price))
  const [compareAtPrice, setCompareAtPrice] = useState(
    product.compare_at_price !== null && product.compare_at_price !== undefined ? String(product.compare_at_price) : "",
  )
  const [type, setType] = useState(product.type)
  const [categoryId, setCategoryId] = useState(product.category_id ? String(product.category_id) : "")
  const [description, setDescription] = useState(product.description || "")
  const [videoUrl, setVideoUrl] = useState(product.video_url || "")
  const [status, setStatus] = useState(product.status)
  const [inventoryCount, setInventoryCount] = useState(
    product.inventory_count !== null && product.inventory_count !== undefined ? String(product.inventory_count) : "",
  )
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      setImageUrl(await uploadImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود تصویر")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError("نام محصول الزامی است")
      return
    }
    if (compareAtPrice && Number(compareAtPrice) <= Number(price)) {
      setError("قیمت قبل از تخفیف باید بیشتر از قیمت فروش باشد")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/store/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
          type,
          category_id: categoryId ? Number(categoryId) : null,
          description,
          video_url: videoUrl,
          status,
          inventory_count: inventoryCount ? Number(inventoryCount) : null,
          image_urls: imageUrl ? [imageUrl] : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "خطا در ذخیره محصول")
      }
      router.push("/dashboard/store/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره محصول")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/dashboard/store/products" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <ArrowRight className="w-4 h-4" />
        بازگشت به محصولات
      </Link>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>اطلاعات محصول</CardTitle>
          <CardDescription>ویرایش جزئیات محصول</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نام محصول</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>قیمت (تومان)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>قیمت قبل از تخفیف (اختیاری)</Label>
              <Input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="برای نمایش برچسب تخفیف"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع محصول</Label>
              <Select value={type} onValueChange={(v) => setType(v as Product["type"])}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>دسته‌بندی</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="بدون دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {type === "physical" && (
              <div className="space-y-2">
                <Label>موجودی انبار</Label>
                <Input type="number" value={inventoryCount} onChange={(e) => setInventoryCount(e.target.value)} className="rounded-xl" />
              </div>
            )}
            <div className="space-y-2">
              <Label>وضعیت</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Product["status"])}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">فعال</SelectItem>
                  <SelectItem value="draft">پیش‌نویس</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>توضیحات محصول</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="rounded-xl resize-none" />
          </div>
          <div className="space-y-2">
            <Label>لینک ویدیو محصول (اختیاری)</Label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} dir="ltr" placeholder="https://..." className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>تصویر محصول</Label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {imageUrl ? (
                  <img src={imageUrl || "/placeholder.svg"} alt="محصول" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <label className="flex-1">
                <Input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-2 text-sm text-center cursor-pointer transition-all">
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <><Upload className="w-4 h-4 inline ml-2" />تغییر تصویر</>}
                </div>
              </label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex-1" />
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            ذخیره تغییرات
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
