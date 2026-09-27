import { getSql } from "@/lib/db"

export interface BaleBotConfig {
  id: number
  store_id: number
  bot_token: string | null
  bot_username: string | null
  extra_env: Record<string, string>
  status: "inactive" | "pending" | "active" | "error"
  last_error: string | null
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export async function getBaleBotConfig(storeId: number): Promise<BaleBotConfig | null> {
  const sql = getSql()
  const result = await sql`SELECT * FROM bale_bot_configs WHERE store_id = ${storeId}`
  return result.length > 0 ? (result[0] as unknown as BaleBotConfig) : null
}

export async function upsertBaleBotConfig(
  storeId: number,
  data: { bot_token: string; bot_username?: string | null; extra_env?: Record<string, string> },
): Promise<BaleBotConfig> {
  const sql = getSql()
  const result = await sql`
    INSERT INTO bale_bot_configs (store_id, bot_token, bot_username, extra_env, status)
    VALUES (${storeId}, ${data.bot_token}, ${data.bot_username || null}, ${JSON.stringify(data.extra_env || {})}, 'pending')
    ON CONFLICT (store_id) DO UPDATE SET
      bot_token = EXCLUDED.bot_token,
      bot_username = EXCLUDED.bot_username,
      extra_env = EXCLUDED.extra_env,
      status = 'pending',
      last_error = NULL,
      updated_at = NOW()
    RETURNING *
  `
  return result[0] as unknown as BaleBotConfig
}

export async function disableBaleBotConfig(storeId: number): Promise<void> {
  const sql = getSql()
  await sql`UPDATE bale_bot_configs SET status = 'inactive', updated_at = NOW() WHERE store_id = ${storeId}`
}

// --- Machine-facing (used by the separate Bale bot Python service) ---

export interface BaleBotProvisionEntry extends BaleBotConfig {
  chatbot_id: number | null
}

export async function listPendingBaleBotConfigs(): Promise<BaleBotProvisionEntry[]> {
  const sql = getSql()
  const result = await sql`
    SELECT c.*, s.chatbot_id FROM bale_bot_configs c
    JOIN stores s ON c.store_id = s.id
    WHERE c.status IN ('pending', 'active') AND c.bot_token IS NOT NULL
  `
  return result as unknown as BaleBotProvisionEntry[]
}

export async function reportBaleBotStatus(storeId: number, status: "active" | "error", errorMessage?: string): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE bale_bot_configs SET
      status = ${status},
      last_error = ${errorMessage || null},
      last_synced_at = NOW(),
      updated_at = NOW()
    WHERE store_id = ${storeId}
  `
}
