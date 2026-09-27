"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pill, Settings2, Loader2, CheckCircle2, Phone, Truck, Store, X, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRESCRIPTION_STATUSES } from "@/lib/shared/pharmacy-constants"

interface Rx {
  id: number
  request_number: string
  customer_name: string
  customer_phone: string
  insurance_type: string | null
  delivery_method: string
  address: string | null
  image_urls: string[]
  notes: string | null
  status: string
  pharmacist_note: string | null
  total_amount: number | null
  payment_status: string
  created_at: string
}

const STATUS_CLS: Record<string, string> = {
  received: "bg-blue-100 text-blue-800",
  reviewing: "bg-amber-100 text-amber-800",
  ready: "bg-emerald-100 text-emerald-800",
  delivering: "bg-violet-100 text-violet-800",
  delivered: "bg-gray-100 text-gray-700",
  rejected: "bg-red-100 text-red-700",
}

export default function PharmacyManager({ storeSlug }: { storeSlug: string }) {
  return (
    <Tabs defaultValue="prescriptions" className="space-y-6">
      <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-2xl bg-white border p-1">
        <TabsTrigger value="prescriptions" className="rounded-xl gap-2 data-[state=active]:bg-green-700 data-[state=active]:text-white"><Pill className="w-4 h-4" /> نسخه‌های دریافتی</TabsTrigger>
        <TabsTrigger value="settings" className="rounded-xl gap-2 data-[state=active]:bg-green-700 data-[state=active]:text-white"><Settings2 className="w-4 h-4" /> تنظیمات داروخانه</TabsTrigger>
      </TabsList>
      <TabsContent value="prescriptions"><PrescriptionsTab /></TabsContent>
      <TabsContent value="settings"><SettingsTab storeSlug={storeSlug} /></TabsContent>
    </Tabs>
  )
}

function PrescriptionsTab() {
  const [items, setItems] = useState<Rx[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Rx | null>(null)
  const [note, setNote] = useState("")
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/store/pharmacy/prescriptions${filter !== "all" ? `?status=${filter}` : ""}`, { cache: "no-store" })
    const data = await res.json()
    setItems(data.prescriptions || [])
    setStats(data.stats)
    setLoading(false)
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const open = (rx: Rx) => {
    setActive(rx)
    setNote(rx.pharmacist_note || "")
    setAmount(rx.total_amount ? String(rx.total_amount) : "")
  }

  const update = async (status?: string) => {
    if (!active) return
    setSaving(true)
    await fetch(`/api/store/pharmacy/prescriptions/${active.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, pharmacist_note: note, total_amount: amount === "" ? undefined : Number(amount) }),
    })
    setSaving(false)
    setActive(null)
    load()
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "نسخه جدید", v: stats.new_requests, c: "from-blue-500 to-indigo-500", i: Inbox },
            { l: "در حال بررسی", v: stats.reviewing, c: "from-amber-500 to-orange-500", i: Pill },
            { l: "آماده تحویل", v: stats.ready, c: "from-emerald-500 to-green-500", i: CheckCircle2 },
            { l: "۳۰ روز اخیر", v: stats.last30, c: "from-violet-500 to-fuchsia-500", i: Truck },
          ].map((s) => (
            <Card key={s.l} className="rounded-2xl"><CardContent className="p-4 flex items-center gap-3"><div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br text-white grid place-items-center", s.c)}><s.i className="w-5 h-5" /></div><div><div className="text-xs text-gray-500">{s.l}</div><div className="text-lg font-black">{Number(s.v || 0).toLocaleString("fa-IR")}</div></div></CardContent></Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={cn("rounded-full px-4 py-1.5 text-sm border", filter === "all" ? "bg-green-700 text-white border-green-700" : "bg-white")}>همه</button>
        {PRESCRIPTION_STATUSES.map((s) => <button key={s.id} onClick={() => setFilter(s.id)} className={cn("rounded-full px-4 py-1.5 text-sm border", filter === s.id ? "bg-green-700 text-white border-green-700" : "bg-white")}>{s.label}</button>)}
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl"><CardContent className="py-16 text-center text-gray-500">نسخه‌ای یافت نشد. نسخه‌هایی که مشتریان از سایت ارسال می‌کنند اینجا نمایش داده می‌شوند.</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((rx) => (
            <Card key={rx.id} className="rounded-2xl cursor-pointer hover:border-green-400 transition" onClick={() => open(rx)}>
              <CardContent className="p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">{rx.image_urls[0] && <img src={rx.image_urls[0]} alt="" className="w-full h-full object-cover" />}</div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-gray-900">{rx.customer_name}</span><Badge className={cn("rounded-lg", STATUS_CLS[rx.status])}>{PRESCRIPTION_STATUSES.find((s) => s.id === rx.status)?.label}</Badge></div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-x-3"><span dir="ltr">{rx.customer_phone}</span>{rx.insurance_type && <span>بیمه: {rx.insurance_type}</span>}<span className="inline-flex items-center gap-1">{rx.delivery_method === "delivery" ? <Truck className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}{rx.delivery_method === "delivery" ? "ارسال" : "حضوری"}</span></div>
                  <div className="text-[11px] text-gray-400 font-mono" dir="ltr">{rx.request_number} · {new Date(rx.created_at).toLocaleDateString("fa-IR")}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(active)} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>بررسی نسخه {active?.request_number}</DialogTitle></DialogHeader>
          {active && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">{active.image_urls.map((u) => <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="w-28 h-28 rounded-xl overflow-hidden border"><img src={u} alt="" className="w-full h-full object-cover" /></a>)}</div>
              <div className="grid sm:grid-cols-2 gap-2 text-sm bg-gray-50 rounded-xl p-3">
                <div><span className="text-gray-500">بیمار:</span> {active.customer_name}</div>
                <div><span className="text-gray-500">موبایل:</span> <a href={`tel:${active.customer_phone}`} dir="ltr" className="text-green-700">{active.customer_phone}</a></div>
                <div><span className="text-gray-500">بیمه:</span> {active.insurance_type || "—"}</div>
                <div><span className="text-gray-500">تحویل:</span> {active.delivery_method === "delivery" ? "ارسال به آدرس" : "حضوری"}</div>
                {active.address && <div className="sm:col-span-2"><span className="text-gray-500">آدرس:</span> {active.address}</div>}
                {active.notes && <div className="sm:col-span-2"><span className="text-gray-500">توضیحات مشتری:</span> {active.notes}</div>}
              </div>
              <div className="grid sm:grid-cols-[1fr_180px] gap-3">
                <div><Label>یادداشت داروساز (برای مشتری نمایش داده می‌شود)</Label><Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="rounded-xl" placeholder="مثلاً: داروی X موجود نیست، جایگزین Y پیشنهاد می‌شود" /></div>
                <div><Label>مبلغ نهایی (تومان)</Label><Input type="number" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl" /></div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <Button variant="outline" className="rounded-xl" onClick={() => update()} disabled={saving}>ذخیره یادداشت</Button>
                {active.status === "received" && <Button className="rounded-xl bg-amber-600 hover:bg-amber-700" onClick={() => update("reviewing")} disabled={saving}>شروع بررسی</Button>}
                {(active.status === "received" || active.status === "reviewing") && <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => update("ready")} disabled={saving}>آماده تحویل</Button>}
                {active.status === "ready" && active.delivery_method === "delivery" && <Button className="rounded-xl bg-violet-600 hover:bg-violet-700" onClick={() => update("delivering")} disabled={saving}>ارسال شد</Button>}
                {(active.status === "ready" || active.status === "delivering") && <Button className="rounded-xl bg-gray-800 hover:bg-gray-900" onClick={() => update("delivered")} disabled={saving}>تحویل شد</Button>}
                {active.status !== "delivered" && <Button variant="ghost" className="rounded-xl text-red-600" onClick={() => update("rejected")} disabled={saving}>نیاز به اصلاح نسخه</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SettingsTab({ storeSlug }: { storeSlug: string }) {
  const [s, setS] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [ins, setIns] = useState("")
  useEffect(() => {
    fetch("/api/store/pharmacy/settings", { cache: "no-store" }).then((r) => r.json()).then((d) => setS(d.settings))
  }, [])
  const save = async () => {
    setSaving(true)
    const res = await fetch("/api/store/pharmacy/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) })
    const d = await res.json()
    if (d.settings) setS(d.settings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }
  if (!s) return <div className="py-16 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
  const base = process.env.NEXT_PUBLIC_STOREFRONT_BASE_DOMAIN || "tsll.ir"
  const Row = ({ label, desc, k }: { label: string; desc?: string; k: string }) => (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
      <div><div className="text-sm font-medium text-gray-900">{label}</div>{desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}</div>
      <Switch checked={Boolean(s[k])} onCheckedChange={(v) => setS({ ...s, [k]: v })} />
    </div>
  )
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>تنظیمات داروخانه</CardTitle><CardDescription>این تنظیمات روی صفحه اصلی و فرم ارسال نسخه اعمال می‌شود.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Row label="پذیرش نسخه آنلاین" k="accepts_prescriptions" />
          <Row label="داروخانه شبانه‌روزی" desc="نشان ۲۴ ساعته روی سایت نمایش داده می‌شود" k="is_24h" />
          <Row label="ارسال دارو در محل" k="delivery_enabled" />
          <Row label="داروساز هوشمند (هوش مصنوعی)" desc="پاسخ به سوالات دارویی بر اساس موجودی داروخانه" k="ai_advisor_enabled" />
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>نام داروساز مسئول</Label><Input value={s.pharmacist_name || ""} onChange={(e) => setS({ ...s, pharmacist_name: e.target.value })} className="rounded-xl" /></div>
            <div><Label>شماره پروانه</Label><Input value={s.license_no || ""} onChange={(e) => setS({ ...s, license_no: e.target.value })} className="rounded-xl" dir="ltr" /></div>
            <div><Label>هزینه ارسال (تومان)</Label><Input type="number" dir="ltr" value={s.delivery_fee} onChange={(e) => setS({ ...s, delivery_fee: Number(e.target.value) || 0 })} className="rounded-xl" /></div>
            <div><Label>تلفن فوری</Label><Input value={s.emergency_phone || ""} onChange={(e) => setS({ ...s, emergency_phone: e.target.value })} className="rounded-xl" dir="ltr" /></div>
          </div>
          <div>
            <Label>بیمه‌های پذیرش‌شده</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">{(s.insurance_types || []).map((i: string) => <Badge key={i} variant="secondary" className="rounded-lg gap-1">{i}<button onClick={() => setS({ ...s, insurance_types: s.insurance_types.filter((x: string) => x !== i) })}><X className="w-3 h-3" /></button></Badge>)}</div>
            <div className="flex gap-2"><Input value={ins} onChange={(e) => setIns(e.target.value)} placeholder="نام بیمه" className="rounded-xl" /><Button variant="outline" className="rounded-xl" onClick={() => { if (ins.trim()) { setS({ ...s, insurance_types: [...s.insurance_types, ins.trim()] }); setIns("") } }}>افزودن</Button></div>
          </div>
          <div className="flex justify-end"><Button onClick={save} disabled={saving} className="rounded-xl bg-green-700 hover:bg-green-800">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 ml-1" /> : null}{saved ? "ذخیره شد" : "ذخیره تنظیمات"}</Button></div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl h-fit bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
        <CardHeader><CardTitle className="text-base">لینک ارسال نسخه</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <a className="block rounded-xl bg-white border p-3 hover:border-green-400" href={`https://${storeSlug}.${base}/prescription`} target="_blank" rel="noopener noreferrer" dir="ltr">{storeSlug}.{base}/prescription</a>
          <p className="text-xs text-gray-600 flex items-start gap-2"><Phone className="w-4 h-4 shrink-0" /> این لینک را در بیو اینستاگرام قرار دهید؛ مشتریان بدون تماس نسخه می‌فرستند.</p>
        </CardContent>
      </Card>
    </div>
  )
}
