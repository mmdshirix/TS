-- Create admin users table
CREATE TABLE IF NOT EXISTS chatbot_admin_users (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL,
    username VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    UNIQUE(chatbot_id, username)
);

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS chatbot_admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES chatbot_admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_chatbot_id ON chatbot_admin_users(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON chatbot_admin_users(chatbot_id, username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON chatbot_admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON chatbot_admin_sessions(expires_at);
