-- Fix all database issues for widget loading

-- Ensure is_active column exists in chatbots table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chatbots' AND column_name = 'is_active') THEN
        ALTER TABLE chatbots ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Ensure is_trial_active column exists in users table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_trial_active') THEN
        ALTER TABLE users ADD COLUMN is_trial_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Set system admin to always active
UPDATE users SET is_trial_active = true WHERE phone = '0000000000';

-- Set all chatbots of system admin to active
UPDATE chatbots SET is_active = true WHERE user_id IN (SELECT id FROM users WHERE phone = '0000000000');

-- Ensure all existing chatbots have is_active set
UPDATE chatbots SET is_active = true WHERE is_active IS NULL;

-- Ensure all existing users have is_trial_active set  
UPDATE users SET is_trial_active = true WHERE is_trial_active IS NULL;

-- Create user_usage_tracking table if not exists
CREATE TABLE IF NOT EXISTS user_usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subscription_type VARCHAR(50) DEFAULT 'demo',
    is_demo BOOLEAN DEFAULT true,
    ai_tokens_used INTEGER DEFAULT 0,
    ai_tokens_limit INTEGER DEFAULT 100000,
    products_used INTEGER DEFAULT 0,
    products_limit INTEGER DEFAULT 10,
    sales_advisor_used INTEGER DEFAULT 0,
    sales_advisor_limit INTEGER DEFAULT 10,
    cta_links_used INTEGER DEFAULT 0,
    cta_links_limit INTEGER DEFAULT 5,
    tickets_used INTEGER DEFAULT 0,
    tickets_limit INTEGER DEFAULT 50,
    messages_used INTEGER DEFAULT 0,
    messages_limit INTEGER DEFAULT 200,
    demo_days_remaining INTEGER DEFAULT 7,
    subscription_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_usage_tracking_user_id ON user_usage_tracking(user_id);

SELECT 'Database fixes applied successfully' as result;
