-- Add missing columns to chatbots table if they don't exist
-- Run this script to fix the database schema

DO $$ 
BEGIN
    -- Add business_info column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbots' AND column_name='business_info') THEN
        ALTER TABLE chatbots ADD COLUMN business_info TEXT;
        RAISE NOTICE 'Added business_info column';
    END IF;
    
    -- Add theme_color column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbots' AND column_name='theme_color') THEN
        ALTER TABLE chatbots ADD COLUMN theme_color VARCHAR(50) DEFAULT '#14b8a6';
        RAISE NOTICE 'Added theme_color column';
    END IF;
    
    -- Add response_tone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbots' AND column_name='response_tone') THEN
        ALTER TABLE chatbots ADD COLUMN response_tone VARCHAR(100);
        RAISE NOTICE 'Added response_tone column';
    END IF;
    
    -- Add is_active column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbots' AND column_name='is_active') THEN
        ALTER TABLE chatbots ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column';
    END IF;
END $$;

-- Set all existing chatbots to active
UPDATE chatbots SET is_active = TRUE WHERE is_active IS NULL;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chatbots' 
AND column_name IN ('business_info', 'theme_color', 'response_tone', 'is_active');
