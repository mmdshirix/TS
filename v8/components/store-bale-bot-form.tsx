"use client"

import { useEffect, useState } from "react"
import type { BaleBotConfig } from "@/lib/bale-bot-db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, Bot } from "lucide-react"

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  inactive: { label: "غیرفعال", variant: "secondary" },
  pending: { label: "در انتظار راه‌اندازی", variant: "secondary" },
  active: { label: "فعال", variant: "default" },
  error: { label: "خطا", variant: "destructive" },
}

export default function StoreBaleBotForm() {
  const [config, setConfig] = useState<BaleBotConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [botToken, setBotToken] = useState("")
  const [botUsername, setBotUsername] = useState("")
  const [extraEnv, setExtraEnv] = useState<Array<{ key: string; value: string }>>([])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/store/bale-bot")
      const data = await res.json()
      setConfig(data.config)
      if (data.config) {
        setBotToken(data.config.bot_token || "")
        setBotUsername(data.config.bot_username || "")
        setExtraEnv(Object.entries(data.config.extra_env || {}).map(([key, value]) => ({ key, value: String(value) })))
      }
    } catch {
      setError("خطا در دریافت تنظیمات ربات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const handleSave = async () => {
    if (!botToken.trim()) {
      setError("توکن ربات الزامی است")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/store/bale-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_token: botToken, bot_username: botUsername, extra_env: extraEnv }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "خطا در ذخیره تنظیمات")
      setConfig(data.config)
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره تنظیمات")
    } finally {
      setSaving(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm("ربات بله این فروشگاه غیرفعال شود؟")) return
    await fetch("/api/store/bale-bot", { method: "DELETE" })
    await loadConfig()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const statusMeta = STATUS_META[config?.status || "inactive"]

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            راهنمای ساخت ربات بله
          </CardTitle>
          <CardDescription>
            ۱. در اپلیکیشن بله وارد ربات BLM شوید و دستور /newbot را بزنید. ۲. یک نام و نام کاربری برای ربات انتخاب کنید.
            ۳. توکنی که BLM به شما می‌دهد را در فرم زیر وارد کنید. ۴. پس از ذخیره، ربات ظرف چند دقیقه فعال می‌شود.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>تنظیمات ربات</CardTitle>
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {config?.status === "error" && config.last_error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{config.last_error}</p>
          )}

          <div className="space-y-2">
            <Label>توکن ربات</Label>
            <Input value={botToken} onChange={(e) => setBotToken(e.target.value)} dir="ltr" placeholder="123456:ABC-DEF..." className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>نام کاربری ربات (اختیاری)</Label>
            <Input value={botUsername} onChange={(e) => setBotUsername(e.target.value)} dir="ltr" placeholder="my_store_bot" className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>متغیرهای محیطی اضافی (اختیاری)</Label>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setExtraEnv((prev) => [...prev, { key: "", value: "" }])}>
                <Plus className="w-3.5 h-3.5" />
                افزودن
              </Button>
            </div>
            {extraEnv.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={row.key}
                  onChange={(e) => setExtraEnv((prev) => prev.map((r, idx) => (idx === i ? { ...r, key: e.target.value } : r)))}
                  placeholder="KEY"
                  dir="ltr"
                  className="rounded-xl flex-1"
                />
                <Input
                  value={row.value}
                  onChange={(e) => setExtraEnv((prev) => prev.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r)))}
                  placeholder="VALUE"
                  dir="ltr"
                  className="rounded-xl flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => setExtraEnv((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              ذخیره و راه‌اندازی
            </Button>
            {config && config.status !== "inactive" && (
              <Button variant="outline" onClick={handleDisable} className="rounded-xl text-red-500 hover:bg-red-50">
                غیرفعال‌سازی ربات
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
