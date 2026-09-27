=== Taxel AI Site Builder ===
Contributors: taxel
Tags: ai, site builder, shop, persian, rtl
Requires at least: 5.8
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

«فقط بگو چی می‌خوای بسازیم» — باکس هوشمند ساخت سایت با هوش مصنوعی تاکسل.

== Description ==

این پلاگین یک باکس ورودی زیبا با حس هوش مصنوعی (گرادیان آبی، انیمیشن، تایپ‌رایتر) به سایت وردپرس شما اضافه می‌کند.
کاربر می‌نویسد چه چیزی می‌خواهد (مثلاً «سایت نوبت‌دهی برای مطب پوست»)، پلاگین درخواست را به پلتفرم تاکسل می‌فرستد،
تاکسل نوع سایت را تشخیص می‌دهد، در ۳ مرحله چند سوال کوتاه می‌پرسد و در پایان کاربر را برای دریافت سایت آماده به تاکسل هدایت می‌کند.

* شورت‌کد: `[taxel_builder]` (پارامترها: title, subtitle, placeholder, button, theme=dark|light, compact=1, accent, accent2)
* ابزارک وردپرس
* کاملاً ریسپانسیو و RTL
* ارسال درخواست‌ها از سرور وردپرس (کلید API مخفی می‌ماند) یا مستقیم از مرورگر

== Installation ==

1. پوشه `taxel-ai-builder` را در `wp-content/plugins/` قرار دهید (یا فایل zip را از بخش افزونه‌ها بارگذاری کنید).
2. افزونه را فعال کنید.
3. به «تنظیمات → Taxel AI Builder» بروید، آدرس پلتفرم (مثلاً https://platform-talksell.ir) و کلید API را وارد کنید.
   کلید API را از خروجی دستور `npm run db:setup` پلتفرم یا از جدول `intake_api_keys` بردارید.
4. شورت‌کد `[taxel_builder]` را در صفحه مورد نظر قرار دهید.

== Changelog ==

= 1.0.0 =
* نسخه اولیه: باکس هوشمند، سوالات چندمرحله‌ای، انتقال به تاکسل، پروکسی REST، ابزارک.
