-- Phase 7: Per-store Bale bot configuration
-- Idempotent: safe to re-run. Read by the separate Bale bot Python service (see
-- bale-bot-service/) via a platform-secret-authenticated API, never connected to
-- directly from that service.

CREATE TABLE IF NOT EXISTS bale_bot_configs (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  bot_token TEXT,
  bot_username VARCHAR(100),
  extra_env JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'inactive',
  last_error TEXT,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bale_bot_configs_status ON bale_bot_configs(status);
