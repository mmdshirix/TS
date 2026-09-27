# راهنمای راه‌اندازی دیتابیس PostgreSQL

این سند نحوه راه‌اندازی و اتصال دیتابیس PostgreSQL به پروژه TalkSell را توضیح می‌دهد.

## پیش‌نیازها

- یک سرور PostgreSQL (نسخه ۱۴ یا بالاتر)
- دسترسی به خط فرمان برای اجرای اسکریپت‌های SQL

## مرحله ۱: ایجاد دیتابیس

ابتدا یک دیتابیس جدید در PostgreSQL خود ایجاد کنید:

```sql
CREATE DATABASE talksell_db;
CREATE USER talksell_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE talksell_db TO talksell_user;
```

## مرحله ۲: تنظیم متغیر محیطی

فایل `.env.local` را در ریشه پروژه ایجاد کنید و مقدار `DATABASE_URL` را تنظیم کنید:

```env
DATABASE_URL="postgresql://talksell_user:your_password@localhost:5432/talksell_db?sslmode=require"
```

برای اتصال به سرور راه دور (مثلاً چابکان):

```env
DATABASE_URL="postgresql://username:password@host:port/database_name?sslmode=require"
```

## مرحله ۳: راه‌اندازی خودکار جداول

پروژه به‌صورت خودکار جداول را هنگام اولین اجرا ایجاد می‌کند. برای راه‌اندازی دستی:

```bash
# اجرای تمام اسکریپت‌های SQL به ترتیب
node scripts/run-migrations.js
```

این اسکریپت تمام فایل‌های `.sql` در پوشه `scripts/` را اجرا می‌کند.

### راه‌اندازی از طریق API

همچنین می‌توانید از مسیر `/api/database/setup` برای راه‌اندازی دیتابیس از طریق مرورگر استفاده کنید.

## مرحله ۴: ساختار جداول

پروژه دارای جداول زیر است (ایجاد خودکار توسط `lib/db.ts`):

- `chatbots` — تنظیمات و پیکربندی چت‌بات‌ها
- `users` — کاربران سامانه
- `user_sessions` — نشست‌های کاربران
- `chatbot_messages` — پیام‌های چت‌بات
- `chatbot_faqs` — سوالات متداول
- `chatbot_products` — محصولات قابل推荐
- `chatbot_options` — گزینه‌های ناوبری چت‌بات
- `tickets` — تیکت‌های پشتیبانی
- `ticket_responses` — پاسخ‌های تیکت
- `chatbot_admin_users` — مدیران هر چت‌بات
- `chatbot_admin_sessions` — نشست مدیران
- `chatbot_knowledge_base` — پایگاه دانش
- `subscription_plans` — پلن‌های اشتراک
- `user_subscriptions` — اشتراک کاربران

## رفع مشکل اتصال

### خطای `ECONNREFUSED`

پورت و هاست را بررسی کنید. اگر از Docker استفاده می‌کنید، مطمئن شوید شبکه `bridge` فعال است.

### خطای `no pg_hba.conf entry`

به سرور PostgreSQL خود اجازه اتصال از راه دور را بدهید:

```sql
-- در فایل postgresql.conf
listen_addresses = '*'

-- در فایل pg_hba.conf
host all all 0.0.0.0/0 md5
```

### خطای SSL

اگر سرور شما نیاز به SSL دارد، از `sslmode=require` در URL استفاده کنید. اگر SSL نیاز نیست، از `sslmode=disable` استفاده کنید:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=disable"
```
