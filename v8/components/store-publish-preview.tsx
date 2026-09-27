"use client"

import { useState } from "react"
import type { Store } from "@/lib/store-db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Copy, Check, ExternalLink, LayoutGrid, Package, RefreshCw, Loader2 } from "lucide-react"

export default function StorePublishPreview({
  store,
  storefrontBaseUrl,
}: {
  store: Store
  storefrontBaseUrl: string
}) {
  const [isPublished, setIsPublished] = useState(store.status === "published")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [previewLoading, setPreviewLoading] = useState(true)

  const liveUrl = `https://${store.slug}.tsll.ir`
  const previewUrl = `${storefrontBaseUrl}/store/${store.slug}${isPublished ? "" : "?preview=1"}`

  const handleTogglePublish = async (checked: boolean) => {
    setSaving(true)
    setError("")
    const previous = isPublished
    setIsPublished(checked)
    try {
      const res = await fetch("/api/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: checked ? "published" : "draft" }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "خطا در تغییر وضعیت انتشار")
      }
    } catch (err) {
      setIsPublished(previous)
      setError(err instanceof Error ? err.message : "خطا در تغییر وضعیت انتشار")
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — ignore, the link is still visible/selectable
    }
  }

  const handleRefreshPreview = () => {
    setPreviewLoading(true)
    setPreviewKey((k) => k + 1)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>انتشار فروشگاه</CardTitle>
              <CardDescription>فروشگاه شما با انتشار، روی دامنه اختصاصی tsll.ir در دسترس عموم قرار می‌گیرد</CardDescription>
            </div>
            <Badge
              variant={isPublished ? "default" : "secondary"}
              className={isPublished ? "bg-green-600 hover:bg-green-600" : ""}
            >
              {isPublished ? "منتشر شده" : "پیش‌نویس"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="font-medium">وضعیت انتشار فروشگاه</p>
              <p className="text-sm text-gray-500 mt-1">
                {isPublished
                  ? "فروشگاه شما فعال است و مشتریان می‌توانند از آن خرید کنند"
                  : "فروشگاه شما فقط برای خودتان در پیش‌نمایش قابل مشاهده است"}
              </p>
            </div>
            <Switch checked={isPublished} onCheckedChange={handleTogglePublish} disabled={saving} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="space-y-2">
            <p className="text-sm font-medium">آدرس فروشگاه شما</p>
            <div className="flex gap-2">
              <Input value={liveUrl} readOnly dir="ltr" className="rounded-xl font-mono text-sm" />
              <Button type="button" variant="outline" size="icon" onClick={handleCopy} className="rounded-xl shrink-0">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="outline" className="rounded-xl shrink-0">
                  <ExternalLink className="w-4 h-4 ml-2" />
                  مشاهده فروشگاه
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>پیش‌نمایش زنده</CardTitle>
              <CardDescription>نمایی از فروشگاه شما همان‌طور که مشتریان آن را می‌بینند</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleRefreshPreview} className="rounded-xl">
              <RefreshCw className="w-4 h-4 ml-2" />
              بازخوانی
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/store/landing">
              <Button type="button" variant="outline" size="sm" className="rounded-xl">
                <LayoutGrid className="w-4 h-4 ml-2" />
                ویرایش متن‌ها و بلوک‌های صفحه
              </Button>
            </Link>
            <Link href="/dashboard/store/products">
              <Button type="button" variant="outline" size="sm" className="rounded-xl">
                <Package className="w-4 h-4 ml-2" />
                ویرایش محصولات
              </Button>
            </Link>
          </div>

          <div className="relative rounded-xl border overflow-hidden bg-gray-50" style={{ height: "70vh" }}>
            {previewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            )}
            <iframe
              key={previewKey}
              src={previewUrl}
              title="پیش‌نمایش فروشگاه"
              className="w-full h-full border-0"
              onLoad={() => setPreviewLoading(false)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
