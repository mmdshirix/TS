-- Complete schema fix for all missing columns
-- Run this script to fix all database schema issues

-- Check if columns exist before adding them to avoid errors
DO $$ 
BEGIN
    -- Add business_info to chatbots table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='chatbots' AND column_name='business_info') THEN
        ALTER TABLE chatbots ADD COLUMN business_info TEXT;
    END IF;

    -- Add response_tone to chatbots table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='chatbots' AND column_name='response_tone') THEN
        ALTER TABLE chatbots ADD COLUMN response_tone VARCHAR(50) DEFAULT 'friendly';
    END IF;

    -- Add is_active to chatbots table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='chatbots' AND column_name='is_active') THEN
        ALTER TABLE chatbots ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Add subscription_type to users table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='subscription_type') THEN
        ALTER TABLE users ADD COLUMN subscription_type VARCHAR(50) DEFAULT 'demo';
    END IF;

    -- Add subscription_expires_at to users table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='subscription_expires_at') THEN
        ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP;
    END IF;

    -- Add talksell_order_id to users table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='talksell_order_id') THEN
        ALTER TABLE users ADD COLUMN talksell_order_id INTEGER;
    END IF;

    -- Add last_subscription_sync to users table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='last_subscription_sync') THEN
        ALTER TABLE users ADD COLUMN last_subscription_sync TIMESTAMP;
    END IF;
END $$;

-- Create user_usage_tracking table if not exists
CREATE TABLE IF NOT EXISTS user_usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
    
    -- Token usage
    ai_tokens_used INTEGER DEFAULT 0,
    ai_tokens_limit INTEGER DEFAULT 5000,
    
    -- Product limits
    products_count INTEGER DEFAULT 0,
    products_limit INTEGER DEFAULT 10,
    
    -- Message limits  
    messages_remaining INTEGER DEFAULT 200,
    messages_limit INTEGER DEFAULT 200,
    
    -- Sales advisor usage
    sales_advisor_used INTEGER DEFAULT 0,
    sales_advisor_limit INTEGER DEFAULT 20,
    
    -- CTA usage
    cta_links_used INTEGER DEFAULT 0,
    cta_links_limit INTEGER DEFAULT 5,
    
    -- Support tickets
    support_tickets_used INTEGER DEFAULT 0,
    support_tickets_limit INTEGER DEFAULT 50,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, chatbot_id)
);

ALTER TABLE user_usage_tracking
    ADD COLUMN IF NOT EXISTS chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS products_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS messages_remaining INTEGER DEFAULT 200,
    ADD COLUMN IF NOT EXISTS support_tickets_used INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS support_tickets_limit INTEGER DEFAULT 50,
    ADD COLUMN IF NOT EXISTS reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create CTA clicks tracking table if not exists
CREATE TABLE IF NOT EXISTS cta_clicks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
    product_url TEXT,
    product_name TEXT,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_usage_tracking_user_id ON user_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_tracking_chatbot_id ON user_usage_tracking(chatbot_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_usage_tracking_user_chatbot_unique ON user_usage_tracking(user_id, chatbot_id);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_user_id ON cta_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_chatbot_id ON cta_clicks(chatbot_id);

-- Set default subscription for system admin (phone: 0000000000)
UPDATE users 
SET subscription_type = 'scale', 
    subscription_expires_at = CURRENT_TIMESTAMP + INTERVAL '100 years'
WHERE phone = '0000000000';

-- Initialize usage tracking for all existing users
INSERT INTO user_usage_tracking (user_id, chatbot_id, ai_tokens_limit, products_limit, messages_limit, sales_advisor_limit, cta_links_limit, support_tickets_limit)
SELECT 
    u.id,
    c.id,
    CASE u.subscription_type
        WHEN 'start' THEN 5000
        WHEN 'grow' THEN 15000
        WHEN 'scale' THEN 100000
        ELSE 5000
    END as ai_tokens_limit,
    CASE u.subscription_type
        WHEN 'start' THEN 10
        WHEN 'grow' THEN 50
        WHEN 'scale' THEN 500
        ELSE 10
    END as products_limit,
    CASE u.subscription_type
        WHEN 'start' THEN 200
        WHEN 'grow' THEN 400
        WHEN 'scale' THEN 1000
        ELSE 200
    END as messages_limit,
    CASE u.subscription_type
        WHEN 'start' THEN 20
        WHEN 'grow' THEN 200
        WHEN 'scale' THEN 500
        ELSE 20
    END as sales_advisor_limit,
    CASE u.subscription_type
        WHEN 'start' THEN 5
        WHEN 'grow' THEN 5
        WHEN 'scale' THEN 5
        ELSE 5
    END as cta_links_limit,
    CASE u.subscription_type
        WHEN 'start' THEN 50
        WHEN 'grow' THEN 0
        WHEN 'scale' THEN 0
        ELSE 50
    END as support_tickets_limit
FROM users u
CROSS JOIN chatbots c
WHERE c.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Schema migration completed successfully';
END $$;
