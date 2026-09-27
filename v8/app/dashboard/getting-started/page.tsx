import Link from "next/link"
import { redirect } from "next/navigation"
import { Store, Palette, Package, CreditCard, Bot, Search, Globe, Instagram, ArrowLeft, Sparkles, CalendarDays, Pill, PlayCircle } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { getStoreKind } from "@/lib/store-categories"
import GettingStarted from "@/components/onboarding/getting-started"
import { StartTourButton } from "@/components/onboarding/tour"

export const dynamic = "force-dynamic"

export default async function GettingStartedPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const store = await getStoreByUserId(user.id)
  const kind = getStoreKind(store?.category)

  const steps = [
    { icon: Store, title: "۱. ساخت سایت / فروشگاه", href: "/dashboard/store/create", body: "روی «ساخت فروشگاه» بزنید. نام و توضیح کوتاه بنویسید، سپس قالب مناسب کسب‌وکارتان را انتخاب کنید: پوشاک، آرایشی، اکسسوری، کیف و کفش، عطر، موبایل، مطب پزشکی یا داروخانه. هر قالب طراحی اختصاصی و محصولات نمونه دارد تا از روز اول زیبا باشد.", tip: "چت‌بات هوشمند شما به‌صورت خودکار همراه فروشگاه ساخته می‌شود." },
    { icon: Palette, title: "۲. برندینگ", href: "/dashboard/store/settings", body: "لوگو، فاوآیکون، رنگ اصلی و ثانویه، شماره تماس، آدرس و لینک شبکه‌های اجتماعی را وارد کنید. همه این‌ها در سایت، فوتر و کارت‌های اشتراک‌گذاری استفاده می‌شوند.", tip: "لوگوی مربعی با پس‌زمینه شفاف بهترین نتیجه را می‌دهد." },
    kind === "clinic"
      ? { icon: CalendarDays, title: "۳. پزشکان و نوبت‌دهی", href: "/dashboard/store/clinic", body: "پزشکان، تخصص، هزینه ویزیت و برنامه هفتگی هر پزشک را ثبت کنید. نوبت‌های خالی به‌صورت خودکار در تقویم شمسی سایت نمایش داده می‌شوند و بیمار می‌تواند آنلاین پرداخت کند.", tip: "کلیدواژه‌های علائم را برای هر پزشک بنویسید تا راهنمای هوشمند دقیق‌تر ارجاع دهد." }
      : kind === "pharmacy"
        ? { icon: Pill, title: "۳. محصولات و نسخه آنلاین", href: "/dashboard/store/pharmacy", body: "محصولات بدون نسخه، مکمل‌ها و کالاهای بهداشتی را اضافه کنید و در بخش داروخانه، پذیرش نسخه آنلاین، ارسال در محل و داروساز هوشمند را تنظیم کنید.", tip: "نام داروساز مسئول و شماره پروانه اعتماد مشتری را بالا می‌برد." }
        : { icon: Package, title: "۳. محصولات و دسته‌بندی‌ها", href: "/dashboard/store/products", body: "محصولات را با تصویر باکیفیت، قیمت، توضیحات و دسته‌بندی اضافه کنید. محصولات به‌صورت خودکار به پایگاه دانش چت‌بات اضافه می‌شوند تا دستیار هوشمند بتواند آن‌ها را پیشنهاد دهد.", tip: "برای هر محصول حداقل ۶۰ کاراکتر توضیح بنویسید؛ سئو و چت‌بات هر دو بهتر کار می‌کنند." },
    { icon: CreditCard, title: "۴. درگاه پرداخت", href: "/dashboard/store/payments", body: "زرین‌پال (کد مرچنت)، بله‌پی (توکن ربات) یا کارت به کارت (شماره کارت و شبا) را فعال کنید. هر درگاه فعال به‌صورت خودکار در صفحه پرداخت نمایش داده می‌شود.", tip: "کارت به کارت سریع‌ترین راه شروع است؛ مشتری فیش را بارگذاری می‌کند و شما تایید می‌کنید." },
    { icon: Bot, title: "۵. آموزش چت‌بات", href: "/dashboard/knowledge-base", body: "سوالات متداول، ساعات کاری، شرایط ارسال و بازگشت را در پایگاه دانش وارد کنید. لحن پاسخ‌دهی (دوستانه، حرفه‌ای، مختصر) را از داشبورد تغییر دهید.", tip: "هر چه پایگاه دانش کامل‌تر باشد، پاسخ‌ها دقیق‌تر و فروش بیشتر است." },
    { icon: Search, title: "۶. سئو", href: "/dashboard/store/seo", body: "عنوان و توضیحات متا، کلمات کلیدی و تصویر اشتراک‌گذاری را تنظیم کنید. نقشه سایت، robots.txt و داده ساختاریافته به‌صورت خودکار ساخته می‌شوند. امتیاز سئو را دنبال کنید تا به بالای ۸۰ برسد.", tip: "از دکمه «پیشنهاد هوشمند» برای تولید متای بهینه استفاده کنید." },
    { icon: Globe, title: "۷. انتشار", href: "/dashboard/store/publish", body: "پیش‌نمایش موبایل و دسکتاپ را ببینید و روی «انتشار» بزنید. سایت شما روی زیردامنه اختصاصی در دسترس قرار می‌گیرد.", tip: "لینک سایت را در بیو اینستاگرام قرار دهید." },
    { icon: Instagram, title: "۸. اتوماسیون اینستاگرام", href: "/dashboard/instagram", body: "نام پیج را وارد کنید و دسترسی بدهید. ورک‌فلوهای کلیدواژه‌ای (مثلاً «قیمت» → ارسال کارت محصول) بسازید و بگذارید دستیار هوشمند باقی دایرکت‌ها را با دانش فروشگاه پاسخ دهد.", tip: "پیج باید Business یا Creator باشد و به یک صفحه فیسبوک متصل شود." },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-600"><Sparkles className="w-4 h-4" /> آموزش قدم‌به‌قدم</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">راه‌اندازی تاکسل در ۸ قدم</h1>
          <p className="text-gray-600 mt-1">از ساخت سایت تا اتوماسیون اینستاگرام؛ هر قدم را با یک کلیک انجام دهید.</p>
        </div>
        <StartTourButton className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-bold shadow-lg shadow-blue-500/30" />
      </div>

      <GettingStarted compact />

      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-3xl border bg-white p-5 sm:p-6 grid sm:grid-cols-[56px_1fr_auto] gap-4 items-start">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white grid place-items-center shadow-lg shadow-blue-500/20"><s.icon className="w-6 h-6" /></div>
            <div>
              <h2 className="font-black text-gray-900 text-lg">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-7 mt-1">{s.body}</p>
              <p className="text-xs text-blue-700 bg-blue-50 rounded-xl px-3 py-2 mt-3 inline-flex items-center gap-2"><PlayCircle className="w-4 h-4" /> نکته: {s.tip}</p>
            </div>
            <Link href={s.href} className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm text-gray-800 hover:border-blue-400 hover:text-blue-700 whitespace-nowrap">شروع <ArrowLeft className="w-4 h-4" /></Link>
          </li>
        ))}
      </ol>

      <div className="rounded-3xl border bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 sm:p-8">
        <h3 className="text-xl font-black">سوالی دارید؟</h3>
        <p className="text-white/70 text-sm mt-1 leading-7">مستندات کامل (پیامک، بله، درگاه‌ها و پلاگین وردپرس) در بخش «مستندات و آموزش‌ها» موجود است. همچنین دستیار برنامه‌نویس هوشمند در بخش دستیار هوش مصنوعی به سوالات فنی پاسخ می‌دهد.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard/docs" className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-bold">مستندات</Link>
          <Link href="/dashboard/ai-assistant" className="rounded-full border border-white/30 px-4 py-2 text-sm">دستیار هوش مصنوعی</Link>
        </div>
      </div>
    </div>
  )
}
