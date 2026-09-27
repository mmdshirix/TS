"use client"

import { useEffect, useState } from "react"
import type { ExplorerPost } from "@/lib/explorer-db"
import type { Product } from "@/lib/store-db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Loader2, Trash2, Film, ImageIcon, Upload, Tag } from "lucide-react"

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

type PostWithProducts = ExplorerPost & { product_ids: number[] }

export default function StoreExplorerManager() {
  const [posts, setPosts] = useState<PostWithProducts[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [error, setError] = useState("")

  const [videoUrl, setVideoUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      const [postsRes, productsRes] = await Promise.all([
        fetch("/api/store/explorer"),
        fetch("/api/store/products"),
      ])
      const postsData = await postsRes.json()
      const productsData = await productsRes.json()
      setPosts(postsData.posts || [])
      setProducts(productsData.products || [])
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
    setVideoUrl("")
    setThumbnailUrl("")
    setCaption("")
    setSelectedProductIds([])
    setError("")
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingThumb(true)
    try {
      setThumbnailUrl(await uploadImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود تصویر بندانگشتی")
    } finally {
      setUploadingThumb(false)
    }
  }

  const toggleProduct = (id: number) => {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const handleCreate = async () => {
    if (!videoUrl.trim()) {
      setError("لینک ویدیو الزامی است")
      return
    }

    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/store/explorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl || null,
          caption,
          status: "published",
          product_ids: selectedProductIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "خطا در ایجاد پست")
      }
      resetForm()
      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ایجاد پست")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این پست اکسپلور مطمئن هستید؟")) return
    try {
      await fetch(`/api/store/explorer/${id}`, { method: "DELETE" })
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError("خطا در حذف پست")
    }
  }

  const toggleStatus = async (post: PostWithProducts) => {
    const nextStatus = post.status === "published" ? "draft" : "published"
    try {
      await fetch(`/api/store/explorer/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p)))
    } catch (err) {
      setError("خطا در تغییر وضعیت پست")
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
          افزودن ویدیو اکسپلور
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-2xl border-2 border-blue-200">
          <CardHeader>
            <CardTitle>ویدیو جدید اکسپلور</CardTitle>
            <CardDescription>لینک ویدیو اینستاگرام/ریلز خود را وارد کرده و محصولات مرتبط را سنجاق کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>لینک ویدیو</Label>
              <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} dir="ltr" placeholder="https://..." className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>کپشن</Label>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} className="rounded-xl resize-none" />
            </div>
            <div className="space-y-2">
              <Label>تصویر بندانگشتی (اختیاری)</Label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl || "/placeholder.svg"} alt="بندانگشتی" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <label className="flex-1">
                  <Input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                  <div className="rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-2 text-sm text-center cursor-pointer transition-all">
                    {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <><Upload className="w-4 h-4 inline ml-2" />آپلود تصویر</>}
                  </div>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>سنجاق کردن محصولات</Label>
              {products.length === 0 ? (
                <p className="text-sm text-gray-500">ابتدا یک محصول اضافه کنید</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border rounded-xl p-3">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={selectedProductIds.includes(p.id)} onCheckedChange={() => toggleProduct(p.id)} />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              )}
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
              ذخیره
            </Button>
          </CardFooter>
        </Card>
      )}

      {posts.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-16 text-center">
            <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">هنوز ویدیویی به اکسپلور اضافه نکرده‌اید</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="rounded-2xl overflow-hidden">
              <div className="aspect-[9/16] bg-gray-100 flex items-center justify-center overflow-hidden">
                {post.thumbnail_url ? (
                  <img src={post.thumbnail_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Film className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-700 line-clamp-2 flex-1">{post.caption || "بدون کپشن"}</p>
                  <Badge
                    onClick={() => toggleStatus(post)}
                    variant={post.status === "published" ? "default" : "secondary"}
                    className="cursor-pointer flex-shrink-0"
                  >
                    {post.status === "published" ? "منتشر شده" : "پیش‌نویس"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Tag className="w-3.5 h-3.5" />
                  {post.product_ids.length} محصول سنجاق‌شده
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                  className="w-full rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
