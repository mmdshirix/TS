-- Add AI provider switching columns to chatbots table
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(50) DEFAULT 'deepseek';
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS arvan_api_key TEXT;

-- Create global_settings table for system-wide AI provider configuration
CREATE TABLE IF NOT EXISTS global_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);