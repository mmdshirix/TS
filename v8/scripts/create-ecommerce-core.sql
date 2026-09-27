-- Phase 1: Store foundations (stores, products, categories, images, variants, checkout fields)
-- Idempotent: safe to re-run. Does not modify any chatbot_* tables' existing rows/behavior.

CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  theme_id VARCHAR(100),
  favicon_url TEXT,
  logo_url TEXT,
  color_scheme JSONB DEFAULT '{}'::jsonb,
  contact_phone VARCHAR(50),
  contact_address TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);

CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_store_id ON product_categories(store_id);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'physical',
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(12, 2),
  description TEXT,
  sku VARCHAR(100),
  inventory_count INTEGER,
  digital_download_url TEXT,
  video_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  rating_avg DECIMAL(3, 2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price_override DECIMAL(12, 2),
  inventory_count INTEGER
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

CREATE TABLE IF NOT EXISTS checkout_field_settings (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  field_key VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (store_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_checkout_field_settings_store_id ON checkout_field_settings(store_id);

-- Mirror link: which store product a given chatbot_products row was synced from.
-- Existing rows (created by the chatbot builder itself) keep this NULL and are untouched.
ALTER TABLE chatbot_products ADD COLUMN IF NOT EXISTS source_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_chatbot_products_source_product_id ON chatbot_products(source_product_id);
