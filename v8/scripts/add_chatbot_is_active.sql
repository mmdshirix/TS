-- Add is_active column to chatbots table
ALTER TABLE chatbots 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chatbots_is_active ON chatbots(is_active);
