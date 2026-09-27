"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle2, XCircle, Search, Globe, Share2, Code2, Sparkles, ExternalLink, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { SEO_PAGE_KEYS } from "@/lib/shared/seo-constants"

interface Seo {
  meta_title: string | null
  meta_description: string | null
  keywords: string | null
  og_image_url: string | null
  canonical_domain: string | null
  robots_index: boolean
  robots_follow: boolean
  google_site_verification: string | null
  google_analytics_id: string | null
  twitter_handle: string | null
  structured_data_enabled: boolean
  sitemap_enabled: boolean
  business_type: string | null
  page_overrides: Record<string, { title?: string; description?: string }>
  head_scripts: string | null
}

export default function SeoSettingsForm({ storeSlug }: { storeSlug: string }) {
  const [seo, setSeo] = useState<Seo | null>(null)
  const [store, setStore] = useState<any>(null)
  const [audit, setAudit] = useState<{ score: number; checks: Array<{ id: string; label: string; ok: boolean; hint: string }> } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)

  useEffect(() => {
    fetch("/api/store/seo", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      setSeo(d.settings)
      setAudit(d.audit)
      setStore(d.store)
    })
  }, [])

  const save = async () => {
    if (!seo) return
    setSaving(true)
    const res = await fetch("/api/store/seo", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(seo) })
    const d = await res.json()
    if (d.settings) setSeo(d.settings)
    if (d.audit) setAudit(d.audit)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const suggestWithAi = async () => {
    setAiBusy(true)
    try {
      const res = await fetch("/api/ai-assistant/seo-meta", { method: "POST" })
      const d = await res.json()
      if (d.meta && seo) setSeo({ ...seo, meta_title: d.meta.meta_title || seo.meta_title, meta_description: d.meta.meta_description || seo.meta_description, keywords: d.meta.keywords || seo.keywords })
    } finally {
      setAiBusy(false)
    }
  }

  const base = process.env.NEXT_PUBLIC_STOREFRONT_BASE_DOMAIN || "tsll.ir"
  const url = seo?.canonical_domain ? `https://${seo.canonical_domain}` : `https://${storeSlug}.${base}`
  const title = seo?.meta_title || store?.name || ""
  const desc = seo?.meta_description || store?.description || ""
  const scoreColor = useMemo(() => (audit ? (audit.score >= 80 ? "text-emerald-600" : audit.score >= 50 ? "text-amber-600" : "text-red-600") : ""), [audit])

  if (!seo) return <div className="py-16 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
      <Tabs defaultValue="basics" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-2xl bg-white border p-1">
          <TabsTrigger value="basics" className="rounded-xl gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"><Search className="w-4 h-4" /> عنوان و توضیحات</TabsTrigger>
          <TabsTrigger value="pages" className="rounded-xl gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"><Globe className="w-4 h-4" /> صفحات</TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"><Share2 className="w-4 h-4" /> شبکه‌های اجتماعی</TabsTrigger>
          <TabsTrigger value="advanced" className="rounded-xl gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"><Code2 className="w-4 h-4" /> پیشرفته</TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <Card className="rounded-2xl">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div><CardTitle>عنوان و توضیحات متا</CardTitle><CardDescription>همان چیزی که کاربران در نتایج گوگل می‌بینند.</CardDescription></div>
              <Button variant="outline" size="sm" className="rounded-xl gap-2 shrink-0" onClick={suggestWithAi} disabled={aiBusy}>{aiBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-600" />} پیشنهاد هوشمند</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between"><Label>عنوان سایت</Label><span className={cn("text-[11px]", title.length > 60 ? "text-red-600" : "text-gray-400")}>{title.length}/60</span></div>
                <Input value={seo.meta_title || ""} onChange={(e) => setSeo({ ...seo, meta_title: e.target.value })} placeholder={store?.name} className="rounded-xl" />
              </div>
              <div>
                <div className="flex items-center justify-between"><Label>توضیحات متا</Label><span className={cn("text-[11px]", desc.length > 160 ? "text-red-600" : "text-gray-400")}>{desc.length}/160</span></div>
                <Textarea value={seo.meta_description || ""} onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })} rows={3} placeholder={store?.description || "توضیح کوتاه و جذاب از فروشگاه شما"} className="rounded-xl" />
              </div>
              <div>
                <Label>کلمات کلیدی (با ویرگول جدا کنید)</Label>
                <Input value={seo.keywords || ""} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} placeholder="مثلاً: خرید عطر، ادکلن اورجینال، عطر مردانه" className="rounded-xl" />
              </div>
              <div>
                <Label>نوع کسب‌وکار (Schema.org)</Label>
                <select value={seo.business_type || ""} onChange={(e) => setSeo({ ...seo, business_type: e.target.value || null })} className="w-full h-10 rounded-xl border bg-white px-3 text-sm">
                  <option value="">خودکار بر اساس قالب</option>
                  {["Store", "ClothingStore", "JewelryStore", "ShoeStore", "MobilePhoneStore", "HealthAndBeautyBusiness", "MedicalClinic", "Physician", "Dentist", "Pharmacy", "LocalBusiness"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>عنوان و توضیحات هر صفحه</CardTitle><CardDescription>اگر خالی بماند از تنظیمات کلی استفاده می‌شود.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              {SEO_PAGE_KEYS.map((p) => (
                <div key={p.key} className="rounded-xl border p-3 space-y-2">
                  <div className="text-sm font-bold text-gray-900">{p.label}</div>
                  <Input value={seo.page_overrides?.[p.key]?.title || ""} onChange={(e) => setSeo({ ...seo, page_overrides: { ...seo.page_overrides, [p.key]: { ...seo.page_overrides?.[p.key], title: e.target.value } } })} placeholder="عنوان" className="rounded-xl" />
                  <Input value={seo.page_overrides?.[p.key]?.description || ""} onChange={(e) => setSeo({ ...seo, page_overrides: { ...seo.page_overrides, [p.key]: { ...seo.page_overrides?.[p.key], description: e.target.value } } })} placeholder="توضیحات" className="rounded-xl" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>پیش‌نمایش در شبکه‌های اجتماعی</CardTitle><CardDescription>تصویر و عنوانی که هنگام اشتراک لینک در اینستاگرام، تلگرام و واتساپ نمایش داده می‌شود.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>تصویر اشتراک‌گذاری (۱۲۰۰×۶۳۰)</Label>
                <div className="flex gap-3 items-start mt-1">
                  <label className="w-40 aspect-[1.91/1] rounded-xl border-2 border-dashed grid place-items-center cursor-pointer overflow-hidden bg-gray-50 shrink-0">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : seo.og_image_url ? <img src={seo.og_image_url} alt="" className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 text-gray-400" />}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setUploading(true); const fd = new FormData(); fd.append("file", f); const r = await fetch("/api/upload-image", { method: "POST", body: fd }); const d = await r.json(); if (d.url) setSeo({ ...seo, og_image_url: d.url }); setUploading(false) }} />
                  </label>
                  <Input value={seo.og_image_url || ""} onChange={(e) => setSeo({ ...seo, og_image_url: e.target.value })} placeholder="یا آدرس تصویر" className="rounded-xl" dir="ltr" />
                </div>
              </div>
              <div><Label>حساب X / توییتر</Label><Input value={seo.twitter_handle || ""} onChange={(e) => setSeo({ ...seo, twitter_handle: e.target.value })} placeholder="@brand" className="rounded-xl" dir="ltr" /></div>
              <div className="rounded-xl border overflow-hidden max-w-md">
                <div className="aspect-[1.91/1] bg-gray-100">{(seo.og_image_url || store?.logo_url) && <img src={seo.og_image_url || store.logo_url} alt="" className="w-full h-full object-cover" />}</div>
                <div className="p-3 bg-white"><div className="text-[11px] text-gray-400 uppercase" dir="ltr">{url.replace("https://", "")}</div><div className="text-sm font-bold text-gray-900 line-clamp-1">{title}</div><div className="text-xs text-gray-500 line-clamp-2">{desc}</div></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>تنظیمات پیشرفته</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Toggle label="اجازه ایندکس در موتورهای جستجو" desc="در حالت تست، غیرفعال کنید تا سایت در گوگل نمایش داده نشود" checked={seo.robots_index} onChange={(v) => setSeo({ ...seo, robots_index: v })} />
              <Toggle label="دنبال کردن لینک‌ها (follow)" checked={seo.robots_follow} onChange={(v) => setSeo({ ...seo, robots_follow: v })} />
              <Toggle label="نقشه سایت خودکار (sitemap.xml)" checked={seo.sitemap_enabled} onChange={(v) => setSeo({ ...seo, sitemap_enabled: v })} />
              <Toggle label="داده ساختاریافته Schema.org" desc="ریچ‌اسنیپت محصولات، کسب‌وکار و مسیر صفحات" checked={seo.structured_data_enabled} onChange={(v) => setSeo({ ...seo, structured_data_enabled: v })} />
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>کد تایید Google Search Console</Label><Input value={seo.google_site_verification || ""} onChange={(e) => setSeo({ ...seo, google_site_verification: e.target.value })} className="rounded-xl" dir="ltr" placeholder="google-site-verification=..." /></div>
                <div><Label>Google Analytics ID</Label><Input value={seo.google_analytics_id || ""} onChange={(e) => setSeo({ ...seo, google_analytics_id: e.target.value })} className="rounded-xl" dir="ltr" placeholder="G-XXXXXXX" /></div>
              </div>
              <div><Label>دامنه اختصاصی (canonical)</Label><Input value={seo.canonical_domain || ""} onChange={(e) => setSeo({ ...seo, canonical_domain: e.target.value })} className="rounded-xl" dir="ltr" placeholder="shop.example.ir" /><p className="text-[11px] text-gray-500 mt-1">اگر دامنه شخصی به فروشگاه وصل کرده‌اید، اینجا وارد کنید تا لینک‌های canonical و نقشه سایت درست ساخته شوند.</p></div>
              <div><Label>اسکریپت‌های اضافی (head)</Label><Textarea value={seo.head_scripts || ""} onChange={(e) => setSeo({ ...seo, head_scripts: e.target.value })} rows={3} className="rounded-xl font-mono text-xs" dir="ltr" placeholder="<meta name=... /> یا کد پیکسل" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <div className="flex justify-end"><Button onClick={save} disabled={saving} className="rounded-xl gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : null}{saved ? "ذخیره شد" : "ذخیره تنظیمات سئو"}</Button></div>
      </Tabs>

      <div className="space-y-4">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">امتیاز سئو</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${audit?.score || 0} 100`} strokeLinecap="round" className={scoreColor} />
                </svg>
                <div className={cn("absolute inset-0 grid place-items-center text-2xl font-black", scoreColor)}>{(audit?.score || 0).toLocaleString("fa-IR")}</div>
              </div>
              <div className="text-sm text-gray-600">{audit && audit.score >= 80 ? "عالی! سایت شما برای موتورهای جستجو بهینه است." : audit && audit.score >= 50 ? "خوب است؛ چند مورد باقی مانده." : "چند تنظیم مهم انجام نشده است."}</div>
            </div>
            <ul className="mt-4 space-y-2">
              {audit?.checks.map((c) => (
                <li key={c.id} className="flex items-start gap-2 text-sm">
                  {c.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                  <div><div className={cn(c.ok ? "text-gray-700" : "text-gray-900 font-medium")}>{c.label}</div>{!c.ok && <div className="text-xs text-gray-500">{c.hint}</div>}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">پیش‌نمایش گوگل</CardTitle></CardHeader>
          <CardContent>
            <div className="text-[11px] text-gray-500" dir="ltr">{url}</div>
            <div className="text-blue-700 text-lg leading-snug line-clamp-1">{title}</div>
            <div className="text-sm text-gray-600 line-clamp-2">{desc}</div>
            <div className="mt-3 flex flex-col gap-1 text-xs">
              <a href={`${url}/sitemap.xml`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600"><ExternalLink className="w-3 h-3" /> sitemap.xml</a>
              <a href={`${url}/robots.txt`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600"><ExternalLink className="w-3 h-3" /> robots.txt</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
      <div><div className="text-sm font-medium text-gray-900">{label}</div>{desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}</div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
