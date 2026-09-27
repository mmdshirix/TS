-- Fix user_usage_tracking table to have all required columns
-- Run this to ensure the subscription system works correctly

-- Add missing columns to user_usage_tracking if they don't exist
DO $$ 
BEGIN
    -- Add messages_used column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_usage_tracking' AND column_name = 'messages_used') THEN
        ALTER TABLE user_usage_tracking ADD COLUMN messages_used INTEGER DEFAULT 0;
    END IF;
    
    -- Add messages_limit column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_usage_tracking' AND column_name = 'messages_limit') THEN
        ALTER TABLE user_usage_tracking ADD COLUMN messages_limit INTEGER DEFAULT 1000;
    END IF;
    
    -- Add subscription_end column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_usage_tracking' AND column_name = 'subscription_end') THEN
        ALTER TABLE user_usage_tracking ADD COLUMN subscription_end TIMESTAMP;
    END IF;
END $$;

-- Create cta_clicks table for tracking CTA usage
CREATE TABLE IF NOT EXISTS cta_clicks (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
    product_id INTEGER,
    cta_type VARCHAR(50) DEFAULT 'product_link',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cta_clicks
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cta_clicks_chatbot ON cta_clicks(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_created ON cta_clicks(created_at);

-- Update existing users to have proper usage tracking
INSERT INTO user_usage_tracking (user_id, subscription_type, is_demo, ai_tokens_limit, products_limit, messages_limit)
SELECT 
    u.id,
    'demo',
    true,
    100000,
    10,
    200
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_usage_tracking uut WHERE uut.user_id = u.id
);

-- Update demo_days_remaining for demo users
UPDATE user_usage_tracking 
SET demo_days_remaining = 7 
WHERE is_demo = true AND demo_days_remaining IS NULL;

SELECT 'Subscription tracking tables updated successfully' as status;
