-- Adds category images (for the category manager + theme seed data) and a "page"
-- column to landing_page_blocks so the drag-and-drop builder can serve more than
-- just the home page (about/contact). Idempotent, additive only.

ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE landing_page_blocks ADD COLUMN IF NOT EXISTS page VARCHAR(20) NOT NULL DEFAULT 'home';
CREATE INDEX IF NOT EXISTS idx_landing_page_blocks_store_page ON landing_page_blocks(store_id, page);
