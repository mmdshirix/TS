import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import SeoSettingsForm from "@/components/seo-settings-form"

export const dynamic = "force-dynamic"

export default async function SeoPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const store = await getStoreByUserId(user.id)
  if (!store) redirect("/dashboard/store/create")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">تنظیمات سئو</h1>
        <p className="text-gray-600 mt-1">بهینه‌سازی سایت برای گوگل: عنوان، توضیحات، تصویر اشتراک‌گذاری، نقشه سایت و داده ساختاریافته</p>
      </div>
      <SeoSettingsForm storeSlug={store.slug} />
    </div>
  )
}
