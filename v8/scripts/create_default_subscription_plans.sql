-- Create 3 default subscription plans with Persian names and Toman pricing

-- Plan 1: Basic/Starter Plan
INSERT INTO subscription_plans (
  name,
  description,
  price,
  billing_period,
  duration_days,
  message_limit,
  product_limit,
  response_speed,
  is_popular,
  is_active,
  features,
  icon_name,
  color,
  position
) VALUES (
  'پایه',
  'مناسب برای افراد و کسب‌وکارهای کوچک که تازه شروع کرده‌اند',
  299000,
  'monthly',
  30,
  1000,
  10,
  'استاندارد',
  false,
  true,
  ARRAY['۱,۰۰۰ پیام در ماه', '۱۰ محصول', 'سرعت پاسخ‌دهی استاندارد', 'پشتیبانی ایمیلی', 'پایگاه دانش محدود'],
  'Sparkles',
  'blue',
  1
);

-- Plan 2: Professional Plan (Most Popular)
INSERT INTO subscription_plans (
  name,
  description,
  price,
  billing_period,
  duration_days,
  message_limit,
  product_limit,
  response_speed,
  is_popular,
  is_active,
  features,
  icon_name,
  color,
  position
) VALUES (
  'حرفه‌ای',
  'کسب‌وکار خود را با ویژگی‌های پیشرفته به سطح بعدی ببرید',
  799000,
  'monthly',
  30,
  10000,
  50,
  'بالا',
  true,
  true,
  ARRAY['۱۰,۰۰۰ پیام در ماه', '۵۰ محصول', 'سرعت پاسخ‌دهی بالا', 'پشتیبانی اولویت‌دار', 'پایگاه دانش نامحدود', 'تحلیل رفتار کاربران', 'گزارش‌های پیشرفته'],
  'Zap',
  'purple',
  2
);

-- Plan 3: Exclusive Plan (Contact Sales)
INSERT INTO subscription_plans (
  name,
  description,
  price,
  billing_period,
  duration_days,
  message_limit,
  product_limit,
  response_speed,
  is_popular,
  is_active,
  features,
  icon_name,
  color,
  position
) VALUES (
  'اختصاصی',
  'راهکار کاملاً سفارشی‌سازی شده برای نیازهای سازمانی',
  -1,
  'custom',
  -1,
  -1,
  -1,
  'فوق سریع',
  false,
  true,
  ARRAY['پیام‌های نامحدود', 'محصولات نامحدود', 'سریع‌ترین سرعت پاسخ‌دهی', 'پشتیبانی ۲۴/۷ اختصاصی', 'پایگاه دانش نامحدود', 'مدیریت چند کاربره', 'سفارشی‌سازی کامل رابط کاربری', 'یکپارچه‌سازی اختصاصی', 'مشاور تخصصی اختصاصی', 'گزارش‌های سفارشی'],
  'Crown',
  'gradient',
  3
);
