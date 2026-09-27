import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, CheckCircle2 } from "lucide-react"

export default function WordPressPluginInfo() {
  return (
    <Card className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.469 2.825L12 12.294 2.531 2.825 12 2.825l9.469 0zm-18.938 18.35L12 12.706l9.469 9.469L12 21.175l-9.469 0zm0-18.35L12 12.294V2.825L2.531 2.825zm18.938 0L12 12.294V2.825l9.469 0z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl text-purple-900">افزونه وردپرس TalkSell</CardTitle>
            <CardDescription className="text-purple-700">
              برای اتصال، دریافت و به‌روزرسانی خودکار محصولات و قیمت‌ها
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl border-2 border-blue-200 bg-white/90 p-5 space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="font-bold text-blue-900">افزونه «Taxel AI Builder» (جدید)</div>
              <div className="text-sm text-blue-700">باکس «فقط بگو چی می‌خوای بسازیم» با شورت‌کد <code className="bg-blue-50 px-1 rounded">[taxel_builder]</code> — بازدیدکننده سایت وردپرس شما را در چند کلیک به یک سایت آماده روی تاکسل می‌رساند.</div>
            </div>
            <a href="https://github.com/mmdshirix/ts/tree/main/v8/wordpress-plugin/taxel-ai-builder" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-bold">
              <Download className="w-4 h-4" /> دریافت افزونه
            </a>
          </div>
          <p className="text-xs text-blue-700">پوشه <code>v8/wordpress-plugin/taxel-ai-builder</code> را zip کنید و در وردپرس نصب نمایید؛ سپس آدرس پلتفرم و کلید API را در تنظیمات افزونه وارد کنید.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-100 shadow-inner">
          <p className="text-purple-900 font-medium mb-4">با نصب افزونه، چت‌بات به اطلاعات زیر دسترسی پیدا می‌کند:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["ارسال خودکار محصولات", "نمایش قیمت و ویژگی‌ها", "به‌روزرسانی لحظه‌ای", "پیگیری سفارشات مشتری"].map(
              (feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-purple-50 rounded-xl p-3 border border-purple-200"
                >
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm text-purple-900 font-medium">{feature}</span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <a
              href="https://talksell.ir/wp-content/uploads/2025/12/talksell.zip"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="ml-2 h-5 w-5" />
              دانلود افزونه TalkSell
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-2xl border-2 border-purple-300 hover:bg-purple-50 py-6 text-lg bg-white/50 backdrop-blur-sm"
          >
            <a
              href="https://talksell.ir/2025/12/23/%d8%a2%d9%85%d9%88%d8%b2%d8%b4-%d9%86%d8%b5%d8%a8-%d8%aa%d8%a7%da%a9%d8%b3%d9%84-%d8%a7%d8%b6%d8%a7%d9%81%d9%87-%da%a9%d8%b1%d8%af%d9%86-%d9%87%d9%88%d8%b4-%d9%85%d8%b5%d9%86%d9%88%d8%b9%db%8c-%d8%aa/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="ml-2 h-5 w-5" />
              آموزش نصب و راه‌اندازی
            </a>
          </Button>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-5 border-2 border-purple-200">
          <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            مراحل نصب
          </h4>
          <ol className="space-y-2 text-sm text-purple-900">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>فایل ZIP افزونه را دانلود کنید</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>از پنل وردپرس به بخش افزونه‌ها &gt; افزودن افزونه جدید بروید</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>فایل ZIP را آپلود و فعال کنید</span>
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
