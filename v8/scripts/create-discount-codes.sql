-- Phase 6: Marketing-assistant-generated discount codes
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS discount_codes (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  percentage INTEGER NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (store_id, code)
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_store_id ON discount_codes(store_id);
