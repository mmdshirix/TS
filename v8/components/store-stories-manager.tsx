"use client"

import { useEffect, useState } from "react"
import type { StoreStory } from "@/lib/stories-db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2, Trash2, ImageIcon, Upload, Film } from "lucide-react"

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/upload-image", { method: "POST", body: formData })
  const data = await res.json()
  if (!res.ok || !data.url) {
    throw new Error(data.error || "خطا در آپلود فایل")
  }
  return data.url as string
}

export default function StoreStoriesManager() {
  const [stories, setStories] = useState<StoreStory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const [mediaUrl, setMediaUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/store/stories")
      const data = await res.json()
      setStories(data.stories || [])
    } catch {
      setError("خطا در دریافت استوری‌ها")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setTitle("")
    setCoverImageUrl("")
    setMediaType("image")
    setMediaUrl("")
    setLinkUrl("")
    setError("")
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      setCoverImageUrl(await uploadFile(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود کاور")
    } finally {
      setUploadingCover(false)
    }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingMedia(true)
    try {
      setMediaUrl(await uploadFile(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود محتوا")
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("عنوان استوری الزامی است")
      return
    }
    if (!coverImageUrl) {
      setError("تصویر کاور الزامی است")
      return
    }
    if (!mediaUrl) {
      setError("عکس یا ویدیوی استوری الزامی است")
      return
    }

    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/store/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          cover_image_url: coverImageUrl,
          media_url: mediaUrl,
          media_type: mediaType,
          link_url: linkUrl || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "خطا در ایجاد استوری")
      }
      resetForm()
      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ایجاد استوری")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: isActive } : s)))
    await fetch(`/api/store/stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این استوری مطمئن هستید؟")) return
    try {
      await fetch(`/api/store/stories/${id}`, { method: "DELETE" })
      setStories((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setError("خطا در حذف استوری")
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
          افزودن استوری
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-2xl border-2 border-blue-200">
          <CardHeader>
            <CardTitle>استوری جدید</CardTitle>
            <CardDescription>یک کاور و یک عکس یا ویدیو برای نمایش در بالای سایت آپلود کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان استوری</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: تخفیف ویژه" className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>تصویر کاور (دایره‌ای که در نوار بالای سایت نمایش داده می‌شود)</Label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                  {coverImageUrl ? (
                    <img src={coverImageUrl || "/placeholder.svg"} alt="کاور" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <label className="flex-1">
                  <Input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  <div className="rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-2 text-sm text-center cursor-pointer transition-all">
                    {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <><Upload className="w-4 h-4 inline ml-2" />آپلود کاور</>}
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>نوع محتوای استوری</Label>
              <Select
                value={mediaType}
                onValueChange={(v) => {
                  setMediaType(v as "image" | "video")
                  setMediaUrl("")
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">عکس</SelectItem>
                  <SelectItem value="video">ویدیو</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mediaType === "video" ? (
              <div className="space-y-2">
                <Label>لینک ویدیوی استوری (تمام‌صفحه هنگام باز شدن)</Label>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  dir="ltr"
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>عکس استوری (تمام‌صفحه هنگام باز شدن)</Label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                    {mediaUrl ? (
                      <img src={mediaUrl || "/placeholder.svg"} alt="محتوا" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <label className="flex-1">
                    <Input type="file" accept="image/*" className="hidden" onChange={handleMediaUpload} />
                    <div className="rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-2 text-sm text-center cursor-pointer transition-all">
                      {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <><Upload className="w-4 h-4 inline ml-2" />آپلود عکس</>}
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>لینک مقصد (اختیاری)</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                dir="ltr"
                placeholder="/product/my-product یا https://..."
                className="rounded-xl"
              />
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
              ذخیره استوری
            </Button>
          </CardFooter>
        </Card>
      )}

      {stories.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-16 text-center">
            <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">هنوز استوری‌ای اضافه نکرده‌اید</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-4">
          {stories.map((story) => (
            <Card key={story.id} className="rounded-2xl w-40">
              <CardContent className="p-3 space-y-2 text-center">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-100 border-2 border-orange-400">
                  <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{story.title}</p>
                <div className="flex items-center justify-center gap-2">
                  <Switch checked={story.is_active} onCheckedChange={(v) => handleToggleActive(story.id, v)} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(story.id)}
                    className="rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
