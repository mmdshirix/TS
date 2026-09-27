"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Instagram, Plug, Workflow, MessageCircle, FlaskConical, Plus, Trash2, Pencil, Loader2, CheckCircle2, AlertTriangle, Type, ImageIcon, CreditCard, Mic, Clock, UserRound, Sparkles, GripVertical, Send, Bot, Zap, Link2, X, Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TONE_OPTIONS } from "@/lib/ai/tones"

type StepType = "text" | "image" | "card" | "voice" | "delay" | "handoff" | "ai"
interface Step {
  _id?: string
  type: StepType
  text?: string
  url?: string
  title?: string
  subtitle?: string
  image_url?: string
  buttons?: Array<{ title: string; url?: string }>
  product_id?: number | null
  seconds?: number
  instruction?: string
}
interface Wf {
  id: number
  name: string
  trigger_type: "keyword" | "welcome" | "fallback"
  keywords: string[]
  match_mode: "contains" | "exact" | "starts_with" | "regex"
  steps: Step[]
  enabled: boolean
  priority: number
  hits: number
}

const STEP_META: Record<StepType, { label: string; icon: any; color: string; desc: string }> = {
  text: { label: "متن", icon: Type, color: "bg-blue-100 text-blue-700", desc: "ارسال یک پیام متنی" },
  image: { label: "تصویر", icon: ImageIcon, color: "bg-pink-100 text-pink-700", desc: "ارسال عکس (لینک یا آپلود)" },
  card: { label: "کارت محصول", icon: CreditCard, color: "bg-amber-100 text-amber-700", desc: "کارت با عنوان، تصویر و دکمه لینک" },
  voice: { label: "ویس", icon: Mic, color: "bg-violet-100 text-violet-700", desc: "ارسال فایل صوتی" },
  delay: { label: "تاخیر", icon: Clock, color: "bg-gray-100 text-gray-700", desc: "چند ثانیه مکث برای طبیعی‌تر شدن" },
  ai: { label: "پاسخ هوش مصنوعی", icon: Sparkles, color: "bg-cyan-100 text-cyan-700", desc: "پاسخ بر اساس پایگاه دانش و محصولات" },
  handoff: { label: "ارجاع به ادمین", icon: UserRound, color: "bg-emerald-100 text-emerald-700", desc: "توقف AI برای این گفتگو" },
}

const TEMPLATES: Array<Partial<Wf> & { label: string }> = [
  { label: "قیمت → کارت محصول", name: "پاسخ به قیمت", trigger_type: "keyword", keywords: ["قیمت", "چنده", "price"], match_mode: "contains", steps: [{ type: "text", text: "سلام 👋 قیمت‌ها رو همین‌جا برات می‌فرستم:" }, { type: "ai", instruction: "فقط قیمت محصولات مرتبط را با لینک بده" }] },
  { label: "خوش‌آمد اولین پیام", name: "خوش‌آمدگویی", trigger_type: "welcome", keywords: [], match_mode: "contains", steps: [{ type: "text", text: "سلام! خوش اومدی 🌟 من دستیار هوشمند پیج هستم؛ هر سوالی داری بپرس." }] },
  { label: "ارسال و هزینه پست", name: "شرایط ارسال", trigger_type: "keyword", keywords: ["ارسال", "پست", "هزینه ارسال", "چند روز"], match_mode: "contains", steps: [{ type: "text", text: "ارسال به سراسر ایران با پست پیشتاز ۲ تا ۴ روز کاری 🚚 برای سفارش بالای ۱ میلیون رایگانه." }] },
  { label: "لینک سایت", name: "لینک خرید", trigger_type: "keyword", keywords: ["لینک", "سایت", "خرید", "سفارش"], match_mode: "contains", steps: [{ type: "card", title: "فروشگاه آنلاین ما", subtitle: "خرید مستقیم با پرداخت امن", buttons: [{ title: "ورود به سایت", url: "https://" }] }] },
  { label: "صحبت با ادمین", name: "ارجاع به ادمین", trigger_type: "keyword", keywords: ["ادمین", "پشتیبان", "انسان", "آدم"], match_mode: "contains", steps: [{ type: "handoff", text: "همکار ما به‌زودی پاسخ می‌دهد 🙏" }] },
]

export default function InstagramManager({ storeSlug }: { storeSlug: string }) {
  const sp = useSearchParams()
  const [tab, setTab] = useState("connect")
  useEffect(() => {
    if (sp.get("connected") || sp.get("error")) setTab("connect")
  }, [sp])
  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">
      <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-2xl bg-white border p-1">
        <TabsTrigger value="connect" className="rounded-xl gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"><Plug className="w-4 h-4" /> اتصال و تنظیمات</TabsTrigger>
        <TabsTrigger value="workflows" className="rounded-xl gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"><Workflow className="w-4 h-4" /> ورک‌فلوها</TabsTrigger>
        <TabsTrigger value="simulator" className="rounded-xl gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"><FlaskConical className="w-4 h-4" /> شبیه‌ساز</TabsTrigger>
        <TabsTrigger value="inbox" className="rounded-xl gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"><MessageCircle className="w-4 h-4" /> گفتگوها</TabsTrigger>
      </TabsList>
      <TabsContent value="connect"><ConnectTab connectedFlag={Boolean(sp.get("connected"))} errorFlag={sp.get("error")} /></TabsContent>
      <TabsContent value="workflows"><WorkflowsTab storeSlug={storeSlug} /></TabsContent>
      <TabsContent value="simulator"><SimulatorTab /></TabsContent>
      <TabsContent value="inbox"><InboxTab /></TabsContent>
    </Tabs>
  )
}

// ---------------------------------------------------------------------------

function ConnectTab({ connectedFlag, errorFlag }: { connectedFlag: boolean; errorFlag: string | null }) {
  const [data, setData] = useState<any>(null)
  const [pageName, setPageName] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(errorFlag ? { ok: false, text: errorFlag } : connectedFlag ? { ok: true, text: "پیج با موفقیت متصل شد! از این لحظه دایرکت‌ها به‌صورت خودکار پاسخ داده می‌شوند." } : null)
  const [saving, setSaving] = useState(false)

  const load = () => fetch("/api/instagram/account", { cache: "no-store" }).then((r) => r.json()).then((d) => { setData(d); if (d.account?.page_name) setPageName(d.account.page_name) })
  useEffect(() => {
    load()
  }, [])

  const connect = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch("/api/instagram/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page_name: pageName }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "خطا")
      if (d.authUrl) {
        window.location.href = d.authUrl
        return
      }
      setMsg({ ok: false, text: d.message || "پیکربندی ناقص است" })
      load()
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "خطا" })
    } finally {
      setBusy(false)
    }
  }

  const saveSettings = async () => {
    if (!data?.account) return
    setSaving(true)
    const a = data.account
    await fetch("/api/instagram/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ai_enabled: a.ai_enabled, ai_tone: a.ai_tone, ai_handoff_keywords: a.ai_handoff_keywords, greeting_message: a.greeting_message, away_message: a.away_message }) })
    setSaving(false)
    setMsg({ ok: true, text: "تنظیمات ذخیره شد" })
  }

  const disconnect = async () => {
    if (!confirm("اتصال اینستاگرام قطع شود؟")) return
    await fetch("/api/instagram/account", { method: "DELETE" })
    load()
  }

  if (!data) return <div className="py-16 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
  const acc = data.account
  const connected = acc?.status === "connected"

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-6">
        {/* Hero connect card */}
        <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600 shadow-xl shadow-fuchsia-500/20">
          <div className="rounded-[calc(1.5rem-1px)] bg-white p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white grid place-items-center shrink-0"><Instagram className="w-7 h-7" /></div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-gray-900">{connected ? `متصل به @${acc.ig_username || acc.page_name}` : "اتصال پیج اینستاگرام"}</h2>
                <p className="text-sm text-gray-600 mt-1 leading-7">{connected ? "دایرکت‌های پیج به‌صورت خودکار با ورک‌فلوها و دستیار هوشمند پاسخ داده می‌شوند." : "فقط نام پیج را وارد کنید. ربات تاکسل دسترسی لازم را می‌گیرد و پاسخ خودکار دایرکت‌ها فعال می‌شود."}</p>
                {!connected && (
                  <div className="mt-5 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                      <Input value={pageName} onChange={(e) => setPageName(e.target.value)} placeholder="yourpage" dir="ltr" className="rounded-2xl h-12 pr-8 text-left" />
                    </div>
                    <Button onClick={connect} disabled={busy || pageName.trim().length < 2} className="rounded-2xl h-12 px-6 bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 gap-2">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} اتصال</Button>
                  </div>
                )}
                {connected && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <Badge className="rounded-lg bg-emerald-100 text-emerald-800 gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> متصل</Badge>
                    <span className="text-gray-500">{Number(acc.total_message_count || 0).toLocaleString("fa-IR")} پیام پردازش‌شده</span>
                    <button onClick={disconnect} className="text-red-600 underline mr-auto">قطع اتصال</button>
                  </div>
                )}
                {acc?.status === "error" && <div className="mt-3 text-xs text-red-700 bg-red-50 rounded-xl p-3 flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> {acc.status_message}</div>}
                {!data.configured && (
                  <div className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 leading-6">
                    <b>پیکربندی سرور لازم است:</b> برای فعال شدن اتصال، مدیر پلتفرم باید <code>META_APP_ID</code> و <code>META_APP_SECRET</code> را تنظیم کند (راهنما: docs/instagram-setup.md). وب‌هوک: <code dir="ltr">{data.webhookUrl}</code> · توکن تایید: <code>{data.verifyToken}</code>
                  </div>
                )}
              </div>
            </div>
            <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("mt-4 rounded-xl p-3 text-sm flex items-center gap-2", msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700")}>{msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {msg.text}</motion.div>}</AnimatePresence>
          </div>
        </div>

        {/* AI agent settings */}
        {acc && (
          <Card className="rounded-3xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-violet-600" /> دستیار هوشمند دایرکت</CardTitle><CardDescription>وقتی هیچ ورک‌فلویی مطابقت نداشت، هوش مصنوعی با دانش چت‌بات و محصولات فروشگاه پاسخ می‌دهد.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border p-3"><div><div className="text-sm font-medium">پاسخ خودکار با هوش مصنوعی</div><div className="text-xs text-gray-500">غیرفعال = فقط ورک‌فلوها اجرا می‌شوند</div></div><Switch checked={acc.ai_enabled} onCheckedChange={(v) => setData({ ...data, account: { ...acc, ai_enabled: v } })} /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>لحن پاسخ</Label>
                  <Select value={acc.ai_tone || "friendly"} onValueChange={(v) => setData({ ...data, account: { ...acc, ai_tone: v } })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{TONE_OPTIONS.filter((t) => !["medical", "pharmacist"].includes(t.id)).map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>کلیدواژه‌های ارجاع به ادمین</Label><Input value={acc.ai_handoff_keywords || ""} onChange={(e) => setData({ ...data, account: { ...acc, ai_handoff_keywords: e.target.value } })} placeholder="ادمین، پشتیبان، شکایت" className="rounded-xl" /></div>
              </div>
              <div><Label>پیام زمان ارجاع / عدم دسترسی</Label><Textarea value={acc.away_message || ""} onChange={(e) => setData({ ...data, account: { ...acc, away_message: e.target.value } })} rows={2} placeholder="پیامت رسید 🙏 همکار ما به‌زودی پاسخ می‌دهد." className="rounded-xl" /></div>
              <div className="flex justify-end"><Button onClick={saveSettings} disabled={saving} className="rounded-xl bg-violet-600 hover:bg-violet-700">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "ذخیره"}</Button></div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        {data.stats && (
          <Card className="rounded-3xl">
            <CardHeader><CardTitle className="text-base">آمار ۷ روز اخیر</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-center">
              {[
                { l: "گفتگو", v: data.stats.conversations },
                { l: "پاسخ خودکار", v: data.stats.replies7 },
                { l: "پاسخ AI", v: data.stats.ai7 },
                { l: "اجرای ورک‌فلو", v: data.stats.workflow_hits },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-gradient-to-br from-pink-50 to-violet-50 p-3"><div className="text-2xl font-black text-violet-700">{Number(s.v || 0).toLocaleString("fa-IR")}</div><div className="text-xs text-gray-600">{s.l}</div></div>
              ))}
            </CardContent>
          </Card>
        )}
        <Card className="rounded-3xl">
          <CardHeader><CardTitle className="text-base">پیش‌نیازهای پیج</CardTitle></CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            {["پیج Business یا Creator باشد", "پیج به یک صفحه فیسبوک متصل باشد", "در تنظیمات پیام‌ها، دسترسی به پیام‌ها (Allow access to messages) فعال باشد", "با همان اکانت فیسبوک ادمین صفحه، اتصال را انجام دهید"].map((t) => (
              <div key={t} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />{t}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

let stepSeq = 0
const withIds = <T extends Step>(steps: T[]): T[] => steps.map((s) => (s._id ? s : { ...s, _id: `s${Date.now().toString(36)}${(stepSeq += 1)}` }))

const EMPTY_WF: Omit<Wf, "id" | "hits"> = { name: "", trigger_type: "keyword", keywords: [], match_mode: "contains", steps: [{ type: "text", text: "" }], enabled: true, priority: 0 }

function WorkflowsTab({ storeSlug }: { storeSlug: string }) {
  const [items, setItems] = useState<Wf[] | null>(null)
  const [editing, setEditing] = useState<(Omit<Wf, "id" | "hits"> & { id?: number }) | null>(null)
  const [kw, setKw] = useState("")
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Array<{ id: number; name: string }>>([])
  const [error, setError] = useState("")

  const load = () => fetch("/api/instagram/workflows", { cache: "no-store" }).then((r) => r.json()).then((d) => setItems(d.workflows || []))
  useEffect(() => {
    load()
    fetch("/api/store/products").then((r) => r.json()).then((d) => setProducts((d.products || []).map((p: any) => ({ id: p.id, name: p.name })))).catch(() => {})
  }, [])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch(editing.id ? `/api/instagram/workflows/${editing.id}` : "/api/instagram/workflows", { method: editing.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "خطا")
      setEditing(null)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا")
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (w: Wf) => {
    await fetch(`/api/instagram/workflows/${w.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !w.enabled }) })
    load()
  }
  const remove = async (id: number) => {
    if (!confirm("این ورک‌فلو حذف شود؟")) return
    await fetch(`/api/instagram/workflows/${id}`, { method: "DELETE" })
    load()
  }

  const setStep = (i: number, patch: Partial<Step>) => {
    if (!editing) return
    const steps = [...editing.steps]
    steps[i] = { ...steps[i], ...patch }
    setEditing({ ...editing, steps })
  }

  const siteUrl = `https://${storeSlug}.${process.env.NEXT_PUBLIC_STOREFRONT_BASE_DOMAIN || "tsll.ir"}`

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600">برای کلیدواژه‌های دلخواه، زنجیره‌ای از پاسخ‌ها (متن، تصویر، کارت محصول، ویس) بسازید. اولویت بالاتر زودتر بررسی می‌شود.</p>
        <Button onClick={() => setEditing({ ...EMPTY_WF, steps: withIds(EMPTY_WF.steps) })} className="rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 gap-2"><Plus className="w-4 h-4" /> ورک‌فلو جدید</Button>
      </div>

      {/* Templates */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TEMPLATES.map((t) => (
          <button key={t.label} onClick={() => setEditing({ ...EMPTY_WF, ...t, steps: withIds((t.steps || []).map((s) => (s.type === "card" && s.buttons ? { ...s, buttons: s.buttons.map((b) => ({ ...b, url: b.url === "https://" ? siteUrl : b.url })) } : s))) })} className="shrink-0 rounded-full border bg-white px-4 py-2 text-xs text-gray-700 hover:border-violet-400 hover:text-violet-700 transition inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-pink-500" /> {t.label}
          </button>
        ))}
      </div>

      {!items ? (
        <div className="py-16 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : items.length === 0 ? (
        <Card className="rounded-3xl"><CardContent className="py-16 text-center text-gray-500">هنوز ورک‌فلویی ندارید. از قالب‌های بالا شروع کنید یا یک ورک‌فلو جدید بسازید.</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((w) => (
            <Card key={w.id} className={cn("rounded-3xl transition", !w.enabled && "opacity-60")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black text-gray-900 flex items-center gap-2">{w.name}<Badge variant="secondary" className="rounded-lg text-[10px]">{w.trigger_type === "welcome" ? "خوش‌آمد" : w.trigger_type === "fallback" ? "پیش‌فرض" : "کلیدواژه"}</Badge></div>
                    {w.trigger_type === "keyword" && <div className="mt-2 flex flex-wrap gap-1">{w.keywords.map((k) => <span key={k} className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">{k}</span>)}</div>}
                  </div>
                  <Switch checked={w.enabled} onCheckedChange={() => toggle(w)} />
                </div>
                <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                  {w.steps.map((s, i) => {
                    const M = STEP_META[s.type]
                    return (
                      <span key={i} className="inline-flex items-center gap-1">
                        <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium", M.color)}><M.icon className="w-3 h-3" /> {M.label}</span>
                        {i < w.steps.length - 1 && <span className="text-gray-300">←</span>}
                      </span>
                    )
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>{Number(w.hits || 0).toLocaleString("fa-IR")} بار اجرا شده</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => setEditing({ ...w, steps: withIds(w.steps) })}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-red-600" onClick={() => remove(w.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Builder dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl rounded-3xl max-h-[92vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Workflow className="w-5 h-5 text-violet-600" /> {editing?.id ? "ویرایش ورک‌فلو" : "ورک‌فلو جدید"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-[1fr_180px_120px] gap-3">
                <div><Label>نام</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="rounded-xl" placeholder="مثلاً: پاسخ به قیمت" /></div>
                <div>
                  <Label>نوع تریگر</Label>
                  <Select value={editing.trigger_type} onValueChange={(v: any) => setEditing({ ...editing, trigger_type: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="keyword">کلیدواژه</SelectItem><SelectItem value="welcome">اولین پیام (خوش‌آمد)</SelectItem><SelectItem value="fallback">پیش‌فرض (وقتی AI خاموش است)</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>اولویت</Label><Input type="number" dir="ltr" value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: Number(e.target.value) || 0 })} className="rounded-xl" /></div>
              </div>

              {editing.trigger_type === "keyword" && (
                <div className="rounded-2xl border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2"><Zap className="w-4 h-4 text-pink-500" /> کلیدواژه‌ها</Label>
                    <Select value={editing.match_mode} onValueChange={(v: any) => setEditing({ ...editing, match_mode: v })}>
                      <SelectTrigger className="rounded-xl w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="contains">شامل باشد</SelectItem><SelectItem value="starts_with">شروع شود با</SelectItem><SelectItem value="exact">دقیقاً برابر</SelectItem><SelectItem value="regex">عبارت منظم</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-2">{editing.keywords.map((k) => <Badge key={k} variant="secondary" className="rounded-lg gap-1">{k}<button onClick={() => setEditing({ ...editing, keywords: editing.keywords.filter((x) => x !== k) })}><X className="w-3 h-3" /></button></Badge>)}</div>
                  <div className="flex gap-2"><Input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (kw.trim()) { setEditing({ ...editing, keywords: [...editing.keywords, kw.trim()] }); setKw("") } } }} placeholder="کلیدواژه را بنویسید و Enter بزنید" className="rounded-xl" /><Button variant="outline" className="rounded-xl" onClick={() => { if (kw.trim()) { setEditing({ ...editing, keywords: [...editing.keywords, kw.trim()] }); setKw("") } }}>افزودن</Button></div>
                </div>
              )}

              {/* Steps */}
              <div>
                <Label className="mb-2 block">مراحل پاسخ (با کشیدن مرتب کنید)</Label>
                <Reorder.Group axis="y" values={editing.steps} onReorder={(steps) => setEditing({ ...editing, steps })} className="space-y-3">
                  {editing.steps.map((s, i) => {
                    const M = STEP_META[s.type]
                    return (
                      <Reorder.Item key={s._id || i} value={s} className="rounded-2xl border bg-white p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                          <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold", M.color)}><M.icon className="w-3.5 h-3.5" /> {M.label}</span>
                          <span className="text-[11px] text-gray-400">{M.desc}</span>
                          <button className="mr-auto text-gray-400 hover:text-red-600" onClick={() => setEditing({ ...editing, steps: editing.steps.filter((_, j) => j !== i) })}><Trash2 className="w-4 h-4" /></button>
                        </div>
                        {s.type === "text" && <Textarea value={s.text || ""} onChange={(e) => setStep(i, { text: e.target.value })} rows={2} placeholder="متن پیام… (می‌توانید ایموجی هم بگذارید)" className="rounded-xl" />}
                        {(s.type === "image" || s.type === "voice") && <UrlOrUpload value={s.url || ""} onChange={(url) => setStep(i, { url })} accept={s.type === "image" ? "image/*" : "audio/*"} placeholder={s.type === "image" ? "لینک تصویر یا آپلود" : "لینک فایل صوتی (mp3/m4a)"} />}
                        {s.type === "card" && (
                          <div className="grid sm:grid-cols-2 gap-2">
                            <div className="sm:col-span-2">
                              <Label className="text-xs">از محصول فروشگاه (اختیاری)</Label>
                              <Select value={s.product_id ? String(s.product_id) : "none"} onValueChange={(v) => setStep(i, { product_id: v === "none" ? null : Number(v) })}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="انتخاب محصول" /></SelectTrigger>
                                <SelectContent><SelectItem value="none">— کارت دستی —</SelectItem>{products.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            {!s.product_id && (
                              <>
                                <Input value={s.title || ""} onChange={(e) => setStep(i, { title: e.target.value })} placeholder="عنوان کارت" className="rounded-xl" />
                                <Input value={s.subtitle || ""} onChange={(e) => setStep(i, { subtitle: e.target.value })} placeholder="زیرعنوان (مثلاً قیمت)" className="rounded-xl" />
                                <div className="sm:col-span-2"><UrlOrUpload value={s.image_url || ""} onChange={(image_url) => setStep(i, { image_url })} accept="image/*" placeholder="تصویر کارت" /></div>
                                <Input value={s.buttons?.[0]?.title || ""} onChange={(e) => setStep(i, { buttons: [{ title: e.target.value, url: s.buttons?.[0]?.url }] })} placeholder="متن دکمه (مثلاً: مشاهده و خرید)" className="rounded-xl" />
                                <div className="relative"><Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input value={s.buttons?.[0]?.url || ""} onChange={(e) => setStep(i, { buttons: [{ title: s.buttons?.[0]?.title || "مشاهده", url: e.target.value }] })} placeholder={siteUrl} dir="ltr" className="rounded-xl pr-9" /></div>
                              </>
                            )}
                          </div>
                        )}
                        {s.type === "delay" && <div className="flex items-center gap-2 text-sm"><Input type="number" dir="ltr" min={1} max={10} value={s.seconds || 2} onChange={(e) => setStep(i, { seconds: Number(e.target.value) })} className="rounded-xl w-24" /> ثانیه مکث</div>}
                        {s.type === "handoff" && <Input value={s.text || ""} onChange={(e) => setStep(i, { text: e.target.value })} placeholder="پیام ارجاع (اختیاری)" className="rounded-xl" />}
                        {s.type === "ai" && <Input value={s.instruction || ""} onChange={(e) => setStep(i, { instruction: e.target.value })} placeholder="راهنمای اختیاری برای AI (مثلاً: فقط قیمت بده)" className="rounded-xl" />}
                      </Reorder.Item>
                    )
                  })}
                </Reorder.Group>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(Object.keys(STEP_META) as StepType[]).map((t) => {
                    const M = STEP_META[t]
                    return <button key={t} type="button" onClick={() => setEditing({ ...editing, steps: [...editing.steps, ...withIds([t === "delay" ? { type: t, seconds: 2 } : { type: t }])] })} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs hover:shadow transition", M.color)}><Plus className="w-3 h-3" /><M.icon className="w-3.5 h-3.5" /> {M.label}</button>
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3"><span className="text-sm">فعال</span><Switch checked={editing.enabled} onCheckedChange={(v) => setEditing({ ...editing, enabled: v })} /></div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>انصراف</Button>
                <Button className="rounded-xl bg-gradient-to-r from-pink-500 to-violet-600" onClick={save} disabled={saving || !editing.name.trim() || editing.steps.length === 0}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 ml-1" />} ذخیره ورک‌فلو</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UrlOrUpload({ value, onChange, accept, placeholder }: { value: string; onChange: (v: string) => void; accept: string; placeholder: string }) {
  const [up, setUp] = useState(false)
  return (
    <div className="flex gap-2 items-center">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir="ltr" className="rounded-xl flex-1" />
      <label className="inline-flex items-center gap-1 rounded-xl border px-3 h-10 text-xs cursor-pointer hover:bg-gray-50 shrink-0">
        {up ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} آپلود
        <input type="file" accept={accept} className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setUp(true); try { const fd = new FormData(); fd.append("file", f); const r = await fetch(accept.startsWith("image") ? "/api/upload-image" : "/api/upload", { method: "POST", body: fd }); const d = await r.json(); if (d.url) onChange(d.url) } finally { setUp(false) } }} />
      </label>
      {value && accept.startsWith("image") && <img src={value} alt="" className="w-10 h-10 rounded-lg object-cover border" />}
    </div>
  )
}

// ---------------------------------------------------------------------------

function SimulatorTab() {
  const [text, setText] = useState("")
  const [log, setLog] = useState<Array<{ from: "user" | "bot"; text: string; kind?: string; meta?: string }>>([])
  const [busy, setBusy] = useState(false)

  const send = async () => {
    const t = text.trim()
    if (!t) return
    setText("")
    setLog((l) => [...l, { from: "user", text: t }])
    setBusy(true)
    try {
      const res = await fetch("/api/instagram/workflows/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "خطا")
      const meta = d.via === "workflow" ? `ورک‌فلو: ${d.workflow?.name}` : d.via === "ai" ? "دستیار هوشمند" : d.via === "handoff" ? "ارجاع به ادمین" : "بدون پاسخ"
      if (!d.actions?.length) setLog((l) => [...l, { from: "bot", text: "(هیچ پاسخی ارسال نمی‌شود)", meta }])
      for (const a of d.actions || []) setLog((l) => [...l, { from: "bot", text: a.preview, kind: a.type, meta }])
    } catch (e) {
      setLog((l) => [...l, { from: "bot", text: e instanceof Error ? e.message : "خطا", kind: "error" }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6">
      <Card className="rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-violet-600 text-white p-4 flex items-center gap-3"><Instagram className="w-5 h-5" /><div><div className="font-bold text-sm">شبیه‌ساز دایرکت</div><div className="text-[11px] opacity-80">پیام بنویسید؛ هیچ چیزی واقعاً ارسال نمی‌شود</div></div></div>
        <CardContent className="p-4">
          <div className="h-[420px] overflow-y-auto space-y-3 pr-1">
            {log.length === 0 && <div className="h-full grid place-items-center text-sm text-gray-400 text-center">مثلاً بنویسید: «قیمت این چنده؟» یا «ارسال چند روزه؟»</div>}
            {log.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", m.from === "user" ? "justify-start" : "justify-end")}>
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", m.from === "user" ? "bg-gray-100 text-gray-900" : m.kind === "error" ? "bg-red-50 text-red-700" : "bg-gradient-to-br from-pink-500 to-violet-600 text-white")}>
                  {m.kind && m.kind !== "text" && m.kind !== "ai" && m.kind !== "error" && <div className="text-[10px] opacity-80 mb-1 flex items-center gap-1">{(STEP_META as any)[m.kind]?.label || m.kind}</div>}
                  <div className="whitespace-pre-line leading-6">{m.text}</div>
                  {m.meta && <div className="text-[10px] opacity-70 mt-1">{m.meta}</div>}
                </div>
              </motion.div>
            ))}
            {busy && <div className="flex justify-end"><div className="rounded-2xl bg-gray-100 px-4 py-2 text-xs text-gray-500 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> در حال پاسخ…</div></div>}
          </div>
          <div className="mt-3 flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="پیام مشتری…" className="rounded-2xl h-11" />
            <Button onClick={send} disabled={busy || !text.trim()} className="rounded-2xl h-11 bg-gradient-to-r from-pink-500 to-violet-600"><Send className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-3xl h-fit">
        <CardHeader><CardTitle className="text-base">ترتیب پردازش پیام</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-3">
          {["ورک‌فلو خوش‌آمد (فقط اولین پیام)", "ورک‌فلوهای کلیدواژه‌ای (به ترتیب اولویت)", "کلیدواژه‌های ارجاع به ادمین", "دستیار هوشمند (اگر فعال باشد)", "ورک‌فلو پیش‌فرض"].map((t, i) => (
            <div key={t} className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold grid place-items-center shrink-0">{(i + 1).toLocaleString("fa-IR")}</span>{t}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------

function InboxTab() {
  const [convs, setConvs] = useState<any[] | null>(null)
  const [active, setActive] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])

  const load = () => fetch("/api/instagram/conversations", { cache: "no-store" }).then((r) => r.json()).then((d) => setConvs(d.conversations || []))
  useEffect(() => {
    load()
  }, [])
  const open = async (c: any) => {
    setActive(c)
    const d = await fetch(`/api/instagram/conversations?id=${c.id}`).then((r) => r.json())
    setMessages(d.messages || [])
  }
  const togglePause = async () => {
    if (!active) return
    await fetch("/api/instagram/conversations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: active.id, ai_paused: !active.ai_paused }) })
    setActive({ ...active, ai_paused: !active.ai_paused })
    load()
  }

  if (!convs) return <div className="py-16 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
  if (convs.length === 0) return <Card className="rounded-3xl"><CardContent className="py-16 text-center text-gray-500">هنوز گفتگویی ثبت نشده است. بعد از اتصال پیج، دایرکت‌ها اینجا نمایش داده می‌شوند.</CardContent></Card>

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-4">
      <Card className="rounded-3xl overflow-hidden"><CardContent className="p-0 divide-y max-h-[560px] overflow-y-auto">
        {convs.map((c) => (
          <button key={c.id} onClick={() => open(c)} className={cn("w-full text-right p-4 hover:bg-gray-50 transition", active?.id === c.id && "bg-violet-50")}>
            <div className="flex items-center justify-between"><span className="font-bold text-sm text-gray-900">{c.sender_name || c.sender_username || `کاربر ${c.ig_sender_id.slice(-4)}`}</span>{c.ai_paused && <Badge className="rounded-lg bg-amber-100 text-amber-800 text-[10px]">AI متوقف</Badge>}</div>
            <div className="text-xs text-gray-500 line-clamp-1 mt-1">{c.last_direction === "out" ? "شما: " : ""}{c.last_content?.text || c.last_content?.title || "…"}</div>
            <div className="text-[10px] text-gray-400 mt-1">{new Date(c.last_message_at).toLocaleString("fa-IR")} · {c.message_count} پیام</div>
          </button>
        ))}
      </CardContent></Card>
      <Card className="rounded-3xl">
        {!active ? <CardContent className="py-24 text-center text-gray-400">یک گفتگو را انتخاب کنید</CardContent> : (
          <>
            <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">{active.sender_name || active.sender_username || `کاربر ${active.ig_sender_id.slice(-4)}`}</CardTitle><Button size="sm" variant={active.ai_paused ? "default" : "outline"} className="rounded-xl" onClick={togglePause}>{active.ai_paused ? "فعال کردن AI" : "توقف AI برای این گفتگو"}</Button></CardHeader>
            <CardContent className="space-y-2 max-h-[460px] overflow-y-auto">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.direction === "in" ? "justify-start" : "justify-end")}>
                  <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm", m.direction === "in" ? "bg-gray-100" : "bg-gradient-to-br from-pink-500 to-violet-600 text-white")}>
                    {m.kind === "image" || m.kind === "card" ? (m.content.image_url || m.content.url) && <img src={m.content.image_url || m.content.url} alt="" className="rounded-lg max-h-40 mb-1" /> : null}
                    <div className="whitespace-pre-line">{m.content.text || m.content.title || (m.kind === "voice" ? "🎤 ویس" : "")}</div>
                    <div className="text-[10px] opacity-60 mt-1">{m.kind === "ai" ? "AI" : m.kind} · {new Date(m.created_at).toLocaleTimeString("fa-IR")}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
