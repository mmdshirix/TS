"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Cpu, Save, RefreshCw, Check, Zap, Key, Globe, Activity, ShieldCheck, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"

type ProviderId = "arvan" | "deepseek"

interface ProviderState {
  configured: boolean
  apiUrl?: string
  apiKeyMasked: string
  model: string
  source: "database" | "env" | "none"
}

interface AISettingsResponse {
  provider: ProviderId
  fallbackEnabled: boolean
  arvan: ProviderState
  deepseek: ProviderState
}

interface TestResult {
  ok: boolean
  latencyMs: number
  model: string
  error?: string
  sample?: string
}

const PROVIDERS: Array<{ id: ProviderId; name: string; tagline: string; accent: string; docs: string }> = [
  {
    id: "arvan",
    name: "ArvanCloud AI",
    tagline: "سرور داخل ایران، تاخیر بسیار کم، پیش‌فرض پلتفرم",
    accent: "from-emerald-500 to-teal-500",
    docs: "https://arvancloudai.ir",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    tagline: "سرویس بین‌المللی، به‌عنوان گزینه جایگزین",
    accent: "from-blue-500 to-indigo-500",
    docs: "https://platform.deepseek.com",
  },
]

export default function SuperAdminAISettings() {
  const [data, setData] = useState<AISettingsResponse | null>(null)
  const [provider, setProvider] = useState<ProviderId>("arvan")
  const [fallback, setFallback] = useState(true)
  const [arvanUrl, setArvanUrl] = useState("")
  const [arvanKey, setArvanKey] = useState("")
  const [arvanModel, setArvanModel] = useState("")
  const [deepseekKey, setDeepseekKey] = useState("")
  const [deepseekModel, setDeepseekModel] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tests, setTests] = useState<Partial<Record<ProviderId, TestResult | "loading">>>({})

  const load = async () => {
    const res = await fetch("/api/super-admin/ai", { cache: "no-store" })
    if (!res.ok) return
    const json = (await res.json()) as AISettingsResponse
    setData(json)
    setProvider(json.provider)
    setFallback(json.fallbackEnabled)
    setArvanModel(json.arvan.model)
    setDeepseekModel(json.deepseek.model)
  }

  useEffect(() => {
    load().catch(() => setError("خطا در دریافت تنظیمات"))
  }, [])

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, string> = {
        ai_provider: provider,
        ai_fallback_enabled: fallback ? "true" : "false",
        arvan_model: arvanModel,
        deepseek_model: deepseekModel,
      }
      if (arvanUrl.trim()) payload.arvan_api_url = arvanUrl.trim()
      if (arvanKey.trim()) payload.arvan_api_key = arvanKey.trim()
      if (deepseekKey.trim()) payload.deepseek_api_key = deepseekKey.trim()

      const res = await fetch("/api/super-admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setArvanKey("")
      setDeepseekKey("")
      setArvanUrl("")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      await load()
    } catch {
      setError("خطا در ذخیره تنظیمات")
    } finally {
      setSaving(false)
    }
  }

  const runTest = async (id: ProviderId) => {
    setTests((t) => ({ ...t, [id]: "loading" }))
    try {
      const res = await fetch(`/api/super-admin/ai?test=${id}`, { method: "PUT" })
      const json = (await res.json()) as TestResult
      setTests((t) => ({ ...t, [id]: json }))
    } catch {
      setTests((t) => ({ ...t, [id]: { ok: false, latencyMs: 0, model: "", error: "اتصال برقرار نشد" } }))
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] p-4 sm:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">موتور هوش مصنوعی</h1>
            <p className="text-slate-300 text-sm">انتخاب سرویس‌دهنده، مدیریت کلیدها و تست سرعت پاسخ</p>
          </div>
        </div>

        {/* Provider picker */}
        <div className="grid md:grid-cols-2 gap-4">
          {PROVIDERS.map((p) => {
            const state = data?.[p.id]
            const active = provider === p.id
            const test = tests[p.id]
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id)}
                className={cn(
                  "relative text-right rounded-3xl p-5 border transition-all duration-300 bg-white/5 backdrop-blur",
                  active ? "border-white/60 shadow-[0_0_0_1px_rgba(255,255,255,.4),0_20px_60px_-20px_rgba(168,85,247,.6)]" : "border-white/10 hover:border-white/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center", p.accent)}>
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold flex items-center gap-2">
                        {p.name}
                        {active && <Badge className="bg-white text-slate-900 rounded-lg">پیش‌فرض</Badge>}
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">{p.tagline}</div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-[11px] px-2 py-1 rounded-lg",
                      state?.configured ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-200",
                    )}
                  >
                    {state?.configured ? "پیکربندی شده" : "کلید ندارد"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="bg-black/20 rounded-xl p-2">
                    <div className="text-slate-400">مدل</div>
                    <div className="text-white font-mono truncate" dir="ltr">{state?.model || "-"}</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-2">
                    <div className="text-slate-400">کلید</div>
                    <div className="text-white font-mono truncate" dir="ltr">{state?.apiKeyMasked || "—"}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">منبع: {state?.source === "database" ? "پنل" : state?.source === "env" ? "متغیر محیطی" : "—"}</span>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      runTest(p.id)
                    }}
                    className="inline-flex items-center gap-1 text-xs text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl"
                  >
                    {test === "loading" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                    تست سرعت
                  </span>
                </div>

                {test && test !== "loading" && (
                  <div className={cn("mt-3 rounded-xl p-3 text-xs", test.ok ? "bg-emerald-500/15 text-emerald-200" : "bg-red-500/15 text-red-200")}>
                    {test.ok ? (
                      <>
                        <div className="font-bold">✓ متصل — {test.latencyMs} میلی‌ثانیه</div>
                        {test.sample && <div className="mt-1 text-white/80">پاسخ نمونه: {test.sample}</div>}
                      </>
                    ) : (
                      <div dir="auto">✕ {test.error}</div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Credentials */}
        <Card className="p-6 sm:p-8 bg-white/5 backdrop-blur border-white/10 rounded-3xl space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold">
                <Globe className="w-5 h-5 text-emerald-400" /> ArvanCloud AI
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">آدرس Gateway (با /v1)</Label>
                <Input
                  dir="ltr"
                  value={arvanUrl}
                  onChange={(e) => setArvanUrl(e.target.value)}
                  placeholder={data?.arvan.apiUrl || "https://arvancloudai.ir/gateway/models/<model>/<token>/v1"}
                  className="bg-black/30 border-white/10 text-white h-12 rounded-2xl font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Access Key</Label>
                <div className="relative">
                  <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    dir="ltr"
                    type="password"
                    value={arvanKey}
                    onChange={(e) => setArvanKey(e.target.value)}
                    placeholder={data?.arvan.apiKeyMasked || "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
                    className="pr-11 bg-black/30 border-white/10 text-white h-12 rounded-2xl font-mono text-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-400">هدر احراز هویت به‌صورت خودکار «Authorization: apikey …» ارسال می‌شود.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">نام مدل</Label>
                <Input dir="ltr" value={arvanModel} onChange={(e) => setArvanModel(e.target.value)} className="bg-black/30 border-white/10 text-white h-12 rounded-2xl font-mono text-xs" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold">
                <Globe className="w-5 h-5 text-blue-400" /> DeepSeek
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">API Key</Label>
                <div className="relative">
                  <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    dir="ltr"
                    type="password"
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                    placeholder={data?.deepseek.apiKeyMasked || "sk-..."}
                    className="pr-11 bg-black/30 border-white/10 text-white h-12 rounded-2xl font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">نام مدل</Label>
                <Input dir="ltr" value={deepseekModel} onChange={(e) => setDeepseekModel(e.target.value)} className="bg-black/30 border-white/10 text-white h-12 rounded-2xl font-mono text-xs" />
              </div>

              <div className="flex items-center justify-between bg-black/20 rounded-2xl p-4 mt-6">
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className="w-5 h-5 text-fuchsia-300" />
                  <div>
                    <div className="text-white text-sm font-medium">سوییچ خودکار در صورت خطا</div>
                    <div className="text-[11px] text-slate-400">اگر سرویس پیش‌فرض پاسخ نداد، درخواست به سرویس دیگر ارسال می‌شود</div>
                  </div>
                </div>
                <Switch checked={fallback} onCheckedChange={setFallback} />
              </div>
            </div>
          </div>

          {error && <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-red-200 text-sm">{error}</div>}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={save} disabled={saving} className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white">
              {saving ? <RefreshCw className="w-5 h-5 ml-2 animate-spin" /> : saved ? <Check className="w-5 h-5 ml-2" /> : <Save className="w-5 h-5 ml-2" />}
              {saving ? "در حال ذخیره..." : saved ? "ذخیره شد" : "ذخیره و اعمال فوری"}
            </Button>
            <div className="flex items-center gap-2 text-xs text-slate-300 px-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              کلیدها فقط روی سرور نگهداری می‌شوند و در پاسخ‌ها ماسک می‌گردند.
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 backdrop-blur border-white/10 rounded-3xl text-sm text-slate-300 space-y-3">
          <h3 className="text-white font-bold">چطور سرعت پاسخ بالا می‌ماند؟</h3>
          <ul className="list-disc list-inside space-y-1 mr-2">
            <li>پاسخ‌ها به‌صورت استریم و بلافاصله بعد از تولید اولین کلمه نمایش داده می‌شوند.</li>
            <li>بودجه توکن ورودی به‌صورت هوشمند مدیریت می‌شود؛ تاریخچه‌های طولانی خودکار خلاصه/حذف می‌شوند.</li>
            <li>حداکثر توکن خروجی برای چت کوتاه نگه داشته می‌شود تا تاخیر اولین کلمه زیر یک ثانیه بماند.</li>
            <li>در صورت تایم‌اوت یا خطای سرویس، درخواست به‌طور خودکار روی سرویس دوم اجرا می‌شود.</li>
            <li>تگ‌های تفکر مدل‌های Reasoning (مثل &lt;think&gt;) از خروجی حذف می‌شوند.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
