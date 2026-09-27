-- Add is_active column to chatbots table
ALTER TABLE chatbots 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Set all existing chatbots to inactive initially
UPDATE chatbots SET is_active = FALSE;

-- For each user, activate their first chatbot
WITH ranked_chatbots AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
  FROM chatbots
)
UPDATE chatbots
SET is_active = TRUE
WHERE id IN (
  SELECT id FROM ranked_chatbots WHERE rn = 1
);

-- Comment explaining the purpose
COMMENT ON COLUMN chatbots.is_active IS 'Only one chatbot can be active per user (except system user)';
