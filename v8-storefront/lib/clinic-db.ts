import { getSql } from "@/lib/db"
import { parseISODate, persianWeekday, toISODate } from "@/lib/jalali"

export interface ClinicSettings {
  store_id: number
  booking_enabled: boolean
  fee_required: boolean
  default_fee: number
  slot_minutes: number
  booking_horizon_days: number
  cancellation_policy: string | null
  ai_triage_enabled: boolean
  ai_welcome: string | null
  emergency_note: string | null
  insurance_types: string[]
}

export interface Doctor {
  id: number
  store_id: number
  name: string
  slug: string
  title: string | null
  specialty: string
  specialty_slug: string | null
  bio: string | null
  photo_url: string | null
  medical_council_no: string | null
  consultation_fee: number | null
  visit_duration_min: number
  keywords: string | null
  rating_avg: number
  rating_count: number
  is_active: boolean
  sort_order: number
}

export interface Schedule {
  id: number
  doctor_id: number
  weekday: number
  start_time: string
  end_time: string
  slot_minutes: number | null
  is_active: boolean
}

export interface Appointment {
  id: number
  store_id: number
  doctor_id: number | null
  appointment_number: string
  patient_name: string
  patient_phone: string
  patient_national_id: string | null
  symptoms: string | null
  notes: string | null
  ai_triage: Record<string, any> | null
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  fee: number
  payment_method: string | null
  payment_status: string
  payment_ref: string | null
  receipt_image_url: string | null
  created_at: string
}

const DEFAULT_SETTINGS: Omit<ClinicSettings, "store_id"> = {
  booking_enabled: true,
  fee_required: true,
  default_fee: 0,
  slot_minutes: 20,
  booking_horizon_days: 30,
  cancellation_policy: null,
  ai_triage_enabled: true,
  ai_welcome: null,
  emergency_note: null,
  insurance_types: [],
}

export async function getClinicSettings(storeId: number): Promise<ClinicSettings> {
  try {
    const sql = getSql()
    const r = await sql`SELECT * FROM clinic_settings WHERE store_id = ${storeId}`
    if (r.length === 0) return { store_id: storeId, ...DEFAULT_SETTINGS }
    const row = r[0] as any
    return { ...row, default_fee: Number(row.default_fee || 0), insurance_types: Array.isArray(row.insurance_types) ? row.insurance_types : [] }
  } catch {
    return { store_id: storeId, ...DEFAULT_SETTINGS }
  }
}

export async function listDoctors(storeId: number): Promise<Doctor[]> {
  try {
    const sql = getSql()
    const r = await sql`SELECT * FROM clinic_doctors WHERE store_id = ${storeId} AND is_active = TRUE ORDER BY sort_order ASC, id ASC`
    return r as unknown as Doctor[]
  } catch (e) {
    console.error("listDoctors", e)
    return []
  }
}

export async function getDoctorBySlug(storeId: number, slug: string): Promise<Doctor | null> {
  try {
    const sql = getSql()
    const r = await sql`SELECT * FROM clinic_doctors WHERE store_id = ${storeId} AND slug = ${slug} AND is_active = TRUE`
    return (r[0] as unknown as Doctor) || null
  } catch {
    return null
  }
}

export async function getDoctorById(id: number): Promise<Doctor | null> {
  try {
    const sql = getSql()
    const r = await sql`SELECT * FROM clinic_doctors WHERE id = ${id}`
    return (r[0] as unknown as Doctor) || null
  } catch {
    return null
  }
}

export async function listSchedules(doctorId: number): Promise<Schedule[]> {
  try {
    const sql = getSql()
    const r = await sql`SELECT * FROM clinic_schedules WHERE doctor_id = ${doctorId} AND is_active = TRUE ORDER BY weekday, start_time`
    return r as unknown as Schedule[]
  } catch {
    return []
  }
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}
function minutesToTime(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

export interface DaySlots {
  date: string
  weekday: number
  slots: Array<{ start: string; end: string; available: boolean }>
}

/**
 * Availability for the next N days: expands weekly schedules into concrete slots and
 * marks the ones already taken (pending or confirmed) as unavailable.
 */
export async function getDoctorAvailability(doctor: Doctor, settings: ClinicSettings, days?: number): Promise<DaySlots[]> {
  const horizon = days || settings.booking_horizon_days || 30
  const schedules = await listSchedules(doctor.id)
  if (schedules.length === 0) return []

  const sql = getSql()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setDate(end.getDate() + horizon)

  let taken: Array<{ appointment_date: string; start_time: string }> = []
  let daysOff: string[] = []
  try {
    const t = await sql`
      SELECT appointment_date::text, start_time::text FROM appointments
      WHERE doctor_id = ${doctor.id} AND status IN ('pending_payment', 'confirmed')
        AND appointment_date BETWEEN ${toISODate(today)} AND ${toISODate(end)}
    `
    taken = t as any
    const off = await sql`SELECT off_date::text FROM clinic_time_off WHERE doctor_id = ${doctor.id} AND off_date BETWEEN ${toISODate(today)} AND ${toISODate(end)}`
    daysOff = (off as any[]).map((o) => o.off_date)
  } catch (e) {
    console.error("availability", e)
  }
  const takenSet = new Set(taken.map((t) => `${t.appointment_date}|${t.start_time.slice(0, 5)}`))
  const slotMin = doctor.visit_duration_min || settings.slot_minutes || 20
  const now = new Date()

  const result: DaySlots[] = []
  for (let i = 0; i < horizon; i += 1) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const iso = toISODate(d)
    if (daysOff.includes(iso)) continue
    const wd = persianWeekday(d)
    const todays = schedules.filter((s) => s.weekday === wd)
    if (todays.length === 0) continue
    const slots: DaySlots["slots"] = []
    for (const s of todays) {
      const step = s.slot_minutes || slotMin
      for (let m = timeToMinutes(s.start_time); m + step <= timeToMinutes(s.end_time); m += step) {
        const start = minutesToTime(m)
        const slotDate = new Date(d)
        slotDate.setHours(Math.floor(m / 60), m % 60, 0, 0)
        const isPast = slotDate.getTime() < now.getTime() + 15 * 60 * 1000
        slots.push({ start, end: minutesToTime(m + step), available: !isPast && !takenSet.has(`${iso}|${start}`) })
      }
    }
    if (slots.length) result.push({ date: iso, weekday: wd, slots })
  }
  return result
}

export async function isSlotAvailable(doctor: Doctor, settings: ClinicSettings, date: string, start: string): Promise<{ ok: boolean; end?: string; error?: string }> {
  const days = await getDoctorAvailability(doctor, settings)
  const day = days.find((d) => d.date === date)
  if (!day) return { ok: false, error: "پزشک در این تاریخ نوبت ندارد" }
  const slot = day.slots.find((s) => s.start === start)
  if (!slot) return { ok: false, error: "ساعت انتخاب‌شده معتبر نیست" }
  if (!slot.available) return { ok: false, error: "این نوبت قبلاً رزرو شده است" }
  return { ok: true, end: slot.end }
}

function appointmentNumber(storeSlug: string) {
  const d = new Date()
  const stamp = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `AP-${storeSlug.slice(0, 4).toUpperCase()}-${stamp}-${rand}`
}

export async function createAppointment(data: {
  store_id: number
  store_slug: string
  doctor_id: number
  patient_name: string
  patient_phone: string
  patient_national_id?: string | null
  symptoms?: string | null
  notes?: string | null
  ai_triage?: Record<string, any> | null
  appointment_date: string
  start_time: string
  end_time: string
  fee: number
  payment_method: string | null
  status: string
}): Promise<Appointment> {
  const sql = getSql()
  const r = await sql`
    INSERT INTO appointments (store_id, doctor_id, appointment_number, patient_name, patient_phone, patient_national_id, symptoms, notes, ai_triage,
      appointment_date, start_time, end_time, status, fee, payment_method, payment_status)
    VALUES (${data.store_id}, ${data.doctor_id}, ${appointmentNumber(data.store_slug)}, ${data.patient_name}, ${data.patient_phone}, ${data.patient_national_id || null},
      ${data.symptoms || null}, ${data.notes || null}, ${data.ai_triage ? JSON.stringify(data.ai_triage) : null},
      ${data.appointment_date}, ${data.start_time}, ${data.end_time}, ${data.status}, ${data.fee}, ${data.payment_method}, ${data.fee > 0 && data.status === "pending_payment" ? "pending" : "not_required"})
    RETURNING *
  `
  return r[0] as unknown as Appointment
}

export async function getAppointmentByNumber(storeId: number, number: string): Promise<Appointment | null> {
  try {
    const sql = getSql()
    const r = await sql`SELECT * FROM appointments WHERE store_id = ${storeId} AND appointment_number = ${number}`
    return (r[0] as unknown as Appointment) || null
  } catch {
    return null
  }
}

export async function markAppointmentPaid(id: number, ref: string, method: string) {
  const sql = getSql()
  await sql`UPDATE appointments SET status = 'confirmed', payment_status = 'paid', payment_ref = ${ref}, payment_method = ${method}, updated_at = NOW() WHERE id = ${id}`
}

export async function markAppointmentFailed(id: number) {
  const sql = getSql()
  await sql`UPDATE appointments SET status = 'cancelled', payment_status = 'failed', updated_at = NOW() WHERE id = ${id}`
}

export async function attachAppointmentReceipt(id: number, url: string) {
  const sql = getSql()
  await sql`UPDATE appointments SET receipt_image_url = ${url}, payment_status = 'awaiting_review', updated_at = NOW() WHERE id = ${id}`
}

export function nextDateForWeekday(weekday: number): Date {
  const d = new Date()
  const cur = persianWeekday(d)
  d.setDate(d.getDate() + ((weekday - cur + 7) % 7))
  return d
}

export { parseISODate }
