-- Adding new limit columns to subscription_plans table
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS messages_per_month INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS products_total INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS knowledge_base_links_total INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS tickets_per_month INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS chatbots_total INTEGER DEFAULT 1;

CREATE TABLE IF NOT EXISTS global_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adding global settings for free trial duration
INSERT INTO global_settings (setting_key, setting_value) 
VALUES ('free_trial_days', '7')
ON CONFLICT (setting_key) DO NOTHING;
