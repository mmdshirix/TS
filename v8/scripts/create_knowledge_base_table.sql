-- Create knowledge base table for storing chatbot knowledge
CREATE TABLE IF NOT EXISTS chatbot_knowledge_base (
  id SERIAL PRIMARY KEY,
  chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('url', 'text', 'product', 'faq')),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kb_chatbot_id ON chatbot_knowledge_base(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_kb_type ON chatbot_knowledge_base(type);
CREATE INDEX IF NOT EXISTS idx_kb_created_at ON chatbot_knowledge_base(created_at);
