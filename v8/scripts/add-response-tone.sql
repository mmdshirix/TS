-- Add response_tone column to chatbots table
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS response_tone VARCHAR(50) DEFAULT 'friendly';

-- Update existing chatbots to have default tone
UPDATE chatbots SET response_tone = 'friendly' WHERE response_tone IS NULL;
