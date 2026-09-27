-- Add stats multiplier field to chatbots table
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS stats_multiplier DECIMAL(10,2) DEFAULT 1.0;

-- Update existing chatbots to have default multiplier
UPDATE chatbots SET stats_multiplier = 1.0 WHERE stats_multiplier IS NULL;

-- Add some sample data if tables are empty
INSERT INTO chatbots (name, primary_color, text_color, background_color, chat_icon, position, welcome_message, navigation_message, stats_multiplier) 
VALUES 
('چت‌بات فروشگاه تکنولوژی', '#2563EB', '#1F2937', '#FFFFFF', '🤖', 'bottom-right', 'سلام! به فروشگاه تکنولوژی خوش آمدید', 'چطور می‌توانم کمکتان کنم؟', 1.0),
('چت‌بات پشتیبانی', '#10B981', '#1F2937', '#FFFFFF', '💬', 'bottom-right', 'سلام! تیم پشتیبانی در خدمت شماست', 'چه مشکلی دارید؟', 2.0),
('چت‌بات فروش', '#F59E0B', '#1F2937', '#FFFFFF', '🛒', 'bottom-right', 'سلام! برای خرید کمک می‌خواهید؟', 'چه محصولی می‌خواهید؟', 1.5)
ON CONFLICT (id) DO UPDATE SET 
  stats_multiplier = EXCLUDED.stats_multiplier;

-- Add sample messages for chatbot 1
INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent) VALUES
(1, 'سلام، چطور می‌توانم محصولات شما را خریداری کنم؟', 'سلام! از فروشگاه آنلاین ما می‌توانید خرید کنید. لینک فروشگاه: shop.example.com', '192.168.1.1', 'Mozilla/5.0'),
(1, 'آیا ارسال رایگان دارید؟', 'بله، برای خریدهای بالای 500 هزار تومان ارسال رایگان است.', '192.168.1.2', 'Mozilla/5.0'),
(1, 'چه محصولاتی دارید؟', 'ما انواع گوشی هوشمند، لپ‌تاپ، تبلت و لوازم جانبی داریم.', '192.168.1.3', 'Mozilla/5.0'),
(1, 'قیمت گوشی آیفون چقدر است؟', 'قیمت آیفون‌ها از 25 میلیون تومان شروع می‌شود. برای مشاهده قیمت دقیق به فروشگاه مراجعه کنید.', '192.168.1.1', 'Mozilla/5.0'),
(1, 'آیا گارانتی دارید؟', 'بله، تمام محصولات ما دارای گارانتی معتبر هستند.', '192.168.1.4', 'Mozilla/5.0'),
(1, 'نحوه پرداخت چگونه است؟', 'می‌توانید با کارت بانکی، درگاه پرداخت آنلاین یا پرداخت در محل پرداخت کنید.', '192.168.1.2', 'Mozilla/5.0'),
(1, 'زمان ارسال چقدر است؟', 'معمولاً 2 تا 3 روز کاری طول می‌کشد.', '192.168.1.5', 'Mozilla/5.0'),
(1, 'آیا امکان مرجوعی وجود دارد؟', 'بله، تا 7 روز پس از خرید امکان مرجوعی وجود دارد.', '192.168.1.3', 'Mozilla/5.0');

-- Add sample messages for other chatbots
INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent) VALUES
(2, 'مشکل در ورود به حساب کاربری', 'لطفاً رمز عبور خود را بازنشانی کنید.', '192.168.1.6', 'Mozilla/5.0'),
(2, 'سایت کند است', 'مشکل بررسی و حل خواهد شد.', '192.168.1.7', 'Mozilla/5.0'),
(3, 'محصول مورد نظر موجود نیست', 'به زودی موجود خواهد شد.', '192.168.1.8', 'Mozilla/5.0'),
(3, 'تخفیف دارید؟', 'بله، تخفیف‌های ویژه داریم.', '192.168.1.9', 'Mozilla/5.0');

-- Add sample tickets
INSERT INTO tickets (chatbot_id, subject, message, status, priority, user_ip) VALUES
(1, 'مشکل در پرداخت', 'نمی‌توانم پرداخت کنم', 'open', 'high', '192.168.1.1'),
(1, 'سوال درباره محصول', 'آیا این محصول موجود است؟', 'closed', 'medium', '192.168.1.2'),
(1, 'درخواست مرجوعی', 'می‌خواهم محصول را مرجوع کنم', 'in_progress', 'medium', '192.168.1.3'),
(2, 'مشکل فنی', 'سایت کار نمی‌کند', 'open', 'high', '192.168.1.4'),
(3, 'پیشنهاد بهبود', 'پیشنهاد برای بهبود سایت', 'closed', 'low', '192.168.1.5');

-- Ensure we have admin users for testing
INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email) VALUES
(1, 'admin1', '$2b$10$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q', 'Admin 1', 'admin1@example.com'),
(2, 'admin2', '$2b$10$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q', 'Admin 2', 'admin2@example.com'),
(3, 'admin3', '$2b$10$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q', 'Admin 3', 'admin3@example.com')
ON CONFLICT (chatbot_id, username) DO NOTHING;

SELECT 'Sample data added successfully!' as result;
