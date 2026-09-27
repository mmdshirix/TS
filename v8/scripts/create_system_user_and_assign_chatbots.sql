-- Create a permanent system user for managing orphaned chatbots
INSERT INTO users (
  first_name,
  last_name,
  phone,
  is_trial_active,
  trial_start_date,
  trial_end_date,
  subscription_status,
  created_at
) VALUES (
  'سیستم',
  'دائمی',
  '0000000000',
  true,
  NOW(),
  NOW() + INTERVAL '100 years',
  'lifetime',
  NOW()
)
ON CONFLICT DO NOTHING;

-- Get the system user ID
DO $$
DECLARE
  system_user_id INTEGER;
BEGIN
  SELECT id INTO system_user_id FROM users WHERE phone = '0000000000';
  
  -- Assign all orphaned chatbots (user_id IS NULL) to the system user
  UPDATE chatbots 
  SET user_id = system_user_id 
  WHERE user_id IS NULL;
  
  -- Assign chatbots with non-existent user IDs to the system user
  UPDATE chatbots 
  SET user_id = system_user_id 
  WHERE user_id NOT IN (SELECT id FROM users) AND user_id IS NOT NULL;
END $$;

-- Number the chatbots sequentially
UPDATE chatbots 
SET name = 'چت‌بات #' || id 
WHERE name IS NULL OR name = '';
