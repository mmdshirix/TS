import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import InstagramManager from "@/components/instagram-manager"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function InstagramPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const store = await getStoreByUserId(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">اتوماسیون اینستاگرام</h1>
        <p className="text-gray-600 mt-1">پاسخ خودکار به دایرکت‌ها با ورک‌فلوهای کلیدواژه‌ای و دستیار هوشمند متصل به فروشگاه شما</p>
      </div>
      {!store ? (
        <div className="rounded-3xl border bg-white p-10 text-center space-y-3">
          <p className="text-gray-600">برای فعال کردن اتوماسیون اینستاگرام ابتدا سایت/فروشگاه خود را بسازید؛ دستیار هوشمند از محصولات و پایگاه دانش آن استفاده می‌کند.</p>
          <Link href="/dashboard/store/create" className="inline-flex rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-bold">ساخت فروشگاه</Link>
        </div>
      ) : (
        <Suspense fallback={null}>
          <InstagramManager storeSlug={store.slug} />
        </Suspense>
      )}
    </div>
  )
}
