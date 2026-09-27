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

const DEFAULTS: Omit<PharmacySettings, "store_id"> = {
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

export async function getPharmacySettings(storeId: number): Promise<PharmacySettings> {
  try {
    const sql = getSql()
    const r = await sql`SELECT * FROM pharmacy_settings WHERE store_id = ${storeId}`
    if (r.length === 0) return { store_id: storeId, ...DEFAULTS }
    const row = r[0] as any
    return { ...DEFAULTS, ...row, delivery_fee: Number(row.delivery_fee || 0), insurance_types: Array.isArray(row.insurance_types) ? row.insurance_types : DEFAULTS.insurance_types }
  } catch {
    return { store_id: storeId, ...DEFAULTS }
  }
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

export async function createPrescriptionRequest(data: {
  store_id: number
  store_slug: string
  customer_name: string
  customer_phone: string
  national_id?: string | null
  insurance_type?: string | null
  delivery_method: "pickup" | "delivery"
  address?: string | null
  image_urls: string[]
  notes?: string | null
}): Promise<PrescriptionRequest> {
  const sql = getSql()
  const number = `RX-${data.store_slug.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  const r = await sql`
    INSERT INTO prescription_requests (store_id, request_number, customer_name, customer_phone, national_id, insurance_type, delivery_method, address, image_urls, notes)
    VALUES (${data.store_id}, ${number}, ${data.customer_name}, ${data.customer_phone}, ${data.national_id || null}, ${data.insurance_type || null},
      ${data.delivery_method}, ${data.address || null}, ${JSON.stringify(data.image_urls)}, ${data.notes || null})
    RETURNING *
  `
  return r[0] as unknown as PrescriptionRequest
}

export async function getPrescriptionByNumber(storeId: number, number: string): Promise<PrescriptionRequest | null> {
  try {
    const sql = getSql()
    const r = await sql`SELECT * FROM prescription_requests WHERE store_id = ${storeId} AND request_number = ${number}`
    return (r[0] as unknown as PrescriptionRequest) || null
  } catch {
    return null
  }
}

export const PRESCRIPTION_STATUS_LABELS: Record<string, string> = {
  received: "دریافت شد",
  reviewing: "در حال بررسی داروساز",
  ready: "آماده تحویل",
  delivering: "در حال ارسال",
  delivered: "تحویل شد",
  rejected: "نیاز به اصلاح نسخه",
}
