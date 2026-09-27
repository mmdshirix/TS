# راهنمای اتصال اینستاگرام (اتوماسیون دایرکت)

تاکسل با استفاده از **Instagram Messaging API** (بخشی از Meta Graph API) به دایرکت‌های پیج شما پاسخ می‌دهد. برای این کار، یک‌بار باید یک اپ در Meta for Developers بسازید و مشخصات آن را در متغیرهای محیطی سرور قرار دهید. کاربران شما بعد از آن فقط نام پیج را وارد می‌کنند و روی «اتصال» می‌زنند.

## پیش‌نیازهای پیج کاربر

1. پیج اینستاگرام باید **Professional (Business یا Creator)** باشد.
2. پیج به یک **Facebook Page** متصل باشد (Instagram → Settings → Business tools and controls → Connect a Facebook Page).
3. در تنظیمات پیج: Settings → Messages and story replies → Message controls → **Allow access to messages** فعال باشد.

## ساخت اپ در Meta (یک‌بار برای پلتفرم)

1. به https://developers.facebook.com/apps بروید و **Create App** → نوع **Business** را انتخاب کنید.
2. محصول **Messenger** را اضافه کنید و در بخش *Instagram settings* پیج تست خود را وصل کنید.
3. در **App settings → Basic**، مقدار `App ID` و `App Secret` را بردارید.
4. در **Facebook Login → Settings → Valid OAuth Redirect URIs** این آدرس را اضافه کنید:
   ```
   https://platform-talksell.ir/api/instagram/callback
   ```
5. در **Messenger → Instagram settings → Webhooks**:
   - Callback URL: `https://platform-talksell.ir/api/instagram/webhook`
   - Verify token: همان مقدار `INSTAGRAM_VERIFY_TOKEN` (پیش‌فرض `taxel-instagram-verify`)
   - فیلدها: `messages`, `messaging_postbacks`, `message_reactions`
6. مجوزهای زیر را در **App Review** درخواست کنید (برای انتشار عمومی):
   `instagram_basic`, `instagram_manage_messages`, `pages_show_list`, `pages_manage_metadata`, `pages_messaging`, `business_management`
   *تا زمان تایید، فقط اکانت‌های نقش‌دار در اپ (Admin/Developer/Tester) می‌توانند متصل شوند.*

## متغیرهای محیطی

در `deploy/platform.env` (یا `.env.local`) مقداردهی کنید:

```
META_APP_ID=...
META_APP_SECRET=...
INSTAGRAM_VERIFY_TOKEN=taxel-instagram-verify
INSTAGRAM_TOKEN_ENCRYPTION_KEY=<یک رشته تصادفی ۳۲ کاراکتری>
APP_URL=https://platform-talksell.ir
```

توکن‌های دسترسی صفحه با AES-256-GCM و کلید بالا در دیتابیس رمزنگاری می‌شوند.

## جریان کار برای کاربر

1. داشبورد → **اتوماسیون اینستاگرام** → نام پیج را وارد می‌کند → «اتصال».
2. به صفحه Facebook Login منتقل می‌شود و دسترسی می‌دهد.
3. تاکسل صفحه فیسبوک متصل به آن پیج را پیدا می‌کند، وب‌هوک را فعال می‌کند و توکن را ذخیره می‌کند.
4. از این لحظه هر دایرکت جدید:
   - اگر اولین پیام کاربر باشد → ورک‌فلو **خوش‌آمد** (اگر تعریف شده)
   - اگر با کلیدواژه‌ای مطابقت داشت → مراحل آن ورک‌فلو (متن / تصویر / کارت محصول / ویس / تاخیر / ارجاع به ادمین)
   - اگر کلیدواژه ارجاع (مثلاً «ادمین») بود → هوش مصنوعی برای آن گفتگو متوقف و پیام «به‌زودی پاسخ می‌دهیم» ارسال می‌شود
   - در غیر این صورت → **دستیار هوشمند** با پایگاه دانش چت‌بات و محصولات فروشگاه پاسخ می‌دهد و در صورت نیاز کارت محصول می‌فرستد
5. همه گفتگوها در بخش «گفتگوها» قابل مشاهده‌اند و می‌توان AI را برای یک گفتگو خاص متوقف/فعال کرد.

## شبیه‌ساز

بدون اتصال واقعی هم می‌توانید در تب «شبیه‌ساز» یک پیام تایپ کنید و ببینید کدام ورک‌فلو اجرا می‌شود و دستیار هوشمند چه پاسخی می‌دهد. هیچ پیامی ارسال نمی‌شود.

## محدودیت‌ها و نکات

- پنجره پاسخ استاندارد Meta ۲۴ ساعت است؛ پیام‌های پس از آن باید با تگ‌های مجاز ارسال شوند.
- توکن صفحه معمولاً بلندمدت است ولی ممکن است با تغییر رمز یا مجوزها باطل شود؛ در این حالت وضعیت اتصال «خطا» می‌شود و کاربر باید دوباره وصل کند.
- برای فایل صوتی (ویس) از فرمت `mp3`/`m4a` با لینک عمومی HTTPS استفاده کنید.
