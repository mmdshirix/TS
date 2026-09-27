-- Phase 4: Cart, checkout, orders & payment gateways
-- Idempotent: safe to re-run. Written by both platform-talksell.ir (settings/order management)
-- and the separate storefront app (cart/checkout, at runtime) against the same DATABASE_URL.

CREATE TABLE IF NOT EXISTS store_payment_settings (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  zarinpal_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  zarinpal_merchant_id VARCHAR(100),
  balepay_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  balepay_bot_token TEXT,
  card_to_card_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  card_number VARCHAR(19),
  card_iban VARCHAR(34),
  card_holder_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  session_token VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_carts_session_token ON carts(session_token);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (cart_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  cart_id INTEGER REFERENCES carts(id) ON DELETE SET NULL,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  customer_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending_payment',
  payment_method VARCHAR(20),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(255),
  price DECIMAL(12, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway VARCHAR(20) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'initiated',
  gateway_ref TEXT,
  receipt_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
