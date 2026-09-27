-- Phase 8: Store-configurable SMS OTP (SMS.ir / MeliPayamak)
-- Idempotent: safe to re-run. store_sms_settings is managed from platform-talksell.ir
-- (this app); otp_codes is written at runtime by the separate storefront app during
-- checkout, against the same DATABASE_URL.

CREATE TABLE IF NOT EXISTS store_sms_settings (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL DEFAULT 'sms_ir',
  otp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  sms_ir_api_key TEXT,
  sms_ir_template_id VARCHAR(50),
  melipayamak_username VARCHAR(100),
  melipayamak_password TEXT,
  melipayamak_body_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  code_hash TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verify_token VARCHAR(64),
  consumed_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_store_phone ON otp_codes(store_id, phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_verify_token ON otp_codes(verify_token);
