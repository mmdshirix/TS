"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  Save,
  RefreshCw,
  Check,
  X as XIcon,
  Cpu,
  Key,
  ExternalLink,
  Globe,
} from "lucide-react"

// The real gateway URL contains an access token, so it lives server-side in ARVAN_API_URL
const ARVAN_API_URL_DISPLAY = "https://arvancloudai.ir/gateway/models/Xerxes-1/•••/v1"

interface AISettings {
  id: string
  provider: "deepseek" | "arvan"
  apiKey: string
  apiUrl: string
  model: string
}

export default function SuperAdminAISettings() {
  const [settings, setSettings] = useState<AISettings>({
    id: "1",
    provider: "deepseek",
    apiKey: "",
    apiUrl: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/super-admin/settings?key=ai_provider")
      const data = await res.json()
      const savedProvider = data?.value as "deepseek" | "arvan" | undefined

      if (savedProvider) {
        setSettings((prev) => ({
          ...prev,
          provider: savedProvider,
          apiUrl: savedProvider === "arvan"
            ? ARVAN_API_URL_DISPLAY
            : "https://api.deepseek.com/chat/completions",
          model: savedProvider === "arvan" ? "Xerxes-1" : "deepseek-chat",
        }))
      }

      const keyResponse = await fetch("/api/super-admin/settings?key=ai_api_key")
      const keyData = await keyResponse.json()
      if (keyData?.value) {
        setSettings((prev) => ({ ...prev, apiKey: keyData.value }))
      }
    } catch (err) {
      console.error("Error fetching settings:", err)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSaved(false)

    try {
      // Save AI provider
      await fetch("/api/super-admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setting_key: "ai_provider",
          setting_value: settings.provider,
        }),
      })

      // Save API key
      await fetch("/api/super-admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setting_key: "ai_api_key",
          setting_value: settings.apiKey,
        }),
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError("خطا در ذخیره تنظیمات")
    } finally {
      setLoading(false)
    }
  }

  const handleProviderChange = (provider: "deepseek" | "arvan") => {
    setSettings({
      ...settings,
      provider,
      apiUrl: provider === "arvan"
        ? ARVAN_API_URL_DISPLAY
        : "https://api.deepseek.com/chat/completions",
      model: provider === "arvan" ? "Xerxes-1" : "deepseek-chat",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">تنظیمات هوش مصنوعی</h1>
            <p className="text-purple-200">مدیریت سرویس دهندگان و کلیدهای API</p>
          </div>
        </div>

        <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">سرویس دهنده هوش مصنوعی</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-purple-200 font-medium">سرویس دهنده</Label>
                <Select
                  value={settings.provider}
                  onValueChange={(v) => handleProviderChange(v as "deepseek" | "arvan")}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="deepseek" className="cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-500 text-white rounded-xl">DeepSeek</Badge>
                        <span>DeepSeek AI (پیش‌فرض)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="arvan" className="cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-500 text-white rounded-xl">آروان</Badge>
                        <span>Arvan Cloud AI (محلی)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-purple-200 font-medium">کلید API</Label>
                <div className="relative">
                  <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    placeholder={settings.provider === "deepseek" ? "sk-..." : "کلید API آروان..."}
                    className="pr-12 bg-white/10 border-white/20 text-white placeholder:text-purple-300 h-12 rounded-2xl"
                  />
                </div>
                <p className="text-xs text-purple-300">
                  {settings.provider === "deepseek"
                    ? "کلید API دیپ‌سیک را وارد کنید (از https://platform.deepseek.com)"
                    : "کلید API آروان کلود را وارد کنید (از https://arvancloudai.ir)"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-purple-200 font-medium">آدرس API</Label>
                <Input
                  value={settings.apiUrl}
                  onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                  className="bg-white/10 border-white/20 text-white h-12 rounded-2xl"
                  readOnly
                />
                <p className="text-xs text-purple-300">آدرس به صورت خودکار تنظیم می‌شود</p>
              </div>

              <div className="space-y-2">
                <Label className="text-purple-200 font-medium">مدل</Label>
                <Input
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  className="bg-white/10 border-white/20 text-white h-12 rounded-2xl"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {saved && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <p className="text-green-300">تنظیمات با موفقیت ذخیره شد</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12 rounded-2xl"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-5 h-5 ml-2" />
                    ذخیره شد
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 ml-2" />
                    ذخیره تنظیمات
                  </>
                )}
              </Button>
              <a
                href={settings.provider === "arvan" ? "https://arvancloudai.ir" : "https://platform.deepseek.com"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-white/20 text-purple-200 hover:bg-white/10"
                >
                  <ExternalLink className="w-5 h-5 ml-2" />
                  دریافت کلید API
                </Button>
              </a>
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="text-lg font-bold text-white mb-4">راهنمای استفاده</h3>
              <div className="space-y-4 text-purple-200 text-sm">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="font-semibold text-white mb-2">DeepSeek AI:</p>
                  <ul className="list-disc list-inside mr-4 space-y-1">
                    <li>سرویس هوش مصنوعی بین‌المللی</li>
                    <li>کیفیت بالا در پاسخ‌دهی</li>
                    <li>قیمت مناسب</li>
                    <li>سایت: <span className="text-blue-300">https://platform.deepseek.com</span></li>
                  </ul>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="font-semibold text-white mb-2">Arvan Cloud AI:</p>
                  <ul className="list-disc list-inside mr-4 space-y-1">
                    <li>سرویس هوش مصنوعی ایرانی</li>
                    <li>داده‌های داخل ایران</li>
                    <li>سرعت بالا برای کاربران ایران</li>
                    <li>سایت: <span className="text-blue-300">https://arvancloudai.ir</span></li>
                  </ul>
                </div>
                <p className="text-xs text-purple-300 mt-4">
                  نکته: شما می‌توانید برای هر چت‌بات، سرویس دهنده متفاوتی را در تنظیمات چت‌بات انتخاب کنید.
                  این تنظیمات برای تمام چت‌بات‌های جدید استفاده خواهد شد.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}