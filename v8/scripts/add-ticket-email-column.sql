-- Add email column to tickets table if it doesn't exist
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tickets_user_phone ON tickets(user_phone);
CREATE INDEX IF NOT EXISTS idx_tickets_user_name ON tickets(user_name);

-- Update ticket_responses table to support image uploads
ALTER TABLE ticket_responses ADD COLUMN IF NOT EXISTS image_url TEXT;
