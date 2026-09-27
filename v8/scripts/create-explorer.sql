-- Phase 5: Explorer (Instagram-Reels-style shoppable video feed)
-- Idempotent: safe to re-run. explorer_posts/explorer_post_products are managed from
-- platform-talksell.ir (this app); explorer_post_likes/explorer_post_comments are
-- written at runtime by the separate storefront app against the same DATABASE_URL.

CREATE TABLE IF NOT EXISTS explorer_posts (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_explorer_posts_store_id ON explorer_posts(store_id);
CREATE INDEX IF NOT EXISTS idx_explorer_posts_status ON explorer_posts(status);

CREATE TABLE IF NOT EXISTS explorer_post_products (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES explorer_posts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (post_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_explorer_post_products_post_id ON explorer_post_products(post_id);

CREATE TABLE IF NOT EXISTS explorer_post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES explorer_posts(id) ON DELETE CASCADE,
  session_token VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (post_id, session_token)
);

CREATE INDEX IF NOT EXISTS idx_explorer_post_likes_post_id ON explorer_post_likes(post_id);

CREATE TABLE IF NOT EXISTS explorer_post_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES explorer_posts(id) ON DELETE CASCADE,
  author_name VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_explorer_post_comments_post_id ON explorer_post_comments(post_id);
