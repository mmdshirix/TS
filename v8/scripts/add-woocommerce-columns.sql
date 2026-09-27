-- Add WooCommerce order tracking columns to chatbots table
ALTER TABLE chatbots 
ADD COLUMN IF NOT EXISTS woocommerce_orders_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS woocommerce_api_url TEXT DEFAULT NULL;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'chatbots' 
AND column_name IN ('woocommerce_orders_enabled', 'woocommerce_api_url');
