-- Create subscription_plans table to store plan configurations.
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    billing_period VARCHAR(20) DEFAULT 'monthly',
    message_limit INTEGER DEFAULT -1,
    product_limit INTEGER DEFAULT -1,
    duration_days INTEGER DEFAULT 30,
    response_speed VARCHAR(50) DEFAULT 'normal',
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 0,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    icon_name VARCHAR(50) DEFAULT 'Gift',
    color VARCHAR(50) DEFAULT 'purple',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE subscription_plans
    ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) DEFAULT 'monthly',
    ADD COLUMN IF NOT EXISTS message_limit INTEGER DEFAULT -1,
    ADD COLUMN IF NOT EXISTS product_limit INTEGER DEFAULT -1,
    ADD COLUMN IF NOT EXISTS response_speed VARCHAR(50) DEFAULT 'normal',
    ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY[]::TEXT[];

INSERT INTO subscription_plans (
    name, description, price, billing_period, message_limit, product_limit,
    duration_days, response_speed, is_popular, position, features, icon_name, color
)
SELECT
    'رایگان',
    'مناسب برای شروع کار با امکانات پایه',
    0,
    'monthly',
    100,
    5,
    30,
    'slow',
    FALSE,
    1,
    ARRAY['100 پیام در ماه', '5 محصول', 'پشتیبانی ایمیل', 'سرعت پاسخ‌دهی عادی'],
    'Gift',
    'gray'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'رایگان');

INSERT INTO subscription_plans (
    name, description, price, billing_period, message_limit, product_limit,
    duration_days, response_speed, is_popular, position, features, icon_name, color
)
SELECT
    'حرفه‌ای',
    'برای کسب‌وکارهای در حال رشد با قابلیت‌های بیشتر',
    79900,
    'monthly',
    1000,
    50,
    30,
    'normal',
    TRUE,
    2,
    ARRAY['1000 پیام در ماه', '50 محصول', 'پشتیبانی 24/7', 'سرعت پاسخ‌دهی سریع', 'تحلیل رفتار کاربران'],
    'Zap',
    'purple'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'حرفه‌ای');

INSERT INTO subscription_plans (
    name, description, price, billing_period, message_limit, product_limit,
    duration_days, response_speed, is_popular, position, features, icon_name, color
)
SELECT
    'پیشرفته',
    'برای کسب‌وکارهای بزرگ با نیاز به امکانات نامحدود',
    199900,
    'monthly',
    -1,
    -1,
    30,
    'fast',
    FALSE,
    3,
    ARRAY['پیام نامحدود', 'محصول نامحدود', 'پشتیبانی اختصاصی', 'سرعت پاسخ‌دهی فوری', 'API اختصاصی', 'گزارش‌های پیشرفته'],
    'Crown',
    'gradient'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'پیشرفته');

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
