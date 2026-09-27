"use client"

import { useEffect, useState } from "react"
import type { ProductCategory } from "@/lib/store-db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Trash2, Tags, ImageIcon, Upload } from "lucide-react"

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

export default function StoreCategoriesManager() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/store/categories")
      const data = await res.json()
      setCategories(data.categories || [])
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
    setImageUrl("")
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
      setError("نام دسته‌بندی الزامی است")
      return
    }

    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/store/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image_url: imageUrl || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "خطا در ایجاد دسته‌بندی")
      }
      resetForm()
      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ایجاد دسته‌بندی")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟")) return
    try {
      await fetch(`/api/store/categories?id=${id}`, { method: "DELETE" })
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError("خطا در حذف دسته‌بندی")
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
          افزودن دسته‌بندی
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-2xl border-2 border-blue-200">
          <CardHeader>
            <CardTitle>دسته‌بندی جدید</CardTitle>
            <CardDescription>نام و تصویر دسته‌بندی را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>نام دسته‌بندی</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>تصویر دسته‌بندی</Label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {imageUrl ? (
                    <img src={imageUrl || "/placeholder.svg"} alt="دسته‌بندی" className="w-full h-full object-cover" />
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
              ذخیره دسته‌بندی
            </Button>
          </CardFooter>
        </Card>
      )}

      {categories.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-16 text-center">
            <Tags className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">هنوز دسته‌بندی اضافه نکرده‌اید</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="rounded-2xl overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border flex items-center justify-center flex-shrink-0">
                  {category.image_url ? (
                    <img src={category.image_url || "/placeholder.svg"} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <Tags className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
