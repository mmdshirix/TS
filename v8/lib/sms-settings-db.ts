import { getSql } from "@/lib/db"

export interface StoreSmsSettings {
  id: number
  store_id: number
  provider: "sms_ir" | "melipayamak"
  otp_enabled: boolean
  sms_ir_api_key: string | null
  sms_ir_template_id: string | null
  melipayamak_username: string | null
  melipayamak_password: string | null
  melipayamak_body_id: string | null
}

export async function getSmsSettings(storeId: number): Promise<StoreSmsSettings | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM store_sms_settings WHERE store_id = ${storeId}`
  return result.length > 0 ? (result[0] as unknown as StoreSmsSettings) : null
}

export async function upsertSmsSettings(
  storeId: number,
  updates: Partial<
    Pick<
      StoreSmsSettings,
      | "provider"
      | "otp_enabled"
      | "sms_ir_api_key"
      | "sms_ir_template_id"
      | "melipayamak_username"
      | "melipayamak_password"
      | "melipayamak_body_id"
    >
  >,
): Promise<StoreSmsSettings> {
  const sql = getSql()
  const existing = await getSmsSettings(storeId)

  const merged = {
    provider: updates.provider ?? existing?.provider ?? "sms_ir",
    otp_enabled: updates.otp_enabled ?? existing?.otp_enabled ?? false,
    sms_ir_api_key: updates.sms_ir_api_key !== undefined ? updates.sms_ir_api_key : (existing?.sms_ir_api_key ?? null),
    sms_ir_template_id:
      updates.sms_ir_template_id !== undefined ? updates.sms_ir_template_id : (existing?.sms_ir_template_id ?? null),
    melipayamak_username:
      updates.melipayamak_username !== undefined ? updates.melipayamak_username : (existing?.melipayamak_username ?? null),
    melipayamak_password:
      updates.melipayamak_password !== undefined ? updates.melipayamak_password : (existing?.melipayamak_password ?? null),
    melipayamak_body_id:
      updates.melipayamak_body_id !== undefined ? updates.melipayamak_body_id : (existing?.melipayamak_body_id ?? null),
  }

  const result = await sql`
    INSERT INTO store_sms_settings (
      store_id, provider, otp_enabled, sms_ir_api_key, sms_ir_template_id,
      melipayamak_username, melipayamak_password, melipayamak_body_id
    ) VALUES (
      ${storeId}, ${merged.provider}, ${merged.otp_enabled},
      ${merged.sms_ir_api_key}, ${merged.sms_ir_template_id},
      ${merged.melipayamak_username}, ${merged.melipayamak_password}, ${merged.melipayamak_body_id}
    )
    ON CONFLICT (store_id) DO UPDATE SET
      provider = EXCLUDED.provider,
      otp_enabled = EXCLUDED.otp_enabled,
      sms_ir_api_key = EXCLUDED.sms_ir_api_key,
      sms_ir_template_id = EXCLUDED.sms_ir_template_id,
      melipayamak_username = EXCLUDED.melipayamak_username,
      melipayamak_password = EXCLUDED.melipayamak_password,
      melipayamak_body_id = EXCLUDED.melipayamak_body_id,
      updated_at = NOW()
    RETURNING *
  `
  return result[0] as unknown as StoreSmsSettings
}
