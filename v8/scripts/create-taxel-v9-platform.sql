-- Taxel v9 platform expansion. Idempotent — safe to re-run.
-- Covers: AI settings defaults, SEO, medical clinics, pharmacies, onboarding,
-- WordPress intake (site-builder plugin), Instagram DM automation.

-- ---------------------------------------------------------------------------
-- Core additions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Arvan is the platform default; DeepSeek remains selectable from the super-admin panel.
INSERT INTO global_settings (setting_key, setting_value)
VALUES ('ai_provider', 'arvan')
ON CONFLICT (setting_key) DO NOTHING;

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'user';

ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(50);
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS arvan_api_key TEXT;

ALTER TABLE stores ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS template_id VARCHAR(50);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{}'::jsonb;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255);

ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;

ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ---------------------------------------------------------------------------
-- SEO
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_seo_settings (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT,
  og_image_url TEXT,
  canonical_domain VARCHAR(255),
  robots_index BOOLEAN NOT NULL DEFAULT TRUE,
  robots_follow BOOLEAN NOT NULL DEFAULT TRUE,
  google_site_verification VARCHAR(255),
  google_analytics_id VARCHAR(50),
  twitter_handle VARCHAR(100),
  structured_data_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sitemap_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  business_type VARCHAR(50),
  locale VARCHAR(10) DEFAULT 'fa_IR',
  page_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  head_scripts TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Medical clinic template
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinic_settings (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  booking_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  fee_required BOOLEAN NOT NULL DEFAULT TRUE,
  default_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  slot_minutes INTEGER NOT NULL DEFAULT 20,
  booking_horizon_days INTEGER NOT NULL DEFAULT 30,
  cancellation_policy TEXT,
  ai_triage_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ai_welcome TEXT,
  emergency_note TEXT,
  insurance_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinic_doctors (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  specialty VARCHAR(120) NOT NULL,
  specialty_slug VARCHAR(120),
  bio TEXT,
  photo_url TEXT,
  medical_council_no VARCHAR(50),
  consultation_fee DECIMAL(12,2),
  visit_duration_min INTEGER NOT NULL DEFAULT 20,
  keywords TEXT,
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (store_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_clinic_doctors_store ON clinic_doctors(store_id);

-- weekday: 0 = Saturday … 6 = Friday (Persian week)
CREATE TABLE IF NOT EXISTS clinic_schedules (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES clinic_doctors(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_minutes INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_clinic_schedules_doctor ON clinic_schedules(doctor_id);

CREATE TABLE IF NOT EXISTS clinic_time_off (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES clinic_doctors(id) ON DELETE CASCADE,
  off_date DATE NOT NULL,
  reason VARCHAR(255),
  UNIQUE (doctor_id, off_date)
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES clinic_doctors(id) ON DELETE SET NULL,
  appointment_number VARCHAR(30) NOT NULL UNIQUE,
  patient_name VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(30) NOT NULL,
  patient_national_id VARCHAR(20),
  patient_birth_year INTEGER,
  symptoms TEXT,
  notes TEXT,
  ai_triage JSONB,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
  fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(20),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_ref TEXT,
  receipt_image_url TEXT,
  source VARCHAR(30) DEFAULT 'web',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_appointments_store_date ON appointments(store_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE UNIQUE INDEX IF NOT EXISTS uq_appointments_slot
  ON appointments(doctor_id, appointment_date, start_time)
  WHERE status IN ('pending_payment', 'confirmed');

-- payment_transactions can now belong to an appointment instead of an order
ALTER TABLE payment_transactions ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payment_transactions_appointment ON payment_transactions(appointment_id);

-- ---------------------------------------------------------------------------
-- Pharmacy template
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pharmacy_settings (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  accepts_prescriptions BOOLEAN NOT NULL DEFAULT TRUE,
  is_24h BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_radius_km INTEGER,
  consult_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  pharmacist_name VARCHAR(255),
  license_no VARCHAR(100),
  insurance_types JSONB NOT NULL DEFAULT '["تامین اجتماعی","خدمات درمانی","نیروهای مسلح","آزاد"]'::jsonb,
  ai_advisor_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  emergency_phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescription_requests (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  request_number VARCHAR(30) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  national_id VARCHAR(20),
  insurance_type VARCHAR(100),
  delivery_method VARCHAR(20) NOT NULL DEFAULT 'pickup',
  address TEXT,
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'received',
  pharmacist_note TEXT,
  total_amount DECIMAL(12,2),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_prescription_requests_store ON prescription_requests(store_id, status);

-- ---------------------------------------------------------------------------
-- Dashboard onboarding
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_onboarding (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tour_completed BOOLEAN NOT NULL DEFAULT FALSE,
  tour_completed_at TIMESTAMP,
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  dismissed_checklist BOOLEAN NOT NULL DEFAULT FALSE,
  intent JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- WordPress "Just tell me what to build" intake
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS intake_api_keys (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(80) NOT NULL UNIQUE,
  site_url VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intake_requests (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) NOT NULL UNIQUE,
  api_key_id INTEGER REFERENCES intake_api_keys(id) ON DELETE SET NULL,
  source VARCHAR(30) NOT NULL DEFAULT 'wordpress',
  source_site VARCHAR(255),
  source_page_url TEXT,
  prompt TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  detected JSONB NOT NULL DEFAULT '{}'::jsonb,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_stage INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  visitor_id VARCHAR(80),
  visitor_ip VARCHAR(64),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_intake_requests_status ON intake_requests(status);

-- ---------------------------------------------------------------------------
-- Instagram DM automation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  page_name VARCHAR(255) NOT NULL,
  ig_username VARCHAR(255),
  ig_user_id VARCHAR(64),
  fb_page_id VARCHAR(64),
  access_token TEXT,
  token_expires_at TIMESTAMP,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  status_message TEXT,
  ai_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ai_tone VARCHAR(50) DEFAULT 'friendly',
  ai_handoff_keywords TEXT,
  greeting_message TEXT,
  away_message TEXT,
  daily_message_count INTEGER NOT NULL DEFAULT 0,
  total_message_count INTEGER NOT NULL DEFAULT 0,
  connected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_ig_user ON instagram_accounts(ig_user_id);

CREATE TABLE IF NOT EXISTS dm_workflows (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(30) NOT NULL DEFAULT 'keyword',
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  match_mode VARCHAR(20) NOT NULL DEFAULT 'contains',
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 0,
  hits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dm_workflows_store ON dm_workflows(store_id, enabled);

CREATE TABLE IF NOT EXISTS dm_conversations (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  ig_sender_id VARCHAR(64) NOT NULL,
  sender_name VARCHAR(255),
  sender_username VARCHAR(255),
  ai_paused BOOLEAN NOT NULL DEFAULT FALSE,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (store_id, ig_sender_id)
);

CREATE TABLE IF NOT EXISTS dm_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
  direction VARCHAR(5) NOT NULL,
  kind VARCHAR(20) NOT NULL DEFAULT 'text',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  workflow_id INTEGER REFERENCES dm_workflows(id) ON DELETE SET NULL,
  ig_message_id VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dm_messages_conversation ON dm_messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS instagram_webhook_events (
  id SERIAL PRIMARY KEY,
  object_type VARCHAR(50),
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
