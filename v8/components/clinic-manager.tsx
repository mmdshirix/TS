"use client"

import { useEffect, useMemo, useState } from "react"
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
import { CalendarDays, Stethoscope, Settings2, Plus, Trash2, Pencil, Loader2, CheckCircle2, Clock, Wallet, Phone, Upload, ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { SPECIALTIES } from "@/lib/shared/clinic-constants"

const WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"]

interface Schedule {
  weekday: number
  start_time: string
  end_time: string
  slot_minutes?: number | null
}
interface Doctor {
  id: number
  name: string
  title: string | null
  specialty: string
  bio: string | null
  photo_url: string | null
  medical_council_no: string | null
  consultation_fee: number | null
  visit_duration_min: number
  keywords: string | null
  is_active: boolean
  schedules: Schedule[]
}
interface Appointment {
  id: number
  appointment_number: string
  doctor_name: string | null
  patient_name: string
  patient_phone: string
  symptoms: string | null
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  fee: number
  payment_method: string | null
  payment_status: string
  receipt_image_url: string | null
}
interface Settings {
  booking_enabled: boolean
  fee_required: boolean
  default_fee: number
  slot_minutes: number
  booking_horizon_days: number
  cancellation_policy: string | null
  ai_triage_enabled: boolean
  emergency_note: string | null
  insurance_types: string[]
}

const STATUS: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: "در انتظار پرداخت", cls: "bg-amber-100 text-amber-800" },
  confirmed: { label: "تایید شده", cls: "bg-emerald-100 text-emerald-800" },
  completed: { label: "انجام شده", cls: "bg-blue-100 text-blue-800" },
  cancelled: { label: "لغو شده", cls: "bg-gray-100 text-gray-600" },
  no_show: { label: "عدم حضور", cls: "bg-red-100 text-red-700" },
}

function toJalali(iso: string) {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString("fa-IR", { weekday: "long", day: "numeric", month: "long" })
  } catch {
    return iso
  }
}

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append("file", file)
  const res = await fetch("/api/upload-image", { method: "POST", body: fd })
  const data = await res.json()
  if (!res.ok || !data.url) throw new Error(data.error || "خطا در آپلود")
  return data.url
}

export default function ClinicManager({ storeSlug }: { storeSlug: string }) {
  const [tab, setTab] = useState("appointments")
  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">
      <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-2xl bg-white border p-1">
        <TabsTrigger value="appointments" className="rounded-xl gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white"><CalendarDays className="w-4 h-4" /> نوبت‌ها</TabsTrigger>
        <TabsTrigger value="doctors" className="rounded-xl gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white"><Stethoscope className="w-4 h-4" /> پزشکان و برنامه</TabsTrigger>
        <TabsTrigger value="settings" className="rounded-xl gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white"><Settings2 className="w-4 h-4" /> تنظیمات نوبت‌دهی</TabsTrigger>
      </TabsList>
      <TabsContent value="appointments"><AppointmentsTab /></TabsContent>
      <TabsContent value="doctors"><DoctorsTab /></TabsContent>
      <TabsContent value="settings"><SettingsTab storeSlug={storeSlug} /></TabsContent>
    </Tabs>
  )
}

// ---------------------------------------------------------------------------

function AppointmentsTab() {
  const [items, setItems] = useState<Appointment[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filter, setFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/store/clinic/appointments${filter !== "all" ? `?status=${filter}` : ""}`, { cache: "no-store" })
    const data = await res.json()
    setItems(data.appointments || [])
    setStats(data.stats || null)
    setLoading(false)
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const setStatus = async (id: number, status: string, payment_status?: string) => {
    setBusy(id)
    await fetch(`/api/store/clinic/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, payment_status }) })
    setBusy(null)
    load()
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={CalendarDays} label="نوبت‌های امروز" value={stats.today} />
          <StatCard icon={Clock} label="در انتظار پرداخت" value={stats.pending} />
          <StatCard icon={Upload} label="فیش در انتظار تایید" value={stats.awaiting_review} tone="amber" />
          <StatCard icon={Wallet} label="درآمد ۳۰ روز" value={`${Number(stats.revenue30 || 0).toLocaleString("fa-IR")} تومان`} tone="emerald" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[{ id: "all", l: "همه" }, { id: "confirmed", l: "تایید شده" }, { id: "pending_payment", l: "در انتظار پرداخت" }, { id: "completed", l: "انجام شده" }, { id: "cancelled", l: "لغو شده" }].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={cn("rounded-full px-4 py-1.5 text-sm border transition", filter === f.id ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-700 hover:border-teal-400")}>{f.l}</button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl"><CardContent className="py-16 text-center text-gray-500">نوبتی یافت نشد. وقتی بیماران از سایت نوبت بگیرند، اینجا نمایش داده می‌شود.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const s = STATUS[a.status] || STATUS.pending_payment
            return (
              <Card key={a.id} className="rounded-2xl">
                <CardContent className="p-4 grid md:grid-cols-[1fr_auto] gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-gray-900">{a.patient_name}</span>
                      <a href={`tel:${a.patient_phone}`} className="text-sm text-gray-500 inline-flex items-center gap-1" dir="ltr"><Phone className="w-3.5 h-3.5" />{a.patient_phone}</a>
                      <Badge className={cn("rounded-lg", s.cls)}>{s.label}</Badge>
                      {a.payment_status === "paid" && <Badge className="rounded-lg bg-emerald-50 text-emerald-700">پرداخت شده</Badge>}
                      {a.payment_status === "awaiting_review" && <Badge className="rounded-lg bg-amber-50 text-amber-700">فیش ارسال شده</Badge>}
                    </div>
                    <div className="text-sm text-gray-700 flex flex-wrap gap-x-4 gap-y-1">
                      <span><CalendarDays className="inline w-4 h-4 ml-1 text-teal-600" />{toJalali(a.appointment_date)} · {a.start_time.slice(0, 5)}</span>
                      {a.doctor_name && <span><Stethoscope className="inline w-4 h-4 ml-1 text-teal-600" />{a.doctor_name}</span>}
                      <span><Wallet className="inline w-4 h-4 ml-1 text-teal-600" />{Number(a.fee).toLocaleString("fa-IR")} تومان</span>
                      <span className="text-gray-400 font-mono text-xs" dir="ltr">{a.appointment_number}</span>
                    </div>
                    {a.symptoms && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">علائم: {a.symptoms}</p>}
                    {a.receipt_image_url && <a href={a.receipt_image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-teal-700 underline"><ImageIcon className="w-3.5 h-3.5" /> مشاهده فیش پرداخت</a>}
                  </div>
                  <div className="flex flex-wrap md:flex-col gap-2 md:w-44">
                    {a.status === "pending_payment" && <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700" disabled={busy === a.id} onClick={() => setStatus(a.id, "confirmed", "paid")}>تایید پرداخت و نوبت</Button>}
                    {a.status === "confirmed" && <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700" disabled={busy === a.id} onClick={() => setStatus(a.id, "completed")}>ویزیت انجام شد</Button>}
                    {a.status === "confirmed" && <Button size="sm" variant="outline" className="rounded-xl" disabled={busy === a.id} onClick={() => setStatus(a.id, "no_show")}>عدم حضور</Button>}
                    {(a.status === "confirmed" || a.status === "pending_payment") && <Button size="sm" variant="ghost" className="rounded-xl text-red-600" disabled={busy === a.id} onClick={() => setStatus(a.id, "cancelled")}>لغو نوبت</Button>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, tone = "teal" }: { icon: any; label: string; value: any; tone?: "teal" | "amber" | "emerald" }) {
  const tones = { teal: "from-teal-500 to-cyan-500", amber: "from-amber-500 to-orange-500", emerald: "from-emerald-500 to-green-500" }
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br text-white grid place-items-center", tones[tone])}><Icon className="w-5 h-5" /></div>
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-lg font-black text-gray-900">{typeof value === "number" ? value.toLocaleString("fa-IR") : value}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------

const EMPTY_DOCTOR: Omit<Doctor, "id"> = { name: "", title: "دکتر", specialty: "پزشک عمومی", bio: "", photo_url: null, medical_council_no: "", consultation_fee: null, visit_duration_min: 20, keywords: "", is_active: true, schedules: [] }

function DoctorsTab() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Omit<Doctor, "id"> & { id?: number }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const load = async () => {
    const res = await fetch("/api/store/clinic/doctors", { cache: "no-store" })
    const data = await res.json()
    setDoctors(data.doctors || [])
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch(editing.id ? `/api/store/clinic/doctors/${editing.id}` : "/api/store/clinic/doctors", {
        method: editing.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "خطا")
      setEditing(null)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm("این پزشک و برنامه زمانی او حذف شود؟")) return
    await fetch(`/api/store/clinic/doctors/${id}`, { method: "DELETE" })
    load()
  }

  const toggleDay = (wd: number) => {
    if (!editing) return
    const has = editing.schedules.some((s) => s.weekday === wd)
    setEditing({ ...editing, schedules: has ? editing.schedules.filter((s) => s.weekday !== wd) : [...editing.schedules, { weekday: wd, start_time: "16:00", end_time: "20:00" }].sort((a, b) => a.weekday - b.weekday) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">پزشکان، تخصص، هزینه ویزیت و برنامه هفتگی هر پزشک را مدیریت کنید. نوبت‌های خالی به‌صورت خودکار از این برنامه ساخته می‌شوند.</p>
        <Button onClick={() => setEditing({ ...EMPTY_DOCTOR })} className="rounded-xl bg-teal-600 hover:bg-teal-700 gap-2"><Plus className="w-4 h-4" /> پزشک جدید</Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : doctors.length === 0 ? (
        <Card className="rounded-2xl"><CardContent className="py-16 text-center text-gray-500">هنوز پزشکی ثبت نشده است. اولین پزشک را اضافه کنید.</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doctors.map((d) => (
            <Card key={d.id} className={cn("rounded-2xl", !d.is_active && "opacity-60")}>
              <CardContent className="p-4 flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-teal-50 overflow-hidden grid place-items-center shrink-0">
                  {d.photo_url ? <img src={d.photo_url} alt={d.name} className="w-full h-full object-cover" /> : <Stethoscope className="w-7 h-7 text-teal-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-gray-900">{d.title} {d.name}</div>
                      <div className="text-sm text-teal-700">{d.specialty}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="rounded-lg h-8 w-8" onClick={() => setEditing({ ...d, schedules: d.schedules || [] })}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="rounded-lg h-8 w-8 text-red-600" onClick={() => remove(d.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {WEEKDAYS.map((w, i) => {
                      const s = d.schedules?.find((x) => x.weekday === i)
                      return <span key={w} className={cn("text-[10px] rounded-md px-1.5 py-0.5", s ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-400")} title={s ? `${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)}` : "تعطیل"}>{w.slice(0, 1)}</span>
                    })}
                    <span className="text-[11px] text-gray-500 mr-2">{d.consultation_fee ? `${Number(d.consultation_fee).toLocaleString("fa-IR")} تومان` : "هزینه پیش‌فرض"} · {d.visit_duration_min} دقیقه</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editing?.id ? "ویرایش پزشک" : "پزشک جدید"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-20 h-20 rounded-2xl bg-teal-50 border-2 border-dashed border-teal-200 grid place-items-center cursor-pointer overflow-hidden shrink-0">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-teal-600" /> : editing.photo_url ? <img src={editing.photo_url} alt="" className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 text-teal-600" />}
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setUploading(true); try { setEditing({ ...editing, photo_url: await uploadImage(f) }) } catch (err) { setError(String(err)) } finally { setUploading(false) } }} />
                </label>
                <div className="grid grid-cols-[80px_1fr] gap-2 flex-1">
                  <div><Label>عنوان</Label><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-xl" /></div>
                  <div><Label>نام و نام خانوادگی *</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="rounded-xl" /></div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>تخصص</Label>
                  <Select value={editing.specialty} onValueChange={(v) => setEditing({ ...editing, specialty: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{SPECIALTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>شماره نظام پزشکی</Label><Input value={editing.medical_council_no || ""} onChange={(e) => setEditing({ ...editing, medical_council_no: e.target.value })} className="rounded-xl" dir="ltr" /></div>
                <div><Label>هزینه ویزیت (تومان) — خالی = پیش‌فرض</Label><Input type="number" value={editing.consultation_fee ?? ""} onChange={(e) => setEditing({ ...editing, consultation_fee: e.target.value === "" ? null : Number(e.target.value) })} className="rounded-xl" dir="ltr" /></div>
                <div><Label>مدت هر ویزیت (دقیقه)</Label><Input type="number" value={editing.visit_duration_min} onChange={(e) => setEditing({ ...editing, visit_duration_min: Number(e.target.value) || 20 })} className="rounded-xl" dir="ltr" /></div>
              </div>
              <div><Label>معرفی کوتاه</Label><Textarea value={editing.bio || ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={2} className="rounded-xl" /></div>
              <div><Label>کلیدواژه‌های علائم (برای راهنمای هوشمند)</Label><Input value={editing.keywords || ""} onChange={(e) => setEditing({ ...editing, keywords: e.target.value })} placeholder="مثلاً: تپش قلب، فشار خون، درد قفسه سینه" className="rounded-xl" /></div>

              <div>
                <Label className="mb-2 block">برنامه هفتگی</Label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {WEEKDAYS.map((w, i) => {
                    const on = editing.schedules.some((s) => s.weekday === i)
                    return <button key={w} type="button" onClick={() => toggleDay(i)} className={cn("rounded-full px-3 py-1.5 text-xs border transition", on ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 hover:border-teal-400")}>{w}</button>
                  })}
                </div>
                <div className="space-y-2">
                  {editing.schedules.map((s, idx) => (
                    <div key={s.weekday} className="grid grid-cols-[80px_1fr_1fr_auto] items-center gap-2 text-sm">
                      <span className="text-gray-700">{WEEKDAYS[s.weekday]}</span>
                      <Input type="time" value={s.start_time.slice(0, 5)} onChange={(e) => { const n = [...editing.schedules]; n[idx] = { ...s, start_time: e.target.value }; setEditing({ ...editing, schedules: n }) }} className="rounded-xl" dir="ltr" />
                      <Input type="time" value={s.end_time.slice(0, 5)} onChange={(e) => { const n = [...editing.schedules]; n[idx] = { ...s, end_time: e.target.value }; setEditing({ ...editing, schedules: n }) }} className="rounded-xl" dir="ltr" />
                      <button type="button" onClick={() => toggleDay(s.weekday)} className="text-gray-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-sm">نمایش در سایت و امکان رزرو</span>
                <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>انصراف</Button>
                <Button className="rounded-xl bg-teal-600 hover:bg-teal-700" onClick={save} disabled={saving || !editing.name.trim()}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 ml-1" />} ذخیره</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------------------------------------------------------------------------

function SettingsTab({ storeSlug }: { storeSlug: string }) {
  const [s, setS] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [insurance, setInsurance] = useState("")

  useEffect(() => {
    fetch("/api/store/clinic/settings", { cache: "no-store" }).then((r) => r.json()).then((d) => setS(d.settings))
  }, [])

  const save = async () => {
    if (!s) return
    setSaving(true)
    const res = await fetch("/api/store/clinic/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) })
    const data = await res.json()
    if (data.settings) setS(data.settings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!s) return <div className="py-16 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
  const base = process.env.NEXT_PUBLIC_STOREFRONT_BASE_DOMAIN || "tsll.ir"

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>تنظیمات نوبت‌دهی</CardTitle><CardDescription>این تنظیمات روی صفحه رزرو نوبت سایت شما اعمال می‌شود.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <Row label="نوبت‌دهی آنلاین فعال" desc="در صورت غیرفعال شدن، دکمه رزرو از سایت حذف می‌شود"><Switch checked={s.booking_enabled} onCheckedChange={(v) => setS({ ...s, booking_enabled: v })} /></Row>
          <Row label="پرداخت ویزیت قبل از تایید نوبت" desc="بیمار باید هزینه را آنلاین پرداخت کند تا نوبت قطعی شود"><Switch checked={s.fee_required} onCheckedChange={(v) => setS({ ...s, fee_required: v })} /></Row>
          <Row label="راهنمای هوشمند علائم" desc="دستیار هوش مصنوعی بیمار را به تخصص مناسب هدایت می‌کند"><Switch checked={s.ai_triage_enabled} onCheckedChange={(v) => setS({ ...s, ai_triage_enabled: v })} /></Row>
          <div className="grid sm:grid-cols-3 gap-3">
            <div><Label>هزینه ویزیت پیش‌فرض (تومان)</Label><Input type="number" dir="ltr" value={s.default_fee} onChange={(e) => setS({ ...s, default_fee: Number(e.target.value) || 0 })} className="rounded-xl" /></div>
            <div><Label>مدت هر نوبت (دقیقه)</Label><Input type="number" dir="ltr" value={s.slot_minutes} onChange={(e) => setS({ ...s, slot_minutes: Number(e.target.value) || 20 })} className="rounded-xl" /></div>
            <div><Label>بازه رزرو (روز)</Label><Input type="number" dir="ltr" value={s.booking_horizon_days} onChange={(e) => setS({ ...s, booking_horizon_days: Number(e.target.value) || 30 })} className="rounded-xl" /></div>
          </div>
          <div>
            <Label>بیمه‌های طرف قرارداد</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {s.insurance_types.map((i) => <Badge key={i} variant="secondary" className="rounded-lg gap-1">{i}<button onClick={() => setS({ ...s, insurance_types: s.insurance_types.filter((x) => x !== i) })}><X className="w-3 h-3" /></button></Badge>)}
            </div>
            <div className="flex gap-2"><Input value={insurance} onChange={(e) => setInsurance(e.target.value)} placeholder="نام بیمه" className="rounded-xl" onKeyDown={(e) => { if (e.key === "Enter" && insurance.trim()) { setS({ ...s, insurance_types: [...s.insurance_types, insurance.trim()] }); setInsurance("") } }} /><Button variant="outline" className="rounded-xl" onClick={() => { if (insurance.trim()) { setS({ ...s, insurance_types: [...s.insurance_types, insurance.trim()] }); setInsurance("") } }}>افزودن</Button></div>
          </div>
          <div><Label>سیاست لغو نوبت</Label><Textarea value={s.cancellation_policy || ""} onChange={(e) => setS({ ...s, cancellation_policy: e.target.value })} rows={2} className="rounded-xl" /></div>
          <div><Label>پیام اورژانس (پایین صفحه اصلی)</Label><Input value={s.emergency_note || ""} onChange={(e) => setS({ ...s, emergency_note: e.target.value })} className="rounded-xl" /></div>
          <div className="flex justify-end"><Button onClick={save} disabled={saving} className="rounded-xl bg-teal-600 hover:bg-teal-700">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 ml-1" /> : null}{saved ? "ذخیره شد" : "ذخیره تنظیمات"}</Button></div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl h-fit bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100">
        <CardHeader><CardTitle className="text-base">لینک‌های مطب</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <a className="block rounded-xl bg-white border p-3 hover:border-teal-400" href={`https://${storeSlug}.${base}/book`} target="_blank" rel="noopener noreferrer" dir="ltr">{storeSlug}.{base}/book</a>
          <p className="text-xs text-gray-600">این لینک را در بیو اینستاگرام یا پیامک‌ها قرار دهید تا بیماران مستقیم نوبت بگیرند.</p>
          <p className="text-xs text-gray-600">درگاه‌های پرداخت ویزیت از بخش «تنظیمات درگاه پرداخت» فعال می‌شوند.</p>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
      <div><div className="text-sm font-medium text-gray-900">{label}</div>{desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}</div>
      {children}
    </div>
  )
}
