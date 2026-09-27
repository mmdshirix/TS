-- Add is_active column to chatbots table with default value true
ALTER TABLE chatbots 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Update all existing chatbots to be active
UPDATE chatbots 
SET is_active = true 
WHERE is_active IS NULL;

-- Create index for better performance  
CREATE INDEX IF NOT EXISTS idx_chatbots_is_active ON chatbots(is_active);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'chatbots' AND column_name = 'is_active';
