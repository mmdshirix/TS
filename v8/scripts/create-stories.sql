-- Stories (Instagram-style story bar shown at the top of the storefront)
-- Idempotent: safe to re-run. Does not modify any chatbot_* tables' existing rows/behavior.

CREATE TABLE IF NOT EXISTS store_stories (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  cover_image_url TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) NOT NULL DEFAULT 'image',
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_store_stories_store_id ON store_stories(store_id);
