import crypto from "node:crypto"
import { getSql } from "@/lib/db"

// Write layer for OTP verification during checkout, plus a read-only fetch of the
// store's SMS provider settings (store_sms_settings is owned/managed from
// platform-talksell.ir, same as store_payment_settings).

export interface StoreSmsSettings {
  provider: "sms_ir" | "melipayamak"
  otp_enabled: boolean
  sms_ir_api_key: string | null
  sms_ir_template_id: string | null
  melipayamak_username: string | null
  melipayamak_password: string | null
  melipayamak_body_id: string | null
}

export async function getStoreSmsSettings(storeId: number): Promise<StoreSmsSettings | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM store_sms_settings WHERE store_id = ${storeId}`
  return result.length > 0 ? (result[0] as unknown as StoreSmsSettings) : null
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex")
}

function generateCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000)) // 5 digits
}

export async function createOtpCode(storeId: number, phone: string): Promise<string> {
  const sql = getSql()
  const code = generateCode()
  await sql`
    INSERT INTO otp_codes (store_id, phone, code_hash, expires_at)
    VALUES (${storeId}, ${phone}, ${hashCode(code)}, NOW() + INTERVAL '2 minutes')
  `
  return code
}

export async function verifyOtpCode(storeId: number, phone: string, code: string): Promise<string | null> {
  const sql = getSql()
  const result = await sql`
    SELECT id FROM otp_codes
    WHERE store_id = ${storeId} AND phone = ${phone} AND code_hash = ${hashCode(code)}
      AND expires_at > NOW() AND verified = FALSE
    ORDER BY created_at DESC
    LIMIT 1
  `
  if (result.length === 0) return null

  const verifyToken = crypto.randomBytes(24).toString("hex")
  await sql`UPDATE otp_codes SET verified = TRUE, verify_token = ${verifyToken} WHERE id = ${result[0].id}`
  return verifyToken
}

export async function consumeOtpVerification(storeId: number, phone: string, verifyToken: string): Promise<boolean> {
  const sql = getSql()
  const result = await sql`
    UPDATE otp_codes SET consumed_at = NOW()
    WHERE store_id = ${storeId} AND phone = ${phone} AND verify_token = ${verifyToken}
      AND verified = TRUE AND consumed_at IS NULL AND expires_at > NOW()
    RETURNING id
  `
  return result.length > 0
}
