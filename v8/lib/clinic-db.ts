import { getSql } from "@/lib/db"

// Platform-side (dashboard) data layer for the medical clinic template.
// The storefront reads the same tables (v8-storefront/lib/clinic-db.ts).

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
  is_active: boolean
  sort_order: number
  schedules?: Schedule[]
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
  doctor_name?: string | null
  appointment_number: string
  patient_name: string
  patient_phone: string
  patient_national_id: string | null
  symptoms: string | null
  notes: string | null
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

export { SPECIALTIES } from "@/lib/shared/clinic-constants"

function slugify(input: string) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9؀-ۿ]+/g, "-")
      .replace(/^-+|-+$/g, "") || `dr-${Date.now().toString(36)}`
  )
}

export async function getClinicSettings(storeId: number): Promise<ClinicSettings> {
  const sql = getSql()
  const r = await sql`SELECT * FROM clinic_settings WHERE store_id = ${storeId}`
  if (r.length === 0) {
    return {
      store_id: storeId,
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
  }
  const row = r[0] as any
  return { ...row, default_fee: Number(row.default_fee || 0), insurance_types: Array.isArray(row.insurance_types) ? row.insurance_types : [] }
}

export async function upsertClinicSettings(storeId: number, data: Partial<ClinicSettings>): Promise<ClinicSettings> {
  const sql = getSql()
  const current = await getClinicSettings(storeId)
  const merged = { ...current, ...data }
  await sql`
    INSERT INTO clinic_settings (store_id, booking_enabled, fee_required, default_fee, slot_minutes, booking_horizon_days, cancellation_policy, ai_triage_enabled, ai_welcome, emergency_note, insurance_types, updated_at)
    VALUES (${storeId}, ${merged.booking_enabled}, ${merged.fee_required}, ${merged.default_fee}, ${merged.slot_minutes}, ${merged.booking_horizon_days}, ${merged.cancellation_policy}, ${merged.ai_triage_enabled}, ${merged.ai_welcome}, ${merged.emergency_note}, ${JSON.stringify(merged.insurance_types || [])}, NOW())
    ON CONFLICT (store_id) DO UPDATE SET
      booking_enabled = EXCLUDED.booking_enabled, fee_required = EXCLUDED.fee_required, default_fee = EXCLUDED.default_fee,
      slot_minutes = EXCLUDED.slot_minutes, booking_horizon_days = EXCLUDED.booking_horizon_days, cancellation_policy = EXCLUDED.cancellation_policy,
      ai_triage_enabled = EXCLUDED.ai_triage_enabled, ai_welcome = EXCLUDED.ai_welcome, emergency_note = EXCLUDED.emergency_note,
      insurance_types = EXCLUDED.insurance_types, updated_at = NOW()
  `
  return getClinicSettings(storeId)
}

export async function listDoctors(storeId: number, includeInactive = true): Promise<Doctor[]> {
  const sql = getSql()
  const docs = (await sql`
    SELECT * FROM clinic_doctors WHERE store_id = ${storeId} ${includeInactive ? sql`` : sql`AND is_active = TRUE`} ORDER BY sort_order ASC, id ASC
  `) as unknown as Doctor[]
  if (docs.length === 0) return []
  const schedules = (await sql`SELECT * FROM clinic_schedules WHERE doctor_id IN ${sql(docs.map((d) => d.id))} ORDER BY weekday, start_time`) as unknown as Schedule[]
  return docs.map((d) => ({ ...d, schedules: schedules.filter((s) => s.doctor_id === d.id) }))
}

export async function getDoctor(storeId: number, id: number): Promise<Doctor | null> {
  const sql = getSql()
  const r = await sql`SELECT * FROM clinic_doctors WHERE store_id = ${storeId} AND id = ${id}`
  if (!r.length) return null
  const schedules = (await sql`SELECT * FROM clinic_schedules WHERE doctor_id = ${id} ORDER BY weekday, start_time`) as unknown as Schedule[]
  return { ...(r[0] as any), schedules }
}

export async function createDoctor(storeId: number, data: Partial<Doctor>): Promise<Doctor> {
  const sql = getSql()
  if (!data.name?.trim()) throw new Error("نام پزشک الزامی است")
  let slug = slugify(data.name)
  const exists = await sql`SELECT id FROM clinic_doctors WHERE store_id = ${storeId} AND slug = ${slug}`
  if (exists.length) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`
  const r = await sql`
    INSERT INTO clinic_doctors (store_id, name, slug, title, specialty, specialty_slug, bio, photo_url, medical_council_no, consultation_fee, visit_duration_min, keywords, is_active, sort_order)
    VALUES (${storeId}, ${data.name.trim()}, ${slug}, ${data.title || "دکتر"}, ${data.specialty || "پزشک عمومی"}, ${slugify(data.specialty || "پزشک عمومی")}, ${data.bio || null}, ${data.photo_url || null},
      ${data.medical_council_no || null}, ${data.consultation_fee ?? null}, ${data.visit_duration_min || 20}, ${data.keywords || null}, ${data.is_active ?? true}, ${data.sort_order || 0})
    RETURNING *
  `
  return { ...(r[0] as any), schedules: [] }
}

export async function updateDoctor(storeId: number, id: number, data: Partial<Doctor>): Promise<Doctor | null> {
  const sql = getSql()
  const cur = await getDoctor(storeId, id)
  if (!cur) return null
  await sql`
    UPDATE clinic_doctors SET
      name = ${data.name ?? cur.name}, title = ${data.title ?? cur.title}, specialty = ${data.specialty ?? cur.specialty},
      specialty_slug = ${slugify(data.specialty ?? cur.specialty)}, bio = ${data.bio ?? cur.bio}, photo_url = ${data.photo_url ?? cur.photo_url},
      medical_council_no = ${data.medical_council_no ?? cur.medical_council_no}, consultation_fee = ${data.consultation_fee === undefined ? cur.consultation_fee : data.consultation_fee},
      visit_duration_min = ${data.visit_duration_min ?? cur.visit_duration_min}, keywords = ${data.keywords ?? cur.keywords},
      is_active = ${data.is_active ?? cur.is_active}, sort_order = ${data.sort_order ?? cur.sort_order}, updated_at = NOW()
    WHERE id = ${id} AND store_id = ${storeId}
  `
  return getDoctor(storeId, id)
}

export async function deleteDoctor(storeId: number, id: number): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM clinic_doctors WHERE id = ${id} AND store_id = ${storeId}`
}

/** Replaces the whole weekly schedule of a doctor. */
export async function replaceSchedules(doctorId: number, schedules: Array<{ weekday: number; start_time: string; end_time: string; slot_minutes?: number | null }>): Promise<Schedule[]> {
  const sql = getSql()
  await sql`DELETE FROM clinic_schedules WHERE doctor_id = ${doctorId}`
  for (const s of schedules) {
    if (s.weekday < 0 || s.weekday > 6 || !s.start_time || !s.end_time || s.start_time >= s.end_time) continue
    await sql`INSERT INTO clinic_schedules (doctor_id, weekday, start_time, end_time, slot_minutes) VALUES (${doctorId}, ${s.weekday}, ${s.start_time}, ${s.end_time}, ${s.slot_minutes || null})`
  }
  return (await sql`SELECT * FROM clinic_schedules WHERE doctor_id = ${doctorId} ORDER BY weekday, start_time`) as unknown as Schedule[]
}

export async function listAppointments(storeId: number, opts: { status?: string; from?: string; to?: string; doctorId?: number; limit?: number } = {}): Promise<Appointment[]> {
  const sql = getSql()
  const r = await sql`
    SELECT a.*, a.appointment_date::text AS appointment_date, a.start_time::text AS start_time, a.end_time::text AS end_time, d.name AS doctor_name
    FROM appointments a LEFT JOIN clinic_doctors d ON d.id = a.doctor_id
    WHERE a.store_id = ${storeId}
      AND (${opts.status ?? null}::text IS NULL OR a.status = ${opts.status ?? null})
      AND (${opts.doctorId ?? null}::int IS NULL OR a.doctor_id = ${opts.doctorId ?? null})
      AND (${opts.from ?? null}::date IS NULL OR a.appointment_date >= ${opts.from ?? null})
      AND (${opts.to ?? null}::date IS NULL OR a.appointment_date <= ${opts.to ?? null})
    ORDER BY a.appointment_date DESC, a.start_time DESC
    LIMIT ${opts.limit || 200}
  `
  return r as unknown as Appointment[]
}

export async function updateAppointmentStatus(storeId: number, id: number, status: string, paymentStatus?: string): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE appointments SET status = ${status}, payment_status = COALESCE(${paymentStatus ?? null}, payment_status), updated_at = NOW()
    WHERE id = ${id} AND store_id = ${storeId}
  `
}

export async function clinicStats(storeId: number) {
  const sql = getSql()
  const r = await sql`
    SELECT
      COUNT(*) FILTER (WHERE appointment_date = CURRENT_DATE AND status IN ('confirmed','pending_payment'))::int AS today,
      COUNT(*) FILTER (WHERE status = 'pending_payment')::int AS pending,
      COUNT(*) FILTER (WHERE payment_status = 'awaiting_review')::int AS awaiting_review,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')::int AS last30,
      COALESCE(SUM(fee) FILTER (WHERE payment_status = 'paid' AND created_at > NOW() - INTERVAL '30 days'), 0)::numeric AS revenue30
    FROM appointments WHERE store_id = ${storeId}
  `
  return r[0] as any
}

/** Seeds a brand-new clinic store with a realistic sample so the landing isn't empty. */
export async function seedClinicDefaults(storeId: number): Promise<void> {
  const sql = getSql()
  const existing = await sql`SELECT id FROM clinic_doctors WHERE store_id = ${storeId} LIMIT 1`
  if (existing.length) return
  await upsertClinicSettings(storeId, {
    default_fee: 250000,
    slot_minutes: 20,
    insurance_types: ["تامین اجتماعی", "خدمات درمانی", "بیمه تکمیلی"],
    cancellation_policy: "امکان لغو نوبت تا ۱۲ ساعت قبل از زمان ویزیت با بازگشت کامل وجه وجود دارد.",
    emergency_note: "در موارد اورژانسی با ۱۱۵ تماس بگیرید.",
  })
  const samples = [
    { name: "سارا محمدی", specialty: "پزشک عمومی", bio: "ویزیت عمومی، چکاپ دوره‌ای و مشاوره سلامت خانواده.", keywords: "تب سرماخوردگی چکاپ بدن‌درد", fee: 250000, days: [0, 1, 2, 3, 4] },
    { name: "امیر رضایی", specialty: "قلب و عروق", bio: "متخصص قلب، اکوکاردیوگرافی و تست ورزش.", keywords: "تپش قلب فشار خون درد قفسه سینه", fee: 450000, days: [1, 3] },
    { name: "نگار کریمی", specialty: "پوست و مو", bio: "درمان آکنه، لک، ریزش مو و خدمات زیبایی.", keywords: "جوش لک ریزش مو خارش", fee: 400000, days: [0, 2, 4] },
  ]
  let order = 0
  for (const s of samples) {
    const doc = await createDoctor(storeId, { name: s.name, title: "دکتر", specialty: s.specialty, bio: s.bio, keywords: s.keywords, consultation_fee: s.fee, visit_duration_min: 20, sort_order: order++ })
    await replaceSchedules(doc.id, s.days.map((d) => ({ weekday: d, start_time: "16:00", end_time: "20:00" })))
  }
}
