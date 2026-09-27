-- Store analytics: visitor/page-view/explorer-play tracking for the My Store stats tab.
-- Idempotent: safe to re-run. Managed from platform-talksell.ir (query side); written at
-- runtime by the storefront app (v8-storefront) against the same DATABASE_URL, same
-- pattern as explorer_post_likes/explorer_post_comments in create-explorer.sql.

CREATE TABLE IF NOT EXISTS store_analytics_events (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL, -- 'page_view' | 'explorer_play'
  visitor_token VARCHAR(64) NOT NULL,
  path TEXT,
  target_id INTEGER, -- explorer_posts.id when event_type = 'explorer_play'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_store_analytics_events_store_id ON store_analytics_events(store_id);
CREATE INDEX IF NOT EXISTS idx_store_analytics_events_created_at ON store_analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_store_analytics_events_type ON store_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_store_analytics_events_store_created ON store_analytics_events(store_id, created_at);
