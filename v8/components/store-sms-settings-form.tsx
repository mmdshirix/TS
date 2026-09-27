"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle2, MessageSquare } from "lucide-react"

interface Settings {
  provider: "sms_ir" | "melipayamak"
  otp_enabled: boolean
  sms_ir_api_key: string
  sms_ir_template_id: string
  melipayamak_username: string
  melipayamak_password: string
  melipayamak_body_id: string
}

const EMPTY: Settings = {
  provider: "sms_ir",
  otp_enabled: false,
  sms_ir_api_key: "",
  sms_ir_template_id: "",
  melipayamak_username: "",
  melipayamak_password: "",
  melipayamak_body_id: "",
}

export default function StoreSmsSettingsForm() {
  const [settings, setSettings] = useState<Settings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/store/sms-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            provider: data.settings.provider,
            otp_enabled: data.settings.otp_enabled,
            sms_ir_api_key: data.settings.sms_ir_api_key || "",
            sms_ir_template_id: data.settings.sms_ir_template_id || "",
            melipayamak_username: data.settings.melipayamak_username || "",
            melipayamak_password: data.settings.melipayamak_password || "",
            melipayamak_body_id: data.settings.melipayamak_body_id || "",
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError("")
    try {
      const res = await fetch("/api/store/sms-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const data = await res.json()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle>تایید پیامکی شماره تلفن (OTP)</CardTitle>
              <CardDescription>پیش از ثبت سفارش، شماره تلفن مشتری با کد پیامکی تایید می‌شود</CardDescription>
            </div>
            <Switch checked={settings.otp_enabled} onCheckedChange={(v) => setSettings((s) => ({ ...s, otp_enabled: v }))} />
          </div>
        </CardHeader>
        {settings.otp_enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>سرویس‌دهنده پیامک</Label>
              <Select value={settings.provider} onValueChange={(v: "sms_ir" | "melipayamak") => setSettings((s) => ({ ...s, provider: v }))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms_ir">SMS.ir</SelectItem>
                  <SelectItem value="melipayamak">ملی پیامک</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.provider === "sms_ir" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>کلید API (SMS.ir)</Label>
                  <Input
                    value={settings.sms_ir_api_key}
                    onChange={(e) => setSettings((s) => ({ ...s, sms_ir_api_key: e.target.value }))}
                    dir="ltr"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>شناسه قالب تایید (Template ID)</Label>
                  <Input
                    value={settings.sms_ir_template_id}
                    onChange={(e) => setSettings((s) => ({ ...s, sms_ir_template_id: e.target.value }))}
                    dir="ltr"
                    className="rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>نام کاربری ملی پیامک</Label>
                  <Input
                    value={settings.melipayamak_username}
                    onChange={(e) => setSettings((s) => ({ ...s, melipayamak_username: e.target.value }))}
                    dir="ltr"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رمز عبور</Label>
                  <Input
                    type="password"
                    value={settings.melipayamak_password}
                    onChange={(e) => setSettings((s) => ({ ...s, melipayamak_password: e.target.value }))}
                    dir="ltr"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>شناسه پترن (Body ID)</Label>
                  <Input
                    value={settings.melipayamak_body_id}
                    onChange={(e) => setSettings((s) => ({ ...s, melipayamak_body_id: e.target.value }))}
                    dir="ltr"
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500">
              راهنمای کامل ساخت قالب/پترن تایید در بخش «مستندات و آموزش‌ها» موجود است.
            </p>
          </CardContent>
        )}
        <CardFooter className="flex items-center justify-between border-t pt-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> ذخیره شد
            </p>
          )}
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
