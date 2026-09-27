-- Add missing business_info column to chatbots table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbots' AND column_name='business_info') THEN
    ALTER TABLE chatbots ADD COLUMN business_info TEXT;
  END IF;
END $$;

-- Ensure response_tone column exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbots' AND column_name='response_tone') THEN
    ALTER TABLE chatbots ADD COLUMN response_tone VARCHAR(100);
  END IF;
END $$;

-- Ensure is_active column exists with proper default
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chatbots' AND column_name='is_active') THEN
    ALTER TABLE chatbots ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;
