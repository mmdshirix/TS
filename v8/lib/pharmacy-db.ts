import { getSql } from "@/lib/db"

export interface PharmacySettings {
  store_id: number
  accepts_prescriptions: boolean
  is_24h: boolean
  delivery_enabled: boolean
  delivery_fee: number
  delivery_radius_km: number | null
  consult_enabled: boolean
  pharmacist_name: string | null
  license_no: string | null
  insurance_types: string[]
  ai_advisor_enabled: boolean
  emergency_phone: string | null
}

export interface PrescriptionRequest {
  id: number
  store_id: number
  request_number: string
  customer_name: string
  customer_phone: string
  national_id: string | null
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

export { PRESCRIPTION_STATUSES } from "@/lib/shared/pharmacy-constants"
import { PRESCRIPTION_STATUSES } from "@/lib/shared/pharmacy-constants"

export async function getPharmacySettings(storeId: number): Promise<PharmacySettings> {
  const sql = getSql()
  const r = await sql`SELECT * FROM pharmacy_settings WHERE store_id = ${storeId}`
  const defaults: PharmacySettings = {
    store_id: storeId,
    accepts_prescriptions: true,
    is_24h: false,
    delivery_enabled: true,
    delivery_fee: 0,
    delivery_radius_km: null,
    consult_enabled: true,
    pharmacist_name: null,
    license_no: null,
    insurance_types: ["تامین اجتماعی", "خدمات درمانی", "نیروهای مسلح", "آزاد"],
    ai_advisor_enabled: true,
    emergency_phone: null,
  }
  if (!r.length) return defaults
  const row = r[0] as any
  return { ...defaults, ...row, delivery_fee: Number(row.delivery_fee || 0), insurance_types: Array.isArray(row.insurance_types) ? row.insurance_types : defaults.insurance_types }
}

export async function upsertPharmacySettings(storeId: number, data: Partial<PharmacySettings>): Promise<PharmacySettings> {
  const sql = getSql()
  const merged = { ...(await getPharmacySettings(storeId)), ...data }
  await sql`
    INSERT INTO pharmacy_settings (store_id, accepts_prescriptions, is_24h, delivery_enabled, delivery_fee, delivery_radius_km, consult_enabled, pharmacist_name, license_no, insurance_types, ai_advisor_enabled, emergency_phone, updated_at)
    VALUES (${storeId}, ${merged.accepts_prescriptions}, ${merged.is_24h}, ${merged.delivery_enabled}, ${merged.delivery_fee}, ${merged.delivery_radius_km}, ${merged.consult_enabled}, ${merged.pharmacist_name}, ${merged.license_no}, ${JSON.stringify(merged.insurance_types)}, ${merged.ai_advisor_enabled}, ${merged.emergency_phone}, NOW())
    ON CONFLICT (store_id) DO UPDATE SET
      accepts_prescriptions = EXCLUDED.accepts_prescriptions, is_24h = EXCLUDED.is_24h, delivery_enabled = EXCLUDED.delivery_enabled, delivery_fee = EXCLUDED.delivery_fee,
      delivery_radius_km = EXCLUDED.delivery_radius_km, consult_enabled = EXCLUDED.consult_enabled, pharmacist_name = EXCLUDED.pharmacist_name, license_no = EXCLUDED.license_no,
      insurance_types = EXCLUDED.insurance_types, ai_advisor_enabled = EXCLUDED.ai_advisor_enabled, emergency_phone = EXCLUDED.emergency_phone, updated_at = NOW()
  `
  return getPharmacySettings(storeId)
}

export async function listPrescriptions(storeId: number, status?: string): Promise<PrescriptionRequest[]> {
  const sql = getSql()
  const r = await sql`
    SELECT * FROM prescription_requests WHERE store_id = ${storeId} AND (${status ?? null}::text IS NULL OR status = ${status ?? null})
    ORDER BY created_at DESC LIMIT 300
  `
  return r as unknown as PrescriptionRequest[]
}

export async function updatePrescription(storeId: number, id: number, data: { status?: string; pharmacist_note?: string | null; total_amount?: number | null; payment_status?: string }): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE prescription_requests SET
      status = COALESCE(${data.status ?? null}, status),
      pharmacist_note = COALESCE(${data.pharmacist_note ?? null}, pharmacist_note),
      total_amount = COALESCE(${data.total_amount ?? null}, total_amount),
      payment_status = COALESCE(${data.payment_status ?? null}, payment_status),
      updated_at = NOW()
    WHERE id = ${id} AND store_id = ${storeId}
  `
}

export async function pharmacyStats(storeId: number) {
  const sql = getSql()
  const r = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'received')::int AS new_requests,
      COUNT(*) FILTER (WHERE status = 'reviewing')::int AS reviewing,
      COUNT(*) FILTER (WHERE status = 'ready')::int AS ready,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')::int AS last30
    FROM prescription_requests WHERE store_id = ${storeId}
  `
  return r[0] as any
}

export async function seedPharmacyDefaults(storeId: number): Promise<void> {
  const sql = getSql()
  const existing = await sql`SELECT id FROM pharmacy_settings WHERE store_id = ${storeId}`
  if (existing.length) return
  await upsertPharmacySettings(storeId, { is_24h: false, delivery_enabled: true, delivery_fee: 30000, accepts_prescriptions: true })
}
