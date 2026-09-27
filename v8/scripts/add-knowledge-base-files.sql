-- Add file storage capability to knowledge base
ALTER TABLE chatbot_knowledge_base ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE chatbot_knowledge_base ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE chatbot_knowledge_base ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);
ALTER TABLE chatbot_knowledge_base ADD COLUMN IF NOT EXISTS extracted_text TEXT;
