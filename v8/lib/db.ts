import { getSharedSql } from "@/lib/postgres"
import { unstable_noStore as noStore } from "next/cache"

// Helper function to get SQL client - call this inside functions only
export function getSql() {
  return getSharedSql()
}

// Alias for backward compatibility
// export const sql = getSql() // Removed as per updates

// --- TYPE DEFINITIONS ---
export interface Chatbot {
  id: number
  name: string
  created_at: string
  updated_at: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  deepseek_api_key: string | null
  welcome_message: string
  navigation_message: string
  knowledge_base_text: string | null
  knowledge_base_url: string | null
  store_url: string | null
  ai_url: string | null
  stats_multiplier: number
  user_id?: number
  woocommerce_orders_enabled?: boolean
  woocommerce_api_url?: string
  is_active?: boolean
  business_info?: string | null
  theme_color?: string
  response_tone?: string
  ai_provider?: string
  arvan_api_key?: string | null
}

export interface ChatbotMessage {
  id: number
  chatbot_id: number
  user_message: string
  bot_response: string | null
  timestamp: string
  user_ip: string | null
  user_agent: string | null
}

export interface ChatbotFAQ {
  id: number
  chatbot_id: number
  question: string
  answer: string | null
  emoji: string | null
  position: number
}

export interface ChatbotProduct {
  id: number
  chatbot_id: number
  name: string
  description: string | null
  image_url: string | null
  price: number | null
  position: number
  button_text: string
  secondary_text: string
  product_url: string | null
}

export interface ChatbotOption {
  id: number
  chatbot_id: number
  label: string
  emoji: string | null
  position: number
}

export interface Ticket {
  id: number
  chatbot_id: number
  user_name: string
  user_email?: string
  user_phone: string | null
  user_ip: string | null
  user_agent: string | null
  subject: string
  message: string
  image_url: string | null
  status: "open" | "closed" | "pending"
  priority: "low" | "normal" | "high"
  created_at: string
  updated_at: string
}

export interface TicketResponse {
  id: number
  ticket_id: number
  message: string
  image_url?: string | null
  is_admin: boolean
  created_at: string
}

export interface AdminUser {
  id: number
  chatbot_id: number
  username: string
  password_hash: string
  full_name: string | null
  email: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  phone: string
  first_name: string
  last_name: string
  created_at: string
  tokens: number
  is_admin: boolean
  trial_start_date: string
  trial_end_date: string
  is_trial_active: boolean
  subscription_status: string
  last_login: string | null
  password_hash?: string | null // Added for authentication
}

export interface UserSession {
  id: number
  user_id: number
  session_token: string
  expires_at: string
  created_at: string
}

export interface ChatbotKnowledgeBase {
  id: number
  chatbot_id: number
  type: "url" | "text" | "product" | "faq" | "file" | "wordpress" | "api"
  title: string
  content: string
  source_url: string | null
  file_name?: string
  file_size?: number
  file_type?: string
  extracted_text?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: number
  name: string
  description: string | null
  price: number
  billing_period: string
  message_limit: number
  product_limit: number
  duration_days: number
  response_speed: string
  is_popular: boolean
  is_active: boolean
  position: number
  features: string[]
  icon_name: string
  color: string
  created_at: string
  updated_at: string
  // New fields
  messages_per_month?: number
  products_total?: number
  knowledge_base_links_total?: number
  tickets_per_month?: number
  chatbots_total?: number
}

export interface UserSubscription {
  id: number
  user_id: number
  plan_id: number
  started_at: string
  expires_at: string
  message_count: number
  is_active: boolean
  created_at: string
}

// --- DATABASE FUNCTIONS ---

// تست اتصال دیتابیس
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const sql = getSql()
    const result = await sql`SELECT 1 as test`
    return { success: true, message: "اتصال به دیتابیس NEON موفق" }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, message: `خطا در اتصال: ${error}` }
  }
}

// Database Initialization
export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Initializing NEON database tables...")
    const sql = getSql()

    await sql`
      CREATE TABLE IF NOT EXISTS chatbots (
        id SERIAL PRIMARY KEY, 
        name VARCHAR(255) NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        primary_color VARCHAR(50) DEFAULT '#14b8a6', 
        text_color VARCHAR(50) DEFAULT '#ffffff', 
        background_color VARCHAR(50) DEFAULT '#f3f4f6', 
        chat_icon TEXT DEFAULT '💬', 
        position VARCHAR(50) DEFAULT 'bottom-right', 
        deepseek_api_key TEXT, 
        welcome_message TEXT DEFAULT 'سلام! چطور می‌توانم به شما کمک کنم؟', 
        navigation_message TEXT DEFAULT 'چه چیزی شما را به اینجا آورده است؟', 
        knowledge_base_text TEXT, 
        knowledge_base_url TEXT, 
        store_url TEXT, 
        ai_url TEXT, 
        stats_multiplier NUMERIC(5, 2) DEFAULT 1.0,
        woocommerce_orders_enabled BOOLEAN DEFAULT FALSE,
        woocommerce_api_url TEXT,
        -- New columns for chatbot settings
        business_info TEXT,
        theme_color VARCHAR(50) DEFAULT '#14b8a6',
        -- Added response_tone column
        response_tone VARCHAR(100),
        -- Added is_active column
        is_active BOOLEAN DEFAULT TRUE
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL UNIQUE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tokens INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT FALSE
      )
    `

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
          ALTER TABLE users ADD COLUMN password_hash TEXT;
        END IF;
      END $$
    `

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='trial_start_date') THEN
          ALTER TABLE users ADD COLUMN trial_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$
    `

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='trial_end_date') THEN
          ALTER TABLE users ADD COLUMN trial_end_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days');
        END IF;
      END $$
    `

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_trial_active') THEN
          ALTER TABLE users ADD COLUMN is_trial_active BOOLEAN DEFAULT TRUE;
        END IF;
      END $$
    `

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_status') THEN
          ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'trial';
        END IF;
      END $$
    `

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login') THEN
          ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
        END IF;
      END $$
    `

    console.log("Creating user_sessions table...")
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)`

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbots' AND column_name='user_id') THEN
          ALTER TABLE chatbots ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END $$
`

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbots' AND column_name='ai_provider') THEN
          ALTER TABLE chatbots ADD COLUMN ai_provider VARCHAR(50) DEFAULT 'deepseek';
        END IF;
      END $$
    `

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbots' AND column_name='arvan_api_key') THEN
          ALTER TABLE chatbots ADD COLUMN arvan_api_key TEXT;
        END IF;
      END $$
    `

    await sql`
      CREATE TABLE IF NOT EXISTS global_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_chatbots_user_id ON chatbots(user_id)`

    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_messages (
        id SERIAL PRIMARY KEY, 
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE, 
        user_message TEXT NOT NULL, 
        bot_response TEXT, 
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        user_ip VARCHAR(50), 
        user_agent TEXT
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_faqs (
        id SERIAL PRIMARY KEY, 
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE, 
        question TEXT NOT NULL, 
        answer TEXT, 
        emoji VARCHAR(10) DEFAULT '❓', 
        position INTEGER DEFAULT 0
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_products (
        id SERIAL PRIMARY KEY, 
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE, 
        name VARCHAR(255) NOT NULL, 
        description TEXT, 
        image_url TEXT, 
        price DECIMAL(10, 2), 
        position INTEGER DEFAULT 0, 
        button_text VARCHAR(100) DEFAULT 'خرید', 
        secondary_text VARCHAR(100) DEFAULT 'جزئیات', 
        product_url TEXT
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_options (
        id SERIAL PRIMARY KEY, 
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE, 
        label VARCHAR(255) NOT NULL, 
        emoji TEXT, 
        position INTEGER NOT NULL DEFAULT 0
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY, 
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE, 
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255), 
        user_phone VARCHAR(50), 
        user_ip VARCHAR(50), 
        user_agent TEXT, 
        subject VARCHAR(500) NOT NULL, 
        message TEXT NOT NULL, 
        image_url TEXT, 
        status VARCHAR(50) DEFAULT 'open', 
        priority VARCHAR(50) DEFAULT 'normal', 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS ticket_responses (
        id SERIAL PRIMARY KEY, 
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE, 
        message TEXT NOT NULL, 
        image_url TEXT, 
        is_admin BOOLEAN DEFAULT FALSE, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_admin_users (
        id SERIAL PRIMARY KEY, 
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE, 
        username VARCHAR(255) NOT NULL UNIQUE, 
        password_hash VARCHAR(255) NOT NULL, 
        full_name VARCHAR(255), 
        email VARCHAR(255), 
        is_active BOOLEAN DEFAULT TRUE, 
        last_login TIMESTAMP, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_admin_sessions (
        id SERIAL PRIMARY KEY, 
        user_id INTEGER NOT NULL REFERENCES chatbot_admin_users(id) ON DELETE CASCADE, 
        session_token VARCHAR(255) NOT NULL UNIQUE, 
        expires_at TIMESTAMP NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_knowledge_base (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        source_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    // Add file upload fields to chatbot_knowledge_base table definition
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbot_knowledge_base' AND column_name='file_name') THEN
          ALTER TABLE chatbot_knowledge_base ADD COLUMN file_name TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbot_knowledge_base' AND column_name='file_size') THEN
          ALTER TABLE chatbot_knowledge_base ADD COLUMN file_size INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbot_knowledge_base' AND column_name='file_type') THEN
          ALTER TABLE chatbot_knowledge_base ADD COLUMN file_type VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbot_knowledge_base' AND column_name='extracted_text') THEN
          ALTER TABLE chatbot_knowledge_base ADD COLUMN extracted_text TEXT;
        END IF;
      END $$
    `

    await sql`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        billing_period VARCHAR(50) NOT NULL,
        message_limit INTEGER NOT NULL,
        product_limit INTEGER NOT NULL,
        duration_days INTEGER NOT NULL,
        response_speed VARCHAR(50) NOT NULL,
        is_popular BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        position INTEGER NOT NULL DEFAULT 0,
        features TEXT[], -- JSON array
        icon_name VARCHAR(50) NOT NULL,
        color VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- New fields
        messages_per_month INTEGER DEFAULT 100,
        products_total INTEGER DEFAULT 10,
        knowledge_base_links_total INTEGER DEFAULT 5,
        tickets_per_month INTEGER DEFAULT 10,
        chatbots_total INTEGER DEFAULT 1
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
        started_at TIMESTAMP NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        message_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // --- E-commerce store foundations (Phase 1) ---
    await sql`
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
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug)`

    await sql`
      CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (store_id, slug)
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_product_categories_store_id ON product_categories(store_id)`

    await sql`
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
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)`

    await sql`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)`

    await sql`
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price_override DECIMAL(12, 2),
        inventory_count INTEGER
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id)`

    await sql`
      CREATE TABLE IF NOT EXISTS checkout_field_settings (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        field_key VARCHAR(100) NOT NULL,
        label VARCHAR(255) NOT NULL,
        required BOOLEAN NOT NULL DEFAULT TRUE,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        UNIQUE (store_id, field_key)
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_checkout_field_settings_store_id ON checkout_field_settings(store_id)`

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbot_products' AND column_name='source_product_id') THEN
          ALTER TABLE chatbot_products ADD COLUMN source_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE;
        END IF;
      END $$
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_products_source_product_id ON chatbot_products(source_product_id)`

    // --- Landing page builder (Phase 2) ---
    await sql`
      CREATE TABLE IF NOT EXISTS landing_page_blocks (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        config JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_landing_page_blocks_store_id ON landing_page_blocks(store_id)`

    // --- Cart, checkout & payment gateways (Phase 4) ---
    await sql`
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
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        session_token VARCHAR(64) NOT NULL UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_carts_session_token ON carts(session_token)`

    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (cart_id, product_id, variant_id)
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)`

    await sql`
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
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)`

    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        variant_name VARCHAR(255),
        price DECIMAL(12, 2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`

    await sql`
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
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id)`

    console.log("NEON database tables initialized successfully")
    return { success: true, message: "دیتابیس با موفقیت راه‌اندازی شد" }
  } catch (error: any) {
    console.error("NEON database initialization error:", error)
    return { success: false, message: `خطا در راه‌اندازی دیتابیس: ${error.message || error}` }
  }
}

// Chatbot Functions
export async function getAllChatbots(): Promise<Chatbot[]> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM chatbots ORDER BY created_at DESC`
    return result as unknown as Chatbot[]
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return []
  }
}

export async function getChatbots(): Promise<Chatbot[]> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM chatbots ORDER BY created_at DESC`
    return result as unknown as Chatbot[]
  } catch (error) {
    console.error("Error fetching chatbots from NEON:", error)
    // Return empty array instead of throwing to prevent page crashes
    return []
  }
}

export async function getChatbot(id: number): Promise<Chatbot | null> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM chatbots WHERE id = ${id}`
    return result.length > 0 ? (result[0] as unknown as Chatbot) : null
  } catch (error) {
    console.error(`Error fetching chatbot ${id}:`, error)
    return null
  }
}

export async function getChatbotById(id: number): Promise<Chatbot | null> {
  return getChatbot(id)
}

export async function createChatbot(data: {
  name: string
  welcome_message?: string
  navigation_message?: string
  primary_color?: string
  text_color?: string
  background_color?: string
  chat_icon?: string
  position?: string
  deepseek_api_key?: string
  knowledge_base_text?: string
  knowledge_base_url?: string
  store_url?: string
  ai_url?: string
  stats_multiplier?: number
  user_id?: number
  woocommerce_orders_enabled?: boolean
  woocommerce_api_url?: string
  // New fields to add to creation
  business_info?: string | null
  theme_color?: string
  // Added response_tone to createChatbot
  response_tone?: string
  // Added is_active to createChatbot
  is_active?: boolean
}): Promise<Chatbot> {
  try {
    const sql = getSql()
    if (!data.name || data.name.trim() === "") {
      throw new Error("نام چت‌بات الزامی است")
    }
    const result = await sql`
      INSERT INTO chatbots (
        name, welcome_message, navigation_message, primary_color, text_color, background_color, chat_icon, position, deepseek_api_key, knowledge_base_text, knowledge_base_url, store_url, ai_url, stats_multiplier, created_at, updated_at, user_id, woocommerce_orders_enabled, woocommerce_api_url, business_info, theme_color, response_tone, is_active
      ) VALUES (
        ${data.name.trim()}, ${data.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟"}, ${data.navigation_message || "چه چیزی شما را به اینجا آورده است؟"}, ${data.primary_color || "#14b8a6"}, ${data.text_color || "#ffffff"}, ${data.background_color || "#f3f4f6"}, ${data.chat_icon || "💬"}, ${data.position || "bottom-right"}, ${data.deepseek_api_key || null}, ${data.knowledge_base_text || null}, ${data.knowledge_base_url || null}, ${data.store_url || null}, ${data.ai_url || null}, ${data.stats_multiplier || 1.0}, NOW(), NOW(), ${data.user_id || null}, ${data.woocommerce_orders_enabled || false}, ${data.woocommerce_api_url || null}, ${data.business_info || null}, ${data.theme_color || "#14b8a6"}, ${data.response_tone || null}, ${data.is_active === undefined ? true : data.is_active}
      ) RETURNING *
    `
    return result[0] as unknown as Chatbot
  } catch (error) {
    console.error("Error creating chatbot in NEON:", error)
    throw new Error(`Failed to create chatbot: ${error}`)
  }
}

export async function updateChatbot(chatbotId: number, updates: Partial<Chatbot>): Promise<Chatbot | null> {
  try {
    const sql = getSql()
    console.log("[v0] DB: Updating chatbot", chatbotId, "with data:", updates)

    // Get current chatbot first
    const current = await getChatbotById(chatbotId)
    if (!current) {
      console.log("[v0] DB: Chatbot not found")
      return null
    }

    // Merge updates with current values - only use columns that actually exist
    const name = updates.name !== undefined ? updates.name : current.name
    const welcome_message = updates.welcome_message !== undefined ? updates.welcome_message : current.welcome_message
    const primary_color = updates.primary_color !== undefined ? updates.primary_color : current.primary_color
    const text_color = updates.text_color !== undefined ? updates.text_color : current.text_color
    const background_color =
      updates.background_color !== undefined ? updates.background_color : current.background_color
    const chat_icon = updates.chat_icon !== undefined ? updates.chat_icon : current.chat_icon
    const position = updates.position !== undefined ? updates.position : current.position
    const knowledge_base_text =
      updates.knowledge_base_text !== undefined ? updates.knowledge_base_text : (current.knowledge_base_text ?? null)
    const business_info = updates.business_info !== undefined ? updates.business_info : (current.business_info ?? null)
    const theme_color = updates.theme_color !== undefined ? updates.theme_color : (current.theme_color ?? null)
    const response_tone = updates.response_tone !== undefined ? updates.response_tone : (current.response_tone ?? null)
    // Handle is_active field
    const is_active = updates.is_active !== undefined ? updates.is_active : (current.is_active ?? true)

    // Handle WooCommerce fields - use explicit check for undefined to allow false values
    const woocommerce_orders_enabled =
      updates.woocommerce_orders_enabled !== undefined
        ? updates.woocommerce_orders_enabled
        : (current.woocommerce_orders_enabled ?? true)
    const woocommerce_api_url =
      updates.woocommerce_api_url !== undefined ? updates.woocommerce_api_url : (current.woocommerce_api_url ?? null)

    console.log("[v0] DB: Values to save:", {
      woocommerce_orders_enabled,
      woocommerce_api_url,
      name,
      primary_color,
      business_info,
      theme_color,
      response_tone,
      is_active,
    })

    const result = await sql`
      UPDATE chatbots 
      SET 
        name = ${name},
        welcome_message = ${welcome_message},
        primary_color = ${primary_color},
        text_color = ${text_color},
        background_color = ${background_color},
        chat_icon = ${chat_icon},
        position = ${position},
        knowledge_base_text = ${knowledge_base_text},
        woocommerce_orders_enabled = ${woocommerce_orders_enabled},
        woocommerce_api_url = ${woocommerce_api_url},
        business_info = ${business_info},
        theme_color = ${theme_color},
        response_tone = ${response_tone},
        is_active = ${is_active},
        updated_at = NOW()
      WHERE id = ${chatbotId}
      RETURNING *
    `

    if (!result || result.length === 0) {
      console.error("[v0] DB: Update returned no rows")
      return null
    }

    console.log("[v0] DB: Update successful")
    return result[0] as Chatbot
  } catch (error) {
    console.error("[v0] DB: Error updating chatbot:", error)
    console.error("[v0] DB: Error details:", error instanceof Error ? error.message : "Unknown error")
    throw error
  }
}

export async function deleteChatbot(id: number): Promise<boolean> {
  try {
    const sql = getSql()
    await sql`DELETE FROM chatbots WHERE id = ${id}`
    return true
  } catch (error) {
    console.error(`Error deleting chatbot ${id} from NEON:`, error)
    return false
  }
}

// Message Functions
export async function getChatbotMessages(chatbotId: number): Promise<ChatbotMessage[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM chatbot_messages WHERE chatbot_id = ${chatbotId} ORDER BY timestamp DESC LIMIT 100
    `
    return result as unknown as ChatbotMessage[]
  } catch (error) {
    console.error("Error fetching messages from NEON:", error)
    return []
  }
}

export async function saveMessage(
  chatbotId: number,
  message: string,
  response: string,
  userIp: string,
  userAgent: string,
) {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent, timestamp)
      VALUES (${chatbotId}, ${message}, ${response}, ${userIp}, ${userAgent}, NOW())
      RETURNING id
    `
    return result[0]?.id
  } catch (error) {
    console.error("Error saving message:", error)
    throw error
  }
}

export const createMessage = saveMessage

// FAQ Functions
export async function getChatbotFAQs(chatbotId: number): Promise<ChatbotFAQ[]> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY position ASC`
    return result as unknown as ChatbotFAQ[]
  } catch (error) {
    console.error(`Error fetching FAQs for chatbot ${chatbotId}:`, error)
    return []
  }
}

export async function syncChatbotFAQs(chatbotId: number, faqs: any[]): Promise<void> {
  try {
    const sql = getSql()
    // Delete existing FAQs
    await sql`DELETE FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`

    // Insert new FAQs
    for (const faq of faqs) {
      await sql`
        INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji)
        VALUES (${chatbotId}, ${faq.question}, ${faq.answer}, ${faq.emoji})
      `
    }
  } catch (error) {
    console.error("Error syncing chatbot FAQs:", error)
    throw error
  }
}

// Product Functions
export async function getChatbotProducts(chatbotId: number): Promise<ChatbotProduct[]> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY position ASC`
    return result as unknown as ChatbotProduct[]
  } catch (error) {
    console.error(`Error fetching products for chatbot ${chatbotId}:`, error)
    return []
  }
}

export async function syncChatbotProducts(chatbotId: number, products: any[]): Promise<void> {
  try {
    const sql = getSql()
    // Delete existing products
    await sql`DELETE FROM chatbot_products WHERE chatbot_id = ${chatbotId}`

    // Insert new products
    for (const product of products) {
      await sql`
        INSERT INTO chatbot_products (
          chatbot_id, name, description, price, image_url, 
          button_text, secondary_text, product_url
        )
        VALUES (
          ${chatbotId}, ${product.name}, ${product.description}, 
          ${product.price}, ${product.image_url}, ${product.button_text}, 
          ${product.secondary_text}, ${product.product_url}
        )
      `
    }
  } catch (error) {
    console.error("Error syncing chatbot products:", error)
    throw error
  }
}

// Option Functions
export async function getChatbotOptions(chatbotId: number): Promise<ChatbotOption[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM chatbot_options WHERE chatbot_id = ${chatbotId} ORDER BY position ASC
    `
    return result as unknown as ChatbotOption[]
  } catch (error) {
    console.error("Error fetching options from NEON:", error)
    return []
  }
}

export async function createChatbotOption(option: Omit<ChatbotOption, "id">): Promise<ChatbotOption> {
  const sql = getSql()
  const result =
    await sql`INSERT INTO chatbot_options (chatbot_id, label, emoji, position) VALUES (${option.chatbot_id}, ${option.label}, ${option.emoji}, ${option.position}) RETURNING *`
  return result[0] as unknown as ChatbotOption
}

export async function deleteChatbotOption(id: number): Promise<boolean> {
  const sql = getSql()
  await sql`DELETE FROM chatbot_options WHERE id = ${id}`
  return true
}

// Ticket Functions
export async function createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket> {
  noStore()
  try {
    const sql = getSql()
    console.log("[v0] Creating ticket in database:", ticket)
    const [newTicket] = await sql`
      INSERT INTO tickets (
        chatbot_id, user_name, user_phone, user_ip, user_agent, 
        subject, message, image_url, status, priority, created_at, updated_at
      )
      VALUES (
        ${ticket.chatbot_id}, 
        ${ticket.user_name}, 
        ${ticket.user_phone || null}, 
        ${ticket.user_ip || null}, 
        ${ticket.user_agent || null}, 
        ${ticket.subject}, 
        ${ticket.message}, 
        ${ticket.image_url || null}, 
        ${ticket.status || "open"}, 
        ${ticket.priority || "normal"}, 
        NOW(), 
        NOW()
      )
      RETURNING *;
    `
    console.log("[v0] Ticket created with ID:", newTicket.id)
    return newTicket as Ticket
  } catch (error) {
    console.error("[v0] Error creating ticket in DB:", error)
    throw error
  }
}

export async function getTicketById(ticketId: number): Promise<Ticket | null> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM tickets WHERE id = ${ticketId}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting ticket:", error)
    throw error
  }
}

export async function getChatbotTickets(chatbotId: number): Promise<Ticket[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM tickets WHERE chatbot_id = ${chatbotId} ORDER BY created_at DESC
    `
    return result as unknown as Ticket[]
  } catch (error) {
    console.error("Error fetching tickets from NEON:", error)
    return []
  }
}

export async function updateTicketStatus(ticketId: number, status: string): Promise<void> {
  try {
    const sql = getSql()
    await sql`
      UPDATE tickets 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${ticketId}
    `
  } catch (error) {
    console.error("Error updating ticket status:", error)
    throw error
  }
}

export async function getTicketResponses(ticketId: number): Promise<TicketResponse[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM ticket_responses WHERE ticket_id = ${ticketId} ORDER BY created_at ASC
    `
    return result as unknown as TicketResponse[]
  } catch (error) {
    console.error("Error fetching ticket responses:", error)
    return []
  }
}

export async function addTicketResponse(
  ticketId: number,
  response: string,
  isAdmin = false,
  imageUrl?: string | null,
): Promise<void> {
  try {
    const sql = getSql()
    await sql`
      INSERT INTO ticket_responses (ticket_id, message, image_url, is_admin, created_at)
      VALUES (${ticketId}, ${response}, ${imageUrl || null}, ${isAdmin}, NOW())
    `
  } catch (error) {
    console.error("Error adding ticket response:", error)
    throw error
  }
}

// Analytics Functions
export async function getTotalMessageCount(chatbotId: number): Promise<number> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT COUNT(*) as total
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
    `
    return result[0]?.total || 0
  } catch (error) {
    console.error("Error getting total message count:", error)
    return 0
  }
}

export async function getUniqueUsersCount(chatbotId: number): Promise<number> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT COUNT(DISTINCT user_ip) as unique_users
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
    `
    return result[0]?.unique_users || 0
  } catch (error) {
    console.error("Error getting unique users count:", error)
    return 0
  }
}

export async function getAverageMessagesPerUser(chatbotId: number): Promise<number> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT 
        ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_ip), 2) as avg_messages
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
    `
    return result[0]?.avg_messages || 0
  } catch (error) {
    console.error("Error getting average messages per user:", error)
    return 0
  }
}

export async function getMessageCountByDay(chatbotId: number, days = 7): Promise<{ date: string; count: number }[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT 
        DATE(timestamp)::text as date,
        COUNT(*) as count
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
        AND timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `
    return result as unknown as { date: string; count: number }[]
  } catch (error) {
    console.error("Error getting message count by day:", error)
    return []
  }
}

export async function getMessageCountByWeek(chatbotId: number, weeks = 4): Promise<{ week: string; count: number }[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT 
        DATE_TRUNC('week', timestamp)::text as week,
        COUNT(*) as count
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
        AND timestamp >= NOW() - INTERVAL '${weeks} weeks'
      GROUP BY DATE_TRUNC('week', timestamp)
      ORDER BY week DESC
    `
    return result as unknown as { week: string; count: number }[]
  } catch (error) {
    console.error("Error getting message count by week:", error)
    return []
  }
}

export async function getMessageCountByMonth(
  chatbotId: number,
  months = 6,
): Promise<{ month: string; count: number }[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT 
        DATE_TRUNC('month', timestamp)::text as month,
        COUNT(*) as count
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
        AND timestamp >= NOW() - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', timestamp)
      ORDER BY month DESC
    `
    return result as unknown as { month: string; count: number }[]
  } catch (error) {
    console.error("Error getting message count by month:", error)
    return []
  }
}

export async function getTopUserQuestions(
  chatbotId: number,
  limit = 10,
): Promise<{ question: string; count: number }[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT 
        user_message as question,
        COUNT(*) as frequency
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
        AND LENGTH(user_message) > 5
      GROUP BY user_message
      ORDER BY frequency DESC
      LIMIT ${limit}
    `
    return result as unknown as { question: string; count: number }[]
  } catch (error) {
    console.error("Error getting top user questions:", error)
    return []
  }
}

// Admin User Functions
export async function getChatbotAdminUsers(chatbotId: number): Promise<AdminUser[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
      FROM chatbot_admin_users
      WHERE chatbot_id = ${chatbotId}
      ORDER BY created_at DESC
    `
    return result as unknown as AdminUser[]
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return []
  }
}

export async function createAdminUser(
  adminUser: Omit<AdminUser, "id" | "created_at" | "updated_at">,
): Promise<AdminUser> {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email, is_active)
      VALUES (${adminUser.chatbot_id}, ${adminUser.username}, ${adminUser.password_hash}, ${adminUser.full_name}, ${adminUser.email}, ${adminUser.is_active})
      RETURNING id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
    `
    return result[0] as unknown as AdminUser
  } catch (error) {
    console.error("Error creating admin user:", error)
    throw new Error(`Failed to create admin user: ${error}`)
  }
}

export async function updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser | null> {
  try {
    const sql = getSql()
    const result = await sql`
      UPDATE chatbot_admin_users
      SET
        username = COALESCE(${updates.username}, username),
        password_hash = COALESCE(${updates.password_hash}, password_hash),
        full_name = COALESCE(${updates.full_name}, full_name),
        email = COALESCE(${updates.email}, email),
        is_active = COALESCE(${updates.is_active}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
    `
    return result.length > 0 ? (result[0] as unknown as AdminUser) : null
  } catch (error) {
    console.error("Error updating admin user:", error)
    return null
  }
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  try {
    const sql = getSql()
    await sql`DELETE FROM chatbot_admin_users WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return false
  }
}

export async function getAdminUserByUsername(chatbotId: number, username: string): Promise<AdminUser | null> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM chatbot_admin_users
      WHERE chatbot_id = ${chatbotId} AND username = ${username} AND is_active = true
    `
    return result.length > 0 ? (result[0] as unknown as AdminUser) : null
  } catch (error) {
    console.error("Error fetching admin user by username:", error)
    return null
  }
}

export async function updateAdminUserLastLogin(id: number): Promise<void> {
  try {
    const sql = getSql()
    await sql`UPDATE chatbot_admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ${id}`
  } catch (error) {
    console.error("Error updating admin user last login:", error)
  }
}

// User Functions
export async function getUserByPhone(phone: string): Promise<User | null> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM users WHERE phone = ${phone}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching user by phone:", error)
    throw error
  }
}

export async function createUser(
  user: Omit<
    User,
    | "id"
    | "created_at"
    | "trial_start_date"
    | "trial_end_date"
    | "is_trial_active"
    | "subscription_status"
    | "last_login"
  >,
): Promise<User> {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO users (phone, first_name, last_name)
      VALUES (${user.phone}, ${user.first_name}, ${user.last_name})
      RETURNING *
    `
    return result[0] as unknown as User
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error(`Failed to create user: ${error}`)
  }
}

export async function updateUser(id: number, updates: Partial<User>): Promise<User | null> {
  try {
    const sql = getSql()
    const result = await sql`
      UPDATE users
      SET
        phone = COALESCE(${updates.phone}, phone),
        first_name = COALESCE(${updates.first_name}, first_name),
        last_name = COALESCE(${updates.last_name}, last_name),
        last_login = COALESCE(${updates.last_login}, last_login),
        password_hash = COALESCE(${updates.password_hash}, password_hash) -- Added for password update
      WHERE id = ${id}
      RETURNING *
    `
    return result.length > 0 ? (result[0] as unknown as User) : null
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    const sql = getSql()
    await sql`DELETE FROM users WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

// User Session Functions
export async function createUserSession(userId: number, sessionToken: string, expiresAt: string): Promise<UserSession> {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt})
      RETURNING *
    `
    return result[0] as unknown as UserSession
  } catch (error) {
    console.error("Error creating user session:", error)
    throw new Error(`Failed to create user session: ${error}`)
  }
}

export async function getUserSessionByToken(sessionToken: string): Promise<UserSession | null> {
  try {
    const sql = getSql()
    const result = await sql`SELECT * FROM user_sessions WHERE session_token = ${sessionToken}`
    return result[0] || null
  } catch (error) {
    console.error("Error fetching user session by token:", error)
    throw error
  }
}

export async function deleteUserSession(id: number): Promise<boolean> {
  try {
    const sql = getSql()
    await sql`DELETE FROM user_sessions WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting user session:", error)
    return false
  }
}

// Stats Multiplier Functions
export async function updateStatsMultiplier(chatbotId: number, multiplier: number): Promise<boolean> {
  try {
    const sql = getSql()
    await sql`UPDATE chatbots SET stats_multiplier = ${multiplier} WHERE id = ${chatbotId}`
    return true
  } catch (error) {
    console.error("Error updating stats multiplier:", error)
    return false
  }
}

export async function getStatsMultiplier(chatbotId: number): Promise<number> {
  try {
    const sql = getSql()
    const result = await sql`SELECT COALESCE(stats_multiplier, 1.0) as multiplier FROM chatbots WHERE id = ${chatbotId}`
    return result.length > 0 ? Number(result[0].multiplier) : 1.0
  } catch (error) {
    console.error("Error getting stats multiplier:", error)
    return 1.0
  }
}

// Knowledge Base Functions
export async function getChatbotKnowledgeBase(chatbotId: number): Promise<ChatbotKnowledgeBase[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM chatbot_knowledge_base 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY created_at DESC
    `
    return result as unknown as ChatbotKnowledgeBase[]
  } catch (error) {
    console.error(`Error fetching knowledge base for chatbot ${chatbotId}:`, error)
    return []
  }
}

export async function createKnowledgeBaseEntry(
  entry: Omit<ChatbotKnowledgeBase, "id" | "created_at" | "updated_at">,
): Promise<ChatbotKnowledgeBase> {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO chatbot_knowledge_base (
        chatbot_id, type, title, content, source_url, 
        file_name, file_size, file_type, 
        created_at, updated_at
      )
      VALUES (
        ${entry.chatbot_id}, ${entry.type}, ${entry.title}, ${entry.content}, ${entry.source_url || null},
        ${entry.file_name || null}, ${entry.file_size || null}, ${entry.file_type || null},
        NOW(), NOW()
      )
      RETURNING *
    `
    return result[0] as unknown as ChatbotKnowledgeBase
  } catch (error) {
    console.error("Error creating knowledge base entry:", error)
    throw error
  }
}

export async function updateKnowledgeBaseEntry(
  id: number,
  updates: Partial<ChatbotKnowledgeBase>,
): Promise<ChatbotKnowledgeBase | null> {
  try {
    const sql = getSql()
    const result = await sql`
      UPDATE chatbot_knowledge_base
      SET
        title = COALESCE(${updates.title}, title),
        content = COALESCE(${updates.content}, content),
        source_url = COALESCE(${updates.source_url}, source_url),
        file_name = COALESCE(${updates.file_name}, file_name),
        file_size = COALESCE(${updates.file_size}, file_size),
        file_type = COALESCE(${updates.file_type}, file_type),
        extracted_text = COALESCE(${updates.extracted_text}, extracted_text),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result.length > 0 ? (result[0] as unknown as ChatbotKnowledgeBase) : null
  } catch (error) {
    console.error("Error updating knowledge base entry:", error)
    return null
  }
}

export async function deleteKnowledgeBaseEntry(id: number): Promise<boolean> {
  try {
    const sql = getSql()
    await sql`DELETE FROM chatbot_knowledge_base WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting knowledge base entry:", error)
    return false
  }
}

export async function syncKnowledgeBaseFromFAQs(chatbotId: number): Promise<void> {
  try {
    const sql = getSql()
    // Delete existing FAQ entries
    await sql`DELETE FROM chatbot_knowledge_base WHERE chatbot_id = ${chatbotId} AND type = 'faq'`

    // Get all FAQs
    const faqs = await getChatbotFAQs(chatbotId)

    // Insert FAQs as knowledge base
    for (const faq of faqs) {
      await sql`
        INSERT INTO chatbot_knowledge_base (chatbot_id, type, title, content, created_at, updated_at)
        VALUES (${chatbotId}, 'faq', ${faq.question}, ${faq.answer}, NOW(), NOW())
      `
    }
  } catch (error) {
    console.error("Error syncing knowledge base from FAQs:", error)
    throw error
  }
}

export async function syncKnowledgeBaseFromProducts(chatbotId: number): Promise<void> {
  try {
    const sql = getSql()
    // Delete existing product entries
    await sql`DELETE FROM chatbot_knowledge_base WHERE chatbot_id = ${chatbotId} AND type = 'product'`

    // Get all products
    const products = await getChatbotProducts(chatbotId)

    // Insert products as knowledge base
    for (const product of products) {
      const content = `نام محصول: ${product.name}\nقیمت: ${product.price} تومان\nتوضیحات: ${product.description || "ندارد"}\nلینک: ${product.product_url || "ندارد"}`
      await sql`
        INSERT INTO chatbot_knowledge_base (chatbot_id, type, title, content, source_url, created_at, updated_at)
        VALUES (${chatbotId}, 'product', ${product.name}, ${content}, ${product.product_url}, NOW(), NOW())
      `
    }
  } catch (error) {
    console.error("Error syncing knowledge base from products:", error)
    throw error
  }
}

// Additional Functions
// The original code had a duplicate `getChatbotById` function. This is the first one.
// export async function getChatbotById(id: number): Promise<Chatbot | null> {
//   noStore()
//   try {
//     const sql = getSql()
//     const [chatbot] = await sql`SELECT * FROM chatbots WHERE id = ${id}`
//     return chatbot || null
//   } catch (error) {
//     console.error("Error fetching chatbot by ID:", error)
//     return null
//   }
// }

export async function getFAQsByChatbotId(chatbotId: number) {
  noStore()
  try {
    const sql = getSql()
    const faqs = await sql`SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY id ASC`
    return faqs
  } catch (error) {
    console.error("Error fetching FAQs by chatbot ID:", error)
    throw error
  }
}

export async function getProductsByChatbotId(chatbotId: number) {
  noStore()
  try {
    const sql = getSql()
    const products = await sql`SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY id ASC`
    return products
  } catch (error) {
    console.error("Error fetching products by chatbot ID:", error)
    throw error
  }
}

export async function getUserChatbots(userId: number): Promise<Chatbot[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM chatbots 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `
    return result as unknown as Chatbot[]
  } catch (error) {
    console.error(`Error fetching chatbots for user ${userId}:`, error)
    return []
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM users 
      ORDER BY created_at DESC
    `
    return result as unknown as User[]
  } catch (error) {
    console.error("Error fetching all users:", error)
    return []
  }
}

// Subscription Plan Functions
export async function getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM subscription_plans 
      WHERE is_active = true
      ORDER BY position ASC
    `
    return result as unknown as SubscriptionPlan[]
  } catch (error) {
    console.error("Error fetching subscription plans:", error)
    return []
  }
}

export async function getSubscriptionPlan(id: number): Promise<SubscriptionPlan | null> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM subscription_plans WHERE id = ${id}
    `
    return (result[0] as unknown as SubscriptionPlan) || null
  } catch (error) {
    console.error("Error fetching subscription plan:", error)
    return null
  }
}

export async function createSubscriptionPlan(
  plan: Omit<SubscriptionPlan, "id" | "created_at" | "updated_at">,
): Promise<SubscriptionPlan> {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO subscription_plans (
        name, description, price, billing_period, message_limit, 
        product_limit, duration_days, response_speed, is_popular, 
        is_active, position, features, icon_name, color,
        messages_per_month, products_total, knowledge_base_links_total,
        tickets_per_month, chatbots_total
      )
      VALUES (
        ${plan.name}, ${plan.description}, ${plan.price}, ${plan.billing_period},
        ${plan.message_limit}, ${plan.product_limit}, ${plan.duration_days},
        ${plan.response_speed}, ${plan.is_popular}, ${plan.is_active},
        ${plan.position}, ${JSON.stringify(plan.features)}, ${plan.icon_name}, ${plan.color},
        ${(plan as any).messages_per_month || 100}, ${(plan as any).products_total || 10},
        ${(plan as any).knowledge_base_links_total || 5}, ${(plan as any).tickets_per_month || 10},
        ${(plan as any).chatbots_total || 1}
      )
      RETURNING *
    `
    return result[0] as unknown as SubscriptionPlan
  } catch (error) {
    console.error("Error creating subscription plan:", error)
    throw error
  }
}

export async function updateSubscriptionPlan(
  id: number,
  updates: Partial<SubscriptionPlan>,
): Promise<SubscriptionPlan | null> {
  try {
    const sql = getSql()
    console.log("[v0] Updating subscription plan in database:", { id, updates })

    const featuresValue = updates.features
      ? sql`ARRAY[${sql.join(
          updates.features.map((f: string) => sql`${f}`),
          sql`, `,
        )}]::text[]`
      : null

    const result = await sql`
      UPDATE subscription_plans
      SET
        name = COALESCE(${updates.name}, name),
        description = COALESCE(${updates.description}, description),
        price = COALESCE(${updates.price}, price),
        billing_period = COALESCE(${updates.billing_period}, billing_period),
        message_limit = COALESCE(${updates.message_limit}, message_limit),
        product_limit = COALESCE(${updates.product_limit}, product_limit),
        duration_days = COALESCE(${updates.duration_days}, duration_days),
        response_speed = COALESCE(${updates.response_speed}, response_speed),
        is_popular = COALESCE(${updates.is_popular}, is_popular),
        is_active = COALESCE(${updates.is_active}, is_active),
        position = COALESCE(${updates.position}, position),
        features = COALESCE(${featuresValue}, features),
        icon_name = COALESCE(${updates.icon_name}, icon_name),
        color = COALESCE(${updates.color}, color),
        messages_per_month = COALESCE(${(updates as any).messages_per_month}, messages_per_month),
        products_total = COALESCE(${(updates as any).products_total}, products_total),
        knowledge_base_links_total = COALESCE(${(updates as any).knowledge_base_links_total}, knowledge_base_links_total),
        tickets_per_month = COALESCE(${(updates as any).tickets_per_month}, tickets_per_month),
        chatbots_total = COALESCE(${(updates as any).chatbots_total}, chatbots_total),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    console.log("[v0] Database update result:", result)
    return (result[0] as unknown as SubscriptionPlan) || null
  } catch (error) {
    console.error("[v0] Error updating subscription plan:", error)
    throw error
  }
}

export async function deleteSubscriptionPlan(id: number): Promise<boolean> {
  try {
    const sql = getSql()
    await sql`DELETE FROM subscription_plans WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting subscription plan:", error)
    return false
  }
}

// User Subscription Functions
export async function getUserSubscription(userId: number): Promise<UserSubscription | null> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM user_subscriptions 
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `
    return (result[0] as unknown as UserSubscription) || null
  } catch (error) {
    console.error("Error fetching user subscription:", error)
    return null
  }
}

export async function createUserSubscription(
  subscription: Omit<UserSubscription, "id" | "created_at">,
): Promise<UserSubscription> {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO user_subscriptions (
        user_id, plan_id, started_at, expires_at, message_count, is_active
      )
      VALUES (
        ${subscription.user_id}, ${subscription.plan_id}, ${subscription.started_at},
        ${subscription.expires_at}, ${subscription.message_count}, ${subscription.is_active}
      )
      RETURNING *
    `
    return result[0] as unknown as UserSubscription
  } catch (error) {
    console.error("Error creating user subscription:", error)
    throw error
  }
}

export async function incrementUserMessageCount(userId: number): Promise<void> {
  try {
    const sql = getSql()
    await sql`
      UPDATE user_subscriptions
      SET message_count = message_count + 1
      WHERE user_id = ${userId} AND is_active = true
    `
  } catch (error) {
    console.error("Error incrementing message count:", error)
  }
}

export async function checkUserLimits(userId: number): Promise<{
  canSendMessage: boolean
  canAddProduct: boolean
  currentMessageCount: number
  messageLimit: number
  currentProductCount: number
  productLimit: number
}> {
  try {
    const sql = getSql()
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
      return {
        canSendMessage: false,
        canAddProduct: false,
        currentMessageCount: 0,
        messageLimit: 0,
        currentProductCount: 0,
        productLimit: 0,
      }
    }

    const plan = await getSubscriptionPlan(subscription.plan_id)
    if (!plan) {
      return {
        canSendMessage: false,
        canAddProduct: false,
        currentMessageCount: 0,
        messageLimit: 0,
        currentProductCount: 0,
        productLimit: 0,
      }
    }

    const chatbots = await getUserChatbots(userId)
    let totalProducts = 0
    for (const chatbot of chatbots) {
      const products = await getChatbotProducts(chatbot.id)
      totalProducts += products.length
    }

    return {
      canSendMessage: plan.message_limit === -1 || subscription.message_count < plan.message_limit,
      canAddProduct: plan.product_limit === -1 || totalProducts < plan.product_limit,
      currentMessageCount: subscription.message_count,
      messageLimit: plan.message_limit,
      currentProductCount: totalProducts,
      productLimit: plan.product_limit,
    }
  } catch (error) {
    console.error("Error checking user limits:", error)
    return {
      canSendMessage: false,
      canAddProduct: false,
      currentMessageCount: 0,
      messageLimit: 0,
      currentProductCount: 0,
      productLimit: 0,
    }
  }
}

