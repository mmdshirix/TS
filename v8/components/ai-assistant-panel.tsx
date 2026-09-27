"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, BarChart3, Megaphone, Users, Sparkles, Code2 } from "lucide-react"
import ProgrammerAssistantChat from "@/components/programmer-assistant-chat"

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "خطا در دریافت پاسخ از هوش مصنوعی")
  return data
}

function GenerateButton({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <Button onClick={onClick} disabled={loading} className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 gap-2">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      {label}
    </Button>
  )
}

function SeoTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])

  const run = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await postJson("/api/ai-assistant/seo")
      setSuggestions(data.suggestions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <GenerateButton onClick={run} loading={loading} label="تحلیل سئوی محصولات" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((s) => (
          <Card key={s.product_id} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">{s.product_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">متا تایتل:</span> {s.meta_title}</p>
              <p><span className="font-medium">متا دیسکریپشن:</span> {s.meta_description}</p>
              <p><span className="font-medium">بهبود توضیحات:</span> {s.description_improvement}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(s.keywords || []).map((k: string) => (
                  <Badge key={k} variant="secondary">{k}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AnalyticsTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<any>(null)

  const run = async () => {
    setLoading(true)
    setError("")
    try {
      setResult(await postJson("/api/ai-assistant/analytics"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <GenerateButton onClick={run} loading={loading} label="تحلیل آمار فروش" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="rounded-2xl"><CardContent className="p-4"><p className="text-xs text-gray-500">کل سفارش‌ها</p><p className="text-xl font-bold">{result.context.totalOrders}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardContent className="p-4"><p className="text-xs text-gray-500">پرداخت‌شده</p><p className="text-xl font-bold">{result.context.paidOrders}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardContent className="p-4"><p className="text-xs text-gray-500">درآمد کل</p><p className="text-xl font-bold">{Number(result.context.totalRevenue).toLocaleString()}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardContent className="p-4"><p className="text-xs text-gray-500">۷ روز اخیر</p><p className="text-xl font-bold">{result.context.last7DaysOrders}</p></CardContent></Card>
          </div>
          <Card className="rounded-2xl">
            <CardContent className="p-5 space-y-3 text-sm">
              <p>{result.insights.summary}</p>
              <p className="text-gray-600">{result.insights.trend_analysis}</p>
              <ul className="list-disc pr-5 space-y-1">
                {(result.insights.recommendations || []).map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function MarketingTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [percentage, setPercentage] = useState("20")
  const [goal, setGoal] = useState("")
  const [plan, setPlan] = useState<any>(null)
  const [codes, setCodes] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/ai-assistant/marketing").then((r) => r.json()).then((d) => setCodes(d.codes || [])).catch(() => {})
  }, [])

  const run = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await postJson("/api/ai-assistant/marketing", { percentage: Number(percentage), goal })
      setPlan(data.plan)
      setCodes((prev) => [data.discountCode, ...prev.filter((c) => c.code !== data.discountCode.code)])
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>درصد تخفیف</Label>
              <Input type="number" min={1} max={100} value={percentage} onChange={(e) => setPercentage(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>هدف کمپین (اختیاری)</Label>
              <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="مثلاً افزایش فروش قبل از عید" className="rounded-xl" />
            </div>
          </div>
          <GenerateButton onClick={run} loading={loading} label="ساخت کمپین و کد تخفیف" />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {plan && (
        <Card className="rounded-2xl border-2 border-blue-200">
          <CardContent className="p-5 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="text-base px-3 py-1" dir="ltr">{plan.code}</Badge>
              <span className="font-medium">{plan.campaign_title}</span>
            </div>
            <p>{plan.promotional_message}</p>
            <p className="text-gray-600"><span className="font-medium">مخاطب هدف:</span> {plan.target_audience}</p>
            <div className="flex flex-wrap gap-1.5">
              {(plan.channel_suggestions || []).map((c: string) => <Badge key={c} variant="secondary">{c}</Badge>)}
            </div>
          </CardContent>
        </Card>
      )}

      {codes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">کدهای تخفیف ساخته‌شده</h4>
          <div className="flex flex-wrap gap-2">
            {codes.map((c) => (
              <Badge key={c.id} variant={c.active ? "default" : "secondary"} dir="ltr">{c.code} — {c.percentage}%</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CrmTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [insights, setInsights] = useState<any>(null)

  const run = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await postJson("/api/ai-assistant/crm")
      setInsights(data.insights)
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <GenerateButton onClick={run} loading={loading} label="تحلیل و بخش‌بندی مشتریان" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {insights && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(insights.segments || []).map((s: any) => (
              <Card key={s.name} className="rounded-2xl">
                <CardHeader><CardTitle className="text-base">{s.name}</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-gray-600">{s.description}</p>
                  <p className="text-xs text-gray-400">{(s.customer_phones || []).length} مشتری</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="rounded-2xl">
            <CardContent className="p-5 space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">راهکارهای حفظ مشتری</p>
                <ul className="list-disc pr-5 space-y-1">{(insights.retention_strategies || []).map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
              </div>
              <div>
                <p className="font-medium mb-1">ایده‌های شخصی‌سازی</p>
                <ul className="list-disc pr-5 space-y-1">{(insights.personalization_ideas || []).map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function AiAssistantPanel() {
  return (
    <Tabs defaultValue="seo" dir="rtl">
      <TabsList className="grid grid-cols-5 w-full max-w-2xl rounded-xl">
        <TabsTrigger value="seo" className="gap-1.5"><Search className="w-4 h-4" />سئو</TabsTrigger>
        <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="w-4 h-4" />آمار</TabsTrigger>
        <TabsTrigger value="marketing" className="gap-1.5"><Megaphone className="w-4 h-4" />مارکتینگ</TabsTrigger>
        <TabsTrigger value="crm" className="gap-1.5"><Users className="w-4 h-4" />CRM</TabsTrigger>
        <TabsTrigger value="programmer" className="gap-1.5"><Code2 className="w-4 h-4" />دستیار برنامه‌نویس</TabsTrigger>
      </TabsList>
      <TabsContent value="seo" className="pt-4"><SeoTab /></TabsContent>
      <TabsContent value="analytics" className="pt-4"><AnalyticsTab /></TabsContent>
      <TabsContent value="marketing" className="pt-4"><MarketingTab /></TabsContent>
      <TabsContent value="crm" className="pt-4"><CrmTab /></TabsContent>
      <TabsContent value="programmer" className="pt-4"><ProgrammerAssistantChat /></TabsContent>
    </Tabs>
  )
}
