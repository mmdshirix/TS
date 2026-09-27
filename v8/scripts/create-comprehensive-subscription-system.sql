-- Comprehensive Subscription System Database Schema
-- Based on TalkSell documentation and pricing plans

-- 1. Drop and recreate subscription_plans table with full feature set
DROP TABLE IF EXISTS subscription_plans CASCADE;

CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL DEFAULT 'custom', -- start, grow, scale
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0, -- Price in Toman
  billing_period VARCHAR(20) DEFAULT 'monthly',
  message_limit INTEGER DEFAULT -1,
  product_limit INTEGER DEFAULT -1,
  duration_days INTEGER NOT NULL DEFAULT 30,
  response_speed VARCHAR(50) DEFAULT 'normal',
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Token System (AI Tokens)
  ai_tokens INTEGER NOT NULL DEFAULT 500000,
  approx_conversations INTEGER NOT NULL DEFAULT 1000,
  
  -- Product & Feature Limits
  product_inputs INTEGER NOT NULL DEFAULT 50, -- -1 = unlimited
  response_quality VARCHAR(50) DEFAULT 'basic', -- basic, advanced, intelligent
  crawler_speed VARCHAR(50) DEFAULT 'limited', -- limited, fast, unlimited
  cta_suggestions_type VARCHAR(50) DEFAULT 'simple', -- simple, advanced, intelligent
  cta_suggestions_limit INTEGER DEFAULT 30, -- links count, -1 = unlimited
  sales_advisor_limit INTEGER DEFAULT 20, -- consultations, -1 = unlimited
  conversation_memory VARCHAR(50) DEFAULT 'short', -- short, medium, long_term
  ai_learning_depth VARCHAR(50) DEFAULT 'surface', -- surface, deep, deepest
  
  -- Feature Toggles (enabled/disabled)
  suggested_questions_enabled BOOLEAN DEFAULT true,
  ticket_system_enabled BOOLEAN DEFAULT false,
  product_sync_enabled BOOLEAN DEFAULT false,
  api_access_enabled BOOLEAN DEFAULT false,
  order_tracking_enabled BOOLEAN DEFAULT false,
  customer_return_detection_enabled BOOLEAN DEFAULT false,
  
  -- Display settings
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  icon_name VARCHAR(50) DEFAULT 'Zap',
  color VARCHAR(50) DEFAULT 'blue',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create user_usage_tracking table for real-time usage
DROP TABLE IF EXISTS user_usage_tracking CASCADE;

CREATE TABLE user_usage_tracking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Token usage
  ai_tokens_used INTEGER DEFAULT 0,
  ai_tokens_limit INTEGER DEFAULT 500000,
  
  -- Feature usage
  products_used INTEGER DEFAULT 0,
  products_limit INTEGER DEFAULT 50,
  
  sales_advisor_used INTEGER DEFAULT 0,
  sales_advisor_limit INTEGER DEFAULT 20,
  
  cta_links_used INTEGER DEFAULT 0,
  cta_links_limit INTEGER DEFAULT 30,
  
  tickets_used INTEGER DEFAULT 0,
  tickets_limit INTEGER DEFAULT 0,
  
  -- Subscription info
  subscription_type VARCHAR(50) DEFAULT 'demo', -- demo, start, grow, scale, expired
  subscription_start TIMESTAMP,
  subscription_end TIMESTAMP,
  
  -- Demo specific
  is_demo BOOLEAN DEFAULT true,
  demo_days_remaining INTEGER DEFAULT 7,
  
  -- Timestamps
  last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);

-- 3. Insert default plans based on documentation
INSERT INTO subscription_plans (
  name, name_en, description, price, duration_days,
  ai_tokens, approx_conversations,
  product_inputs, response_quality, crawler_speed,
  cta_suggestions_type, cta_suggestions_limit, sales_advisor_limit,
  conversation_memory, ai_learning_depth,
  suggested_questions_enabled, ticket_system_enabled, product_sync_enabled,
  api_access_enabled, order_tracking_enabled, customer_return_detection_enabled,
  is_popular, position, icon_name, color
) VALUES 
-- Start Plan
(
  'پلن Start', 'start', 'حضور هوشمند ۲۴ ساعته - برای زمانی که نمی‌خواهید حتی یک مشتری بی‌پاسخ سایت را ترک کند.',
  390000, 30,
  500000, 1000,
  50, 'basic', 'limited',
  'simple', 30, 20,
  'short', 'surface',
  true, false, false,
  false, false, false,
  false, 1, 'Zap', 'green'
),
-- Grow Plan
(
  'پلن Grow', 'grow', 'فروشنده‌ای که بلد است کی پیشنهاد بدهد - برای زمانی که پاسخ دادن کافی نیست و باید تبدیل به فروش شود.',
  1300000, 30,
  1500000, 3000,
  150, 'advanced', 'fast',
  'advanced', 60, 200,
  'medium', 'deep',
  true, true, true,
  true, false, false,
  true, 2, 'TrendingUp', 'blue'
),
-- Scale Plan
(
  'پلن Scale', 'scale', 'کارمند دیجیتال بدون خطا - برای زمانی که می‌خواهید سیستم، خودش کار را جلو ببرد.',
  3700000, 30,
  5000000, 10000,
  -1, 'intelligent', 'unlimited',
  'intelligent', -1, -1,
  'long_term', 'deepest',
  true, true, true,
  true, true, true,
  false, 3, 'Crown', 'purple'
);

-- 4. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_subscription_type ON user_usage_tracking(subscription_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name_en ON subscription_plans(name_en);
