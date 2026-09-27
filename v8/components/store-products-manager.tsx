"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Product, ProductCategory } from "@/lib/store-db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Trash2, Pencil, Package, ImageIcon, Upload, Search } from "lucide-react"

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

export default function StoreProductsManager() {
  const [products, setProducts] = useState<(Product & { image_url: string | null })[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [compareAtPrice, setCompareAtPrice] = useState("")
  const [type, setType] = useState("physical")
  const [categoryId, setCategoryId] = useState<string>("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/store/products"),
        fetch("/api/store/categories"),
      ])
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      setProducts(productsData.products || [])
      setCategories(categoriesData.categories || [])
    } catch (err) {
      setError("خطا در دریافت اطلاعات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setName("")
    setPrice("")
    setCompareAtPrice("")
    setType("physical")
    setCategoryId("")
    setDescription("")
    setImageUrl("")
    setVideoUrl("")
    setError("")
  }

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

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("نام محصول الزامی است")
      return
    }
    if (!price || Number.isNaN(Number(price))) {
      setError("قیمت محصول الزامی است")
      return
    }
    if (compareAtPrice && Number(compareAtPrice) <= Number(price)) {
      setError("قیمت قبل از تخفیف باید بیشتر از قیمت فروش باشد")
      return
    }

    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
          type,
          category_id: categoryId ? Number(categoryId) : null,
          description,
          image_urls: imageUrl ? [imageUrl] : [],
          video_url: videoUrl,
          status: "active",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "خطا در ایجاد محصول")
      }
      resetForm()
      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ایجاد محصول")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) return
    try {
      await fetch(`/api/store/products/${id}`, { method: "DELETE" })
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError("خطا در حذف محصول")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm((s) => !s)} className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 gap-2">
          <Plus className="w-4 h-4" />
          افزودن محصول
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-2xl border-2 border-blue-200">
          <CardHeader>
            <CardTitle>محصول جدید</CardTitle>
            <CardDescription>اطلاعات محصول را وارد کنید</CardDescription>
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
                <Select value={type} onValueChange={setType}>
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
            </div>
            <div className="space-y-2">
              <Label>توضیحات محصول</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl resize-none" />
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
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <><Upload className="w-4 h-4 inline ml-2" />آپلود تصویر</>}
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-6">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex-1" />
            <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">
              انصراف
            </Button>
            <Button onClick={handleCreate} disabled={saving} className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              ذخیره محصول
            </Button>
          </CardFooter>
        </Card>
      )}

      {products.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی محصول..."
            className="rounded-xl pr-10"
          />
        </div>
      )}

      {products.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">هنوز محصولی اضافه نکرده‌اید</p>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-400 py-10">محصولی با این نام یافت نشد</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const hasDiscount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
            const discountPercent = hasDiscount
              ? Math.round(100 - (Number(product.price) / Number(product.compare_at_price)) * 100)
              : 0

            return (
              <Card key={product.id} className="rounded-2xl overflow-hidden">
                <div className="relative aspect-square bg-gray-50">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-3" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                  <Badge
                    variant={product.status === "active" ? "default" : "secondary"}
                    className="absolute top-2 right-2"
                  >
                    {product.status === "active" ? "فعال" : "پیش‌نویس"}
                  </Badge>
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-1">
                      {discountPercent}٪
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(product.id)}
                    aria-label="حذف محصول"
                    className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <CardContent className="p-3 space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5em]">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {Number(product.compare_at_price).toLocaleString()}
                      </span>
                    )}
                    <span className="text-sm font-bold text-gray-900">{Number(product.price).toLocaleString()} تومان</span>
                  </div>
                  <Link href={`/dashboard/store/products/${product.id}`}>
                    <Button variant="outline" size="sm" className="w-full rounded-xl gap-2">
                      <Pencil className="w-3.5 h-3.5" />
                      ویرایش
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
