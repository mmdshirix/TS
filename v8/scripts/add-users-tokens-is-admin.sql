-- Ensure legacy users table has columns expected by auth and admin code
ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
