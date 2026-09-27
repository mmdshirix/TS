-- Phase 2: Drag-and-drop landing page builder storage
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS landing_page_blocks (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_landing_page_blocks_store_id ON landing_page_blocks(store_id);
