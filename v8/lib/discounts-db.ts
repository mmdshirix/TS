import { getSql } from "@/lib/db"

export interface DiscountCode {
  id: number
  store_id: number
  code: string
  percentage: number
  description: string | null
  active: boolean
  expires_at: string | null
  created_at: string
}

export async function listDiscountCodes(storeId: number): Promise<DiscountCode[]> {
  const sql = getSql()
  const result = await sql`SELECT * FROM discount_codes WHERE store_id = ${storeId} ORDER BY created_at DESC`
  return result as unknown as DiscountCode[]
}

export async function createDiscountCode(data: {
  store_id: number
  code: string
  percentage: number
  description?: string | null
}): Promise<DiscountCode> {
  const sql = getSql()
  const code = data.code.trim().toUpperCase().replace(/\s+/g, "-")
  const result = await sql`
    INSERT INTO discount_codes (store_id, code, percentage, description)
    VALUES (${data.store_id}, ${code}, ${data.percentage}, ${data.description || null})
    ON CONFLICT (store_id, code) DO UPDATE SET percentage = EXCLUDED.percentage, description = EXCLUDED.description
    RETURNING *
  `
  return result[0] as unknown as DiscountCode
}
