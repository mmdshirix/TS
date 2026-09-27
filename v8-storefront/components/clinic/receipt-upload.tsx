"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2, CheckCircle2 } from "lucide-react"

export default function AppointmentReceiptUpload({ number, existing, endpoint }: { number: string; existing: string | null; endpoint?: string }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(Boolean(existing))
  const [error, setError] = useState("")

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const up = await fetch("/api/upload", { method: "POST", body: fd })
      const upData = await up.json()
      if (!up.ok || !upData.url) throw new Error(upData.error || "خطا در آپلود")
      const res = await fetch(endpoint || `/api/clinic/appointments/${number}/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: upData.url }),
      })
      if (!res.ok) throw new Error("خطا در ثبت فیش")
      setDone(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا")
    } finally {
      setUploading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
        <CheckCircle2 className="w-5 h-5" /> فیش پرداخت دریافت شد؛ پس از بررسی، تایید نهایی پیامک می‌شود.
      </div>
    )
  }

  return (
    <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-theme p-6 cursor-pointer hover:border-brand transition text-sm text-muted">
      {uploading ? <Loader2 className="w-6 h-6 animate-spin text-brand" /> : <Upload className="w-6 h-6 text-brand" />}
      {uploading ? "در حال بارگذاری…" : "برای بارگذاری تصویر فیش کلیک کنید"}
      <input type="file" accept="image/*,.pdf" className="hidden" onChange={onFile} disabled={uploading} />
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </label>
  )
}
